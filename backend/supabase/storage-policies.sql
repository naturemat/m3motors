-- =====================================================
-- Supabase Storage Policies para m3motors-photos
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =====================================================

-- Policy 1: Permitir upload a usuarios autenticados
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'm3motors-photos'
  AND auth.role() = 'authenticated'
);

-- Policy 2: Permitir lectura pública
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'm3motors-photos'
);

-- Policy 3: Permitir delete a usuarios autenticados (opcional)
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'm3motors-photos'
  AND auth.role() = 'authenticated'
);
