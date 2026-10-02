create index if not exists reviews_user_created_id_idx on public.reviews (user_id, created_at desc, id desc);
create index if not exists diaries_user_created_id_idx on public.diaries (user_id, created_at desc, id desc);
create index if not exists english_logs_user_created_id_idx on public.english_logs (user_id, created_at desc, id desc);
create index if not exists words_user_created_id_idx on public.words (user_id, created_at desc, id desc);
create index if not exists words_review_created_idx on public.words (review_id, created_at) where review_id is not null;
create index if not exists words_diary_created_idx on public.words (diary_id, created_at) where diary_id is not null;
create index if not exists words_english_created_idx on public.words (english_log_id, created_at) where english_log_id is not null;
