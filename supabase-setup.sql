-- Blox Blast Mini: akun pemain, penyimpanan cloud, papan peringkat, dan panel admin (versi 4)
-- Jalankan SELURUH isi file ini sekali di Supabase: SQL Editor > New query > Run.
-- Aman dijalankan ulang. Skor lama dari versi sebelumnya (tanpa akun) tidak ikut tampil di papan peringkat baru.

-- ============ 0) Bersihkan objek versi lama yang bergantung pada kolom lama ============
drop view if exists public.leaderboard;
drop view if exists public.leaderboard_best;
drop function if exists public.submit_score(uuid, text, text, date, int, int, int, int);
drop function if exists public.report_score(bigint, uuid);
drop function if exists public.delete_my_data(uuid);

-- ============ 1) Tabel ============
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text not null,
  role       text not null default 'player' check (role in ('player', 'admin')),
  banned     boolean not null default false,
  ban_reason text,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_username_lower on public.profiles (lower(username));

create table if not exists public.saves (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null check (octet_length(data::text) <= 60000),
  updated_at timestamptz not null default now()
);

create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  mode       text not null check (mode in ('daily', 'timed')),
  day        date not null,
  score      int  not null check (score between 0 and 100000),
  moves      int,
  lines      int,
  secs       int,
  hidden     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Migrasi dari versi lama (berbasis perangkat)
alter table public.scores add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.scores add column if not exists moves  int;
alter table public.scores add column if not exists lines  int;
alter table public.scores add column if not exists secs   int;
alter table public.scores add column if not exists hidden boolean not null default false;
alter table public.scores drop constraint if exists scores_device_mode_day_key;
alter table public.scores drop column if exists device;
alter table public.scores drop column if exists name;
create unique index if not exists scores_user_mode_day on public.scores (user_id, mode, day);

create table if not exists public.reports (
  id         bigint generated always as identity primary key,
  score_id   bigint not null references public.scores(id) on delete cascade,
  reporter   uuid   not null,
  created_at timestamptz not null default now(),
  unique (score_id, reporter)
);

create table if not exists public.admin_log (
  id         bigint generated always as identity primary key,
  admin_id   uuid,
  action     text not null,
  target     text,
  details    jsonb,
  created_at timestamptz not null default now()
);

-- Semua tabel terkunci: tidak ada akses langsung, hanya lewat fungsi di bawah.
alter table public.profiles  enable row level security;
alter table public.saves     enable row level security;
alter table public.scores    enable row level security;
alter table public.reports   enable row level security;
alter table public.admin_log enable row level security;
revoke all on public.profiles, public.saves, public.scores, public.reports, public.admin_log from anon, authenticated;

-- ============ 2) Profil otomatis saat pendaftaran ============
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  want  text := trim(coalesce(new.raw_user_meta_data->>'username', ''));
  uname text;
  tries int := 0;
begin
  if want ~ '^[A-Za-z0-9 _.-]{3,16}$'
     and lower(want) !~ '(kontol|memek|ngentot|jembut|pepek|bangsat|bajingan|anjing|jancok|jancuk|fuck|shit|bitch|cunt|nigg|porn)'
  then uname := want; else uname := 'Pemain' || (floor(random() * 9000) + 1000)::int; end if;
  while exists (select 1 from public.profiles where lower(username) = lower(uname)) and tries < 20 loop
    uname := 'Pemain' || (floor(random() * 90000) + 10000)::int;
    tries := tries + 1;
  end loop;
  insert into public.profiles (id, username) values (new.id, uname);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Akun yang sudah ada sebelum trigger dibuat
insert into public.profiles (id, username)
  select id, 'Pemain' || substr(replace(id::text, '-', ''), 1, 6) from auth.users
  on conflict do nothing;

-- ============ 3) Fungsi pemain ============
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and not banned);
$$;

create or replace function public.require_admin() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'akses ditolak'; end if;
end;
$$;

create or replace function public.log_admin(p_action text, p_target text, p_details jsonb) returns void
language sql security definer set search_path = public as $$
  insert into public.admin_log (admin_id, action, target, details) values (auth.uid(), p_action, p_target, p_details);
$$;

create or replace function public.username_available(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(trim(p_name)));
$$;

create or replace function public.my_profile() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('username', username, 'role', role, 'banned', banned)
  from public.profiles where id = auth.uid();
$$;

