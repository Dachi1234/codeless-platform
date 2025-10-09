create table if not exists course (
  id bigserial primary key,
  title varchar(200) not null,
  slug varchar(200) not null,
  description text,
  price numeric(12,2) not null,
  image_url varchar(500),
  kind varchar(20) not null,
  created_at timestamptz not null default now()
);
create unique index if not exists ux_course_slug on course(slug);

