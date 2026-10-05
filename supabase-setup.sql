-- Blox Blast Mini: papan peringkat online (versi 2, dengan pemeriksaan data permainan)
-- Jalankan SELURUH isi file ini sekali di Supabase: SQL Editor > New query > Run.
-- Aman dijalankan ulang (menggantikan versi lama).

-- 1) Tabel skor. Pemain TIDAK bisa membaca atau menulis tabel ini secara langsung.
create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  device     uuid        not null,
  name       text        not null check (char_length(name) between 2 and 16),
  mode       text        not null check (mode in ('daily', 'timed')),
  day        date        not null,
  score      int         not null check (score between 0 and 100000),
  moves      int,
  lines      int,
  secs       int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (device, mode, day)
);
alter table public.scores add column if not exists moves int;
alter table public.scores add column if not exists lines int;
alter table public.scores add column if not exists secs  int;

alter table public.scores enable row level security;
-- Tanpa policy untuk anon/authenticated = semua akses langsung ditolak.
revoke all on public.scores from anon, authenticated;

-- 2) Satu-satunya pintu masuk untuk menulis skor: fungsi yang memeriksa data.
drop function if exists public.submit_score(uuid, text, text, date, int);

create or replace function public.submit_score(
  p_device uuid, p_name text, p_mode text, p_day date, p_score int,
  p_moves int, p_lines int, p_secs int
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  maxs        int := case p_mode when 'daily' then 20000 else 6000 end;  -- batas mutlak, boleh kamu ubah
  max_by_play int;
begin
  if p_mode not in ('daily', 'timed') then raise exception 'mode tidak valid'; end if;
  if p_name is null or char_length(trim(p_name)) not between 2 and 16 then raise exception 'nama tidak valid'; end if;
  if p_day is null or abs(p_day - (now() at time zone 'utc')::date) > 1 then raise exception 'tanggal tidak valid'; end if;
  if p_score is null or p_score < 0 or p_score > maxs then raise exception 'skor tidak valid'; end if;

  -- Data permainan harus masuk akal dan konsisten dengan skor
  if p_moves is null or p_lines is null or p_secs is null then raise exception 'data permainan tidak lengkap'; end if;
  if p_moves < 1 or p_moves > 600 then raise exception 'jumlah langkah tidak valid'; end if;
  if p_lines < 0 or p_lines > p_moves * 6 then raise exception 'jumlah garis tidak valid'; end if;
  if p_secs < 3 or p_secs > 3600 then raise exception 'durasi tidak valid'; end if;
  if p_moves > p_secs / 0.3 + 3 then raise exception 'terlalu cepat'; end if;                        -- maks. sekitar 3 langkah/detik
  if p_mode = 'timed' and p_secs > 95 + 3 * p_lines then raise exception 'durasi melebihi jatah waktu'; end if;

  -- Batas atas skor berdasarkan langkah dan garis yang dilaporkan
  max_by_play := 9 * p_moves + 60 * p_lines + 5 * p_lines * (p_lines + 1) + 400;
  if p_score > max_by_play then raise exception 'skor tidak sesuai permainan'; end if;

  insert into public.scores (device, name, mode, day, score, moves, lines, secs)
  values (p_device, trim(p_name), p_mode, p_day, p_score, p_moves, p_lines, p_secs)
  on conflict (device, mode, day) do update
    set moves = case when excluded.score > public.scores.score then excluded.moves else public.scores.moves end,
        lines = case when excluded.score > public.scores.score then excluded.lines else public.scores.lines end,
        secs  = case when excluded.score > public.scores.score then excluded.secs  else public.scores.secs  end,
        score = greatest(public.scores.score, excluded.score),
        name = excluded.name,
        updated_at = now()
    where public.scores.updated_at < now() - interval '5 seconds';  -- batas kecepatan kirim
end;
$$;

revoke all on function public.submit_score(uuid, text, text, date, int, int, int, int) from public;
grant execute on function public.submit_score(uuid, text, text, date, int, int, int, int) to anon;

-- 3) Tampilan untuk membaca papan peringkat (tanpa ID perangkat pemain).
create or replace view public.leaderboard
  with (security_invoker = off) as
  select name, score, mode, day from public.scores;

create or replace view public.leaderboard_best
  with (security_invoker = off) as
  select distinct on (device, mode) name, score, mode
  from public.scores
  order by device, mode, score desc;

grant select on public.leaderboard, public.leaderboard_best to anon;