create or replace function public.cloud_load() returns jsonb
language sql stable security definer set search_path = public as $$
  select data from public.saves where user_id = auth.uid();
$$;

create or replace function public.cloud_save(p_data jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'harus masuk akun'; end if;
  if exists (select 1 from public.profiles where id = auth.uid() and banned) then raise exception 'akun diblokir'; end if;
  insert into public.saves (user_id, data) values (auth.uid(), p_data)
  on conflict (user_id) do update set data = excluded.data, updated_at = now();
end;
$$;

create or replace function public.submit_score(
  p_mode text, p_day date, p_score int, p_moves int, p_lines int, p_secs int
) returns void
language plpgsql security definer set search_path = public as $$
declare
  uid         uuid := auth.uid();
  isbanned    boolean;
  maxs        int := case p_mode when 'daily' then 20000 else 6000 end;  -- batas mutlak, boleh kamu ubah
  max_by_play int;
begin
  if uid is null then raise exception 'harus masuk akun'; end if;
  select banned into isbanned from public.profiles where id = uid;
  if isbanned is null then raise exception 'profil tidak ditemukan'; end if;
  if isbanned then raise exception 'akun diblokir'; end if;
  if p_mode not in ('daily', 'timed') then raise exception 'mode tidak valid'; end if;
  if p_day is null or abs(p_day - (now() at time zone 'utc')::date) > 1 then raise exception 'tanggal tidak valid'; end if;
  if p_score is null or p_score < 0 or p_score > maxs then raise exception 'skor tidak valid'; end if;

  -- Data permainan harus masuk akal dan konsisten dengan skor
  if p_moves is null or p_lines is null or p_secs is null then raise exception 'data permainan tidak lengkap'; end if;
  if p_moves < 1 or p_moves > 600 then raise exception 'jumlah langkah tidak valid'; end if;
  if p_lines < 0 or p_lines > p_moves * 6 then raise exception 'jumlah garis tidak valid'; end if;
  if p_secs < 3 or p_secs > 3600 then raise exception 'durasi tidak valid'; end if;
  if p_moves > p_secs / 0.3 + 3 then raise exception 'terlalu cepat'; end if;
  if p_mode = 'timed' and p_secs > 95 + 3 * p_lines then raise exception 'durasi melebihi jatah waktu'; end if;
  max_by_play := 9 * p_moves + 60 * p_lines + 5 * p_lines * (p_lines + 1) + 400;
  if p_score > max_by_play then raise exception 'skor tidak sesuai permainan'; end if;

  insert into public.scores (user_id, mode, day, score, moves, lines, secs)
  values (uid, p_mode, p_day, p_score, p_moves, p_lines, p_secs)
  on conflict (user_id, mode, day) do update
    set moves = case when excluded.score > public.scores.score then excluded.moves else public.scores.moves end,
        lines = case when excluded.score > public.scores.score then excluded.lines else public.scores.lines end,
        secs  = case when excluded.score > public.scores.score then excluded.secs  else public.scores.secs  end,
        score = greatest(public.scores.score, excluded.score),
        updated_at = now()
    where public.scores.updated_at < now() - interval '5 seconds';
end;
$$;

-- Laporkan skor/nama tidak pantas. Setelah 3 pelapor berbeda, entri disembunyikan otomatis.
create or replace function public.report_score(p_score_id bigint) returns void
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if auth.uid() is null then raise exception 'harus masuk akun'; end if;
  if exists (select 1 from public.profiles where id = auth.uid() and banned) then raise exception 'akun diblokir'; end if;
  if not exists (select 1 from public.scores where id = p_score_id) then raise exception 'data tidak ditemukan'; end if;
  if exists (select 1 from public.scores where id = p_score_id and user_id = auth.uid())
    then raise exception 'tidak bisa melaporkan skor sendiri'; end if;
  insert into public.reports (score_id, reporter) values (p_score_id, auth.uid()) on conflict do nothing;
  select count(*) into n from public.reports where score_id = p_score_id;
  if n >= 3 then update public.scores set hidden = true where id = p_score_id; end if;
end;
$$;

-- Hapus akun sendiri beserta seluruh datanya (profil, simpanan cloud, skor, laporan).
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'harus masuk akun'; end if;
  delete from public.reports where reporter = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

-- ============ 4) Fungsi admin (semuanya memeriksa peran admin di server) ============
create or replace function public.admin_overview() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  return jsonb_build_object(
    'players', (select count(*) from public.profiles),
    'banned',  (select count(*) from public.profiles where banned),
    'admins',  (select count(*) from public.profiles where role = 'admin'),
    'scores',  (select count(*) from public.scores where user_id is not null and not hidden),
    'hidden',  (select count(*) from public.scores where hidden),
    'reports', (select count(distinct score_id) from public.reports)
  );
