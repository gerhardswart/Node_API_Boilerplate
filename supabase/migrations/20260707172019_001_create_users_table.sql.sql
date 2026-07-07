/*
# Create users table for authentication

1. Purpose
- Creates a users table to store user accounts for JWT authentication
- Supports email/password authentication with hashed passwords
- Includes refresh token storage for token refresh flow
- Tracks user activity and account status

2. New Tables
- `users`
  - `id` (uuid, primary key, auto-generated)
  - `email` (text, unique, not null) - User's email address for login
  - `password_hash` (text, not null) - Bcrypt hashed password
  - `first_name` (text, nullable) - User's first name
  - `last_name` (text, nullable) - User's last name
  - `role` (text, default 'user') - User role for authorization (user, admin)
  - `is_active` (boolean, default true) - Account active status
  - `refresh_token` (text, nullable) - Stored refresh token
  - `refresh_token_expires_at` (timestamptz, nullable) - Refresh token expiration
  - `last_login_at` (timestamptz, nullable) - Last successful login timestamp
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

3. Indexes
- Primary key on `id`
- Unique index on `email` for fast lookups and uniqueness

4. Security
- Enable RLS on `users` table
- Users can read and update only their own data
- Admin role has full access (for future admin features)
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  refresh_token text,
  refresh_token_expires_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on refresh_token for token refresh lookups
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token);

-- Policies for authenticated users

-- Users can read their own data
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own data (for registration)
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own data
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can delete their own data (account deletion)
DROP POLICY IF EXISTS "users_delete_own" ON users;
CREATE POLICY "users_delete_own"
ON users FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
