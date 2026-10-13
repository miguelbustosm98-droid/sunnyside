-- Bucket publico para fotos de tours; solo admins pueden subir, cambiar o borrar
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tour-images', 'tour-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy tour_images_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'tour-images' and (select public.is_admin()));
create policy tour_images_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'tour-images' and (select public.is_admin()))
  with check (bucket_id = 'tour-images' and (select public.is_admin()));
create policy tour_images_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'tour-images' and (select public.is_admin()));