end;
$$;

create or replace function public.admin_users(p_search text default '', p_limit int default 30) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select p.id, p.username, u.email, p.role, p.banned, p.ban_reason, p.created_at, u.last_sign_in_at
    from public.profiles p join auth.users u on u.id = p.id
    where coalesce(p_search, '') = '' or p.username ilike '%' || p_search || '%' or u.email ilike '%' || p_search || '%'
    order by p.created_at desc
    limit least(coalesce(p_limit, 30), 100)
  ) x), '[]'::jsonb);
end;
$$;

create or replace function public.admin_set_ban(p_user uuid, p_ban boolean, p_reason text default null) returns void
language plpgsql security definer set search_path = public as $$
declare r text;
begin
  perform public.require_admin();
  if p_user = auth.uid() then raise exception 'tidak bisa memblokir diri sendiri'; end if;
  select role into r from public.profiles where id = p_user;
  if r is null then raise exception 'pemain tidak ditemukan'; end if;
  if r = 'admin' and p_ban then raise exception 'cabut peran admin dulu'; end if;
  update public.profiles
     set banned = p_ban, ban_reason = case when p_ban then nullif(trim(coalesce(p_reason, '')), '') else null end
   where id = p_user;
  -- Blokir juga di sistem login: akun tidak bisa masuk atau memperbarui sesi
  update auth.users set banned_until = case when p_ban then now() + interval '100 years' else null end where id = p_user;
  perform public.log_admin(case when p_ban then 'blokir' else 'buka blokir' end, p_user::text, jsonb_build_object('alasan', p_reason));
end;
$$;

create or replace function public.admin_reset_name(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare uname text; tries int := 0;
begin
  perform public.require_admin();
  if not exists (select 1 from public.profiles where id = p_user) then raise exception 'pemain tidak ditemukan'; end if;
  uname := 'Pemain' || (floor(random() * 90000) + 10000)::int;
  while exists (select 1 from public.profiles where lower(username) = lower(uname)) and tries < 20 loop
    uname := 'Pemain' || (floor(random() * 90000) + 10000)::int; tries := tries + 1;
  end loop;
  update public.profiles set username = uname where id = p_user;
  perform public.log_admin('hapus nama', p_user::text, jsonb_build_object('nama_baru', uname));
end;
$$;

create or replace function public.admin_set_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  if p_role not in ('player', 'admin') then raise exception 'peran tidak valid'; end if;
  if p_user = auth.uid() then raise exception 'tidak bisa mengubah peran sendiri'; end if;
  update public.profiles set role = p_role where id = p_user;
  if not found then raise exception 'pemain tidak ditemukan'; end if;
  perform public.log_admin('ubah peran', p_user::text, jsonb_build_object('peran', p_role));
end;
$$;

create or replace function public.admin_scores(p_mode text, p_day date, p_limit int default 50) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select s.id, p.username, s.score, s.moves, s.lines, s.secs, s.hidden
    from public.scores s join public.profiles p on p.id = s.user_id
    where s.mode = p_mode and s.day = p_day
    order by s.score desc
    limit least(coalesce(p_limit, 50), 200)
  ) x), '[]'::jsonb);
end;
$$;

