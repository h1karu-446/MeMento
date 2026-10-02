create or replace function public.get_mypage_stats(month_start timestamptz, week_start timestamptz)
returns jsonb
language sql stable security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'reviewTotal', r.total, 'reviewMonth', r.month_total,
    'diaryTotal', d.total, 'diaryMonth', d.month_total,
    'wordTotal', w.total, 'wordMonth', w.month_total,
    'movies', r.movies, 'novels', r.novels, 'music', r.music,
    'weekReviews', coalesce(r.week_records, '[]'::jsonb),
    'weekDiaries', coalesce(d.week_records, '[]'::jsonb)
  )
  from (
    select count(*) as total,
      count(*) filter (where created_at >= month_start) as month_total,
      count(*) filter (where genre = '映画') as movies,
      count(*) filter (where genre = '小説') as novels,
      count(*) filter (where genre = '音楽') as music,
      jsonb_agg(jsonb_build_object('created_at', created_at)) filter (where created_at >= week_start) as week_records
    from public.reviews where user_id = (select auth.uid())
  ) r
  cross join (
    select count(*) as total,
      count(*) filter (where created_at >= month_start) as month_total,
      jsonb_agg(jsonb_build_object('created_at', created_at)) filter (where created_at >= week_start) as week_records
    from public.diaries where user_id = (select auth.uid())
  ) d
  cross join (
    select count(*) as total,
      count(*) filter (where created_at >= month_start) as month_total
    from public.words where user_id = (select auth.uid())
  ) w;
$$;
revoke all on function public.get_mypage_stats(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_mypage_stats(timestamptz, timestamptz) to authenticated;
