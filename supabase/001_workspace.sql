-- 独立命名，不会更改日序的表。请在自己的Supabase项目SQL Editor中执行。
create table if not exists public.graduate_os_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 document jsonb not null,
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now(),
 constraint graduate_os_document_size check (octet_length(document::text) <= 2097152),
 constraint graduate_os_document_shape check ((document->>'version' = '1' and jsonb_typeof(document->'tasks') = 'array' and jsonb_typeof(document->'achievements') = 'array') is true)
);
alter table public.graduate_os_workspaces enable row level security;
revoke all on public.graduate_os_workspaces from public,anon;
grant select,insert,update on public.graduate_os_workspaces to authenticated;
drop policy if exists graduate_os_read_own on public.graduate_os_workspaces;
create policy graduate_os_read_own on public.graduate_os_workspaces for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists graduate_os_insert_own on public.graduate_os_workspaces;
create policy graduate_os_insert_own on public.graduate_os_workspaces for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists graduate_os_update_own on public.graduate_os_workspaces;
create policy graduate_os_update_own on public.graduate_os_workspaces for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create or replace function public.graduate_os_save_workspace(expected_revision bigint,next_document jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.graduate_os_workspaces%rowtype; current_user_id uuid := auth.uid(); wrote boolean := false;
begin
 if current_user_id is null then raise exception 'Authentication required'; end if;
 if expected_revision is null or expected_revision < 0 or next_document is null or octet_length(next_document::text)>2097152 or next_document->>'version' is distinct from '1' or jsonb_typeof(next_document->'tasks') is distinct from 'array' or jsonb_typeof(next_document->'achievements') is distinct from 'array' then raise exception 'Invalid document'; end if;
 if expected_revision=0 then
  insert into public.graduate_os_workspaces(user_id,document,revision) values(current_user_id,next_document,1) on conflict(user_id) do nothing returning * into saved;
 else
  update public.graduate_os_workspaces set document=next_document,revision=revision+1,updated_at=now() where user_id=current_user_id and revision=expected_revision returning * into saved;
 end if;
 wrote := found;
 if not wrote then select * into saved from public.graduate_os_workspaces where user_id=current_user_id; end if;
 return jsonb_build_object('conflict',not wrote,'snapshot',jsonb_build_object('accountId',current_user_id,'revision',coalesce(saved.revision,0),'data',coalesce(saved.document,'{"version":1,"tasks":[],"achievements":[]}'::jsonb),'updatedAt',saved.updated_at));
end; $$;
revoke all on function public.graduate_os_save_workspace(bigint,jsonb) from public,anon;
grant execute on function public.graduate_os_save_workspace(bigint,jsonb) to authenticated;
