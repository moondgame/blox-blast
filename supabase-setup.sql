-- Blox Blast Mini: papan peringkat online
-- Jalankan SELURUH isi file ini sekali di Supabase: SQL Editor > New query > Run.

-- 1) Tabel skor. Pemain TIDAK bisa membaca atau menulis tabel ini secara langsung.
create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  device     uuid        not null,
  name       text        not null check (char_length(name) between 2 and 16),
  mode       text        not null check (mode in ('daily', 'timed')),
  day        date        not null,
  score      int         not null check (score between 0 and 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (device, mode, day)
);

alter table public.scores enable row level security;
-- Tanpa policy untuk anon/authenticated = semua akses langsung ditolak.
revoke all on public.scores from anon, authenticated;

-- 2) Satu-satunya pintu masuk untuk menulis skor: fungsi yang memeriksa data.
--    Batas skor (20000 harian, 6000 waktu) bisa kamu ubah sesuai skor realistis di game.
create or replace function public.submit_score(
  p_device uuid, p_name text, p_mode text, p_day date, p_score int
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  maxs int := case p_mode when 'daily' then 20000 else 6000 end;
begin
  if p_mode not in ('daily', 'timed') then raise exception 'mode tidak valid'; end if;
  if p_score is null or p_score < 0 or p_score > maxs then raise exception 'skor tidak valid'; end if;
  if p_name is null or char_length(trim(p_name)) not between 2 and 16 then raise exception 'nama tidak valid'; end if;
  if p_day is null or abs(p_day - (now() at time zone 'utc')::date) > 1 then raise exception 'tanggal tidak valid'; end if;

  insert into public.scores (device, name, mode, day, score)
  values (p_device, trim(p_name), p_mode, p_day, p_score)
  on conflict (device, mode, day) do update
    set score = greatest(public.scores.score, excluded.score),
        name = excluded.name,
        updated_at = now()
    where public.scores.updated_at < now() - interval '5 seconds';  -- batas kecepatan kirim
end;
$$;

revoke all on function public.submit_score(uuid, text, text, date, int) from public;
grant execute on function public.submit_score(uuid, text, text, date, int) to anon;

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
