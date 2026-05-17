create table if not exists profiles (
  id uuid primary key,
  role text check (role in ('teacher', 'student')) not null,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists labs (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references profiles(id),
  title text not null,
  description text,
  category text,
  type text check (type in ('code', 'non-code')) default 'code',
  lab_code text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lab_enrollments (
  lab_id uuid references labs(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (lab_id, student_id)
);

create table if not exists experiments (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references labs(id) on delete cascade,
  title text not null,
  description text,
  objective text,
  type text check (type in ('code', 'non-code')) not null,
  editor_mode text,
  difficulty text,
  points integer default 0,
  status text default 'draft',
  starter_code text,
  constraints jsonb default '[]'::jsonb,
  test_cases jsonb default '[]'::jsonb,
  knowledge_files jsonb default '[]'::jsonb,
  steps jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references labs(id) on delete cascade,
  experiment_id uuid references experiments(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  indexed boolean default false,
  created_at timestamptz default now()
);

create table if not exists ai_chats (
  id uuid primary key default gen_random_uuid(),
  lab_id text not null,
  experiment_id text not null,
  user_id uuid null,
  engine text not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists ai_step_generations (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references labs(id) on delete cascade,
  experiment_id uuid references experiments(id) on delete cascade,
  aim text,
  theory text,
  procedure jsonb default '[]'::jsonb,
  warnings jsonb default '[]'::jsonb,
  troubleshooting jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists notebook_cells (
  id text primary key,
  experiment_id text not null,
  user_id uuid null,
  cell_order integer not null,
  cell_type text check (cell_type in ('markdown', 'code')) not null,
  source text not null,
  output text,
  updated_at timestamptz default now()
);

create table if not exists code_drafts (
  experiment_id text primary key,
  user_id uuid null,
  language text not null,
  code text not null,
  updated_at timestamptz default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references experiments(id) on delete cascade,
  student_id uuid references profiles(id),
  status text default 'submitted',
  score numeric,
  output jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
