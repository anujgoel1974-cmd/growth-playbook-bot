-- Create a public bucket for generated ad images
insert into storage.buckets (id, name, public)
values ('ad-creatives', 'ad-creatives', true)
on conflict (id) do nothing;

-- Allow public read access to images in this bucket
create policy "Public read ad-creatives"
on storage.objects
for select
using (bucket_id = 'ad-creatives');