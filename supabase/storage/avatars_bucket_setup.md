# Supabase Storage: Avatars Bucket Setup

## Manual Setup Steps (Supabase Dashboard)

### 1. Create Bucket
1. Go to **Storage** in your Supabase Dashboard
2. Click **New Bucket**
3. Bucket name: `avatars`
4. Set as **Public bucket** (for public read access)
5. File size limit: `5242880` bytes (5MB)
6. Allowed MIME types: `image/jpeg,image/png,image/webp`

### 2. Apply RLS Policies

Run the following SQL in the **SQL Editor**:

```sql
-- ============================================================================
-- SUPABASE STORAGE: AVATARS BUCKET RLS POLICIES
-- ============================================================================

-- Policy: Users can upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view avatars (public read)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

## File Naming Convention

Avatars should be stored as:
```
{user_id}/avatar.{ext}
```

Example:
```
550e8400-e29b-41d4-a716-446655440000/avatar.jpg
```

This structure:
- Organizes avatars by user ID (easy cleanup)
- Uses `upsert: true` to replace existing avatars
- Prevents storage bloat from multiple uploads

## Validation

**Client-side validation:**
- File size ≤ 5MB
- MIME type in ['image/jpeg', 'image/png', 'image/webp']
- Dimensions recommended: max 1024x1024px (resized on upload)

**Storage validation:**
- Enforced by bucket configuration
- Additional RLS policies prevent unauthorized access

## Usage Example

```typescript
// Upload avatar
const fileExt = file.name.split('.').pop()
const filePath = `${userId}/avatar.${fileExt}`

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(filePath, file, {
    upsert: true,
    contentType: file.type
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(filePath)
```

## Security Notes

- RLS policies ensure users can only modify their own avatars
- Public bucket allows viewing without authentication (needed for profile pictures)
- File path structure prevents directory traversal attacks
- Bucket configuration enforces file size and type restrictions
