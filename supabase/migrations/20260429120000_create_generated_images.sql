create table if not exists generated_images (
  id          uuid        primary key default gen_random_uuid(),
  session_id  uuid        not null references sessions(id),
  product_id  uuid        not null references products(id),
  theme_id    text        not null,
  prompt_used text        not null,
  storage_path text       not null,
  public_url  text        not null,
  is_selected boolean     not null default false,
  created_at  timestamptz not null default now()
);
