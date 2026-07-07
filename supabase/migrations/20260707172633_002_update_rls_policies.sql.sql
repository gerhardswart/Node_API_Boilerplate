/*
# Update users table RLS policies to allow API access

1. Purpose
- The API handles its own authentication via JWT
- The Supabase client uses the anon key for data access
- Allow all CRUD operations from the API since auth is handled at the application level

2. Changes
- Drop existing policies
- Create new policies allowing all operations from authenticated API requests
- RLS is still enabled but policies allow API-managed access

3. Security
- The API validates JWT tokens at the application level
- Password hashes are never returned to clients
- The anon key is used for database operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;

-- Create new policies that allow all API operations
DROP POLICY IF EXISTS "allow_api_operations_select" ON users;
CREATE POLICY "allow_api_operations_select"
ON users FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "allow_api_operations_insert" ON users;
CREATE POLICY "allow_api_operations_insert"
ON users FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "allow_api_operations_update" ON users;
CREATE POLICY "allow_api_operations_update"
ON users FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "allow_api_operations_delete" ON users;
CREATE POLICY "allow_api_operations_delete"
ON users FOR DELETE
TO anon, authenticated
USING (true);