create or replace function public.admin_set_hidden(p_score_id bigint, p_hidden boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  update public.scores set hidden = p_hidden where id = p_score_id;
  if not found then raise exception 'skor tidak ditemukan'; end if;
  perform public.log_admin(case when p_hidden then 'sembunyikan skor' else 'tampilkan skor' end, p_score_id::text, null);
end;
$$;

create or replace function public.admin_delete_score(p_score_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  delete from public.scores where id = p_score_id;
  if not found then raise exception 'skor tidak ditemukan'; end if;
  perform public.log_admin('hapus skor', p_score_id::text, null);
end;
$$;

-- Tambah atau ubah skor seorang pemain (entri buatan admin tidak punya data langkah/garis/durasi).
create or replace function public.admin_set_score(p_username text, p_mode text, p_day date, p_score int) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  perform public.require_admin();
  if p_mode not in ('daily', 'timed') then raise exception 'mode tidak valid'; end if;
  if p_score is null or p_score < 0 or p_score > 100000 then raise exception 'skor tidak valid'; end if;
  if p_day is null then raise exception 'tanggal tidak valid'; end if;
  select id into uid from public.profiles where lower(username) = lower(trim(p_username));
  if uid is null then raise exception 'pemain tidak ditemukan'; end if;
  insert into public.scores (user_id, mode, day, score) values (uid, p_mode, p_day, p_score)
  on conflict (user_id, mode, day) do update
    set score = excluded.score, moves = null, lines = null, secs = null, updated_at = now();
  perform public.log_admin('atur skor', uid::text, jsonb_build_object('mode', p_mode, 'tanggal', p_day, 'skor', p_score));
end;
$$;

create or replace function public.admin_reports() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select s.id as score_id, p.username, s.score, s.mode, s.day, s.hidden, count(r.id) as reports
    from public.reports r
    join public.scores s on s.id = r.score_id
    join public.profiles p on p.id = s.user_id
    group by s.id, p.username
    order by count(r.id) desc
    limit 50
  ) x), '[]'::jsonb);
end;
$$;

create or replace function public.admin_clear_reports(p_score_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  delete from public.reports where score_id = p_score_id;
  perform public.log_admin('abaikan laporan', p_score_id::text, null);
end;
$$;

create or replace function public.admin_reset_board(p_mode text, p_day date) returns void
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform public.require_admin();
  if p_mode not in ('daily', 'timed') then raise exception 'mode tidak valid'; end if;
  delete from public.scores where mode = p_mode and day = p_day;
  get diagnostics n = row_count;
  perform public.log_admin('reset papan', p_mode, jsonb_build_object('tanggal', p_day, 'dihapus', n));
end;
$$;

create or replace function public.admin_log_list(p_limit int default 50) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_admin();
  return coalesce((select jsonb_agg(to_jsonb(x)) from (
    select l.action, l.target, l.details, l.created_at, p.username as admin
    from public.admin_log l left join public.profiles p on p.id = l.admin_id
    order by l.id desc limit least(coalesce(p_limit, 50), 200)
  ) x), '[]'::jsonb);
end;
$$;

-- ============ 5) Hak akses fungsi ============
-- Supabase memberi izin eksekusi ke anon secara bawaan, jadi dicabut dulu lalu diberikan ke pengguna yang masuk.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = any (array[
      'is_admin','require_admin','log_admin','my_profile','cloud_load','cloud_save','submit_score','report_score',
      'delete_my_account','admin_overview','admin_users','admin_set_ban','admin_reset_name','admin_set_role',
      'admin_scores','admin_set_hidden','admin_delete_score','admin_set_score','admin_reports',
      'admin_clear_reports','admin_reset_board','admin_log_list','handle_new_user'])
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
  end loop;
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = any (array[
      'my_profile','cloud_load','cloud_save','submit_score','report_score','delete_my_account',
      'admin_overview','admin_users','admin_set_ban','admin_reset_name','admin_set_role',
      'admin_scores','admin_set_hidden','admin_delete_score','admin_set_score','admin_reports',
      'admin_clear_reports','admin_reset_board','admin_log_list'])
  loop
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- ============ 6) Tampilan papan peringkat (tanpa entri tersembunyi dan akun diblokir) ============
create view public.leaderboard with (security_invoker = off) as
  select s.id, p.username as name, s.score, s.mode, s.day
  from public.scores s join public.profiles p on p.id = s.user_id
  where not s.hidden and not p.banned;

create view public.leaderboard_best with (security_invoker = off) as
  select distinct on (s.user_id, s.mode) s.id, p.username as name, s.score, s.mode
  from public.scores s join public.profiles p on p.id = s.user_id
  where not s.hidden and not p.banned
  order by s.user_id, s.mode, s.score desc;

grant select on public.leaderboard, public.leaderboard_best to anon, authenticated;

-- ============ 7) LANGKAH TERAKHIR: jadikan akunmu admin ============
-- Daftar dulu di game dengan emailmu, lalu hapus tanda "--" di dua baris di bawah, ganti emailnya, dan jalankan.
-- update public.profiles set role = 'admin'
--  where id = (select id from auth.users where email = 'emailkamu@contoh.com');
