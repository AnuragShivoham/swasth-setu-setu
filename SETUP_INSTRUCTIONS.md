# Sign Up Page Setup Instructions

## Overview
This document provides instructions for setting up the complete authentication system with Supabase for the PAWMANITY application.

## What Has Been Implemented

### 1. Database Schema
- **Location**: `supabase/migrations/20240101000000_create_user_profiles.sql`
- **Tables Created**:
  - `profiles`: Stores basic user information (id, email, full_name, phone, role, avatar_url)
  - `doctor_profiles`: Stores doctor-specific information (specialization, license_number, bio, etc.)
- **Security**: Row Level Security (RLS) policies implemented
- **Features**: Automatic timestamp updates, proper indexes for performance

### 2. TypeScript Types
- **Location**: `src/integrations/supabase/types.d.ts`
- **Types Defined**:
  - `Database`: Complete database schema types
  - `Profile`, `ProfileInsert`, `ProfileUpdate`: Profile table types
  - `DoctorProfile`, `DoctorProfileInsert`, `DoctorProfileUpdate`: Doctor profile types
  - `UserWithProfile`: Combined user type

### 3. Authentication Pages
- **Signup Page** (`src/pages/Signup.tsx`):
  - Supabase Auth integration
  - Creates user account with `supabase.auth.signUp()`
  - Creates profile record in database
  - Creates doctor_profile for doctors
  - Comprehensive error handling
  - Email verification support

- **Login Page** (`src/pages/Login.tsx`):
  - Supabase Auth integration
  - Signs in with `supabase.auth.signInWithPassword()`
  - Fetches user profile from database
  - Role-based navigation
  - Session management

### 4. Auth Guard
- **Location**: `src/components/AuthGuard.tsx`
- **Features**:
  - Checks Supabase session
  - Fetches user profile from database
  - Role-based access control
  - Loading states
  - Automatic redirect for unauthorized users

### 5. Routing
- **Location**: `src/App.tsx`
- **Routes Added**:
  - `/signup`: Public signup page
  - All protected routes use AuthGuard

## Setup Steps

### Step 1: Configure Supabase Environment Variables
Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Step 2: Run Database Migration
Execute the migration to create the database tables:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL file in Supabase Dashboard
# Go to SQL Editor and paste the contents of:
# supabase/migrations/20240101000000_create_user_profiles.sql
```

### Step 3: Install Dependencies (if needed)
```bash
npm install
```

### Step 4: Start Development Server
```bash
npm run dev
```

## Testing the Implementation

### Test Patient Signup
1. Navigate to `/signup`
2. Select "Patient" role
3. Fill in all required fields:
   - Full Name
   - Email
   - Phone Number
   - Password (min 6 characters)
   - Confirm Password
4. Click "Sign Up"
5. Check for success message
6. Navigate to `/login` and sign in

### Test Doctor Signup
1. Navigate to `/signup`
2. Select "Doctor" role
3. Fill in all required fields including:
   - Specialization
   - Medical License Number
4. Click "Sign Up"
5. Check for success message
6. Navigate to `/login` and sign in

### Test Login
1. Navigate to `/login`
2. Select appropriate role
3. Enter email and password
4. Click "Sign In"
5. Verify redirect to correct page:
   - Doctors → `/doctor`
   - Patients → `/home`

### Test Auth Guard
1. Try accessing protected routes without logging in
2. Verify redirect to `/login`
3. Try accessing doctor routes as patient (and vice versa)
4. Verify redirect to appropriate page

## Database Schema Details

### Profiles Table
```sql
- id (UUID, primary key, references auth.users)
- email (TEXT, unique, not null)
- full_name (TEXT, not null)
- phone (TEXT)
- role (TEXT, 'doctor' | 'patient', not null)
- avatar_url (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Doctor Profiles Table
```sql
- id (UUID, primary key, references profiles)
- specialization (TEXT, not null)
- license_number (TEXT, unique, not null)
- bio (TEXT)
- years_of_experience (INTEGER)
- consultation_fee (NUMERIC)
- is_verified (BOOLEAN, default false)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

## Security Features

### Row Level Security (RLS) Policies
1. **Profiles Table**:
   - Users can view their own profile
   - Users can insert their own profile (during signup)
   - Users can update their own profile
   - Authenticated users can view all profiles

2. **Doctor Profiles Table**:
   - Doctors can view/insert/update their own profile
   - Authenticated users can view all doctor profiles
   - Public can view verified doctor profiles

## Troubleshooting

### Common Issues

1. **"Module has no default export" error**:
   - This is a TypeScript linting issue, the code will still work
   - The export is correct in AuthGuard.tsx

2. **Database connection errors**:
   - Verify `.env` file has correct Supabase credentials
   - Check Supabase project is active

3. **Migration errors**:
   - Ensure you have proper permissions in Supabase
   - Check if tables already exist
   - Review SQL syntax in migration file

4. **Email verification not working**:
   - Check Supabase Auth settings
   - Verify email templates are configured
   - For development, you can disable email confirmation in Supabase settings

## Next Steps

### Recommended Enhancements
1. Add password reset functionality
2. Implement email verification flow
3. Add profile picture upload
4. Create admin panel for doctor verification
5. Add two-factor authentication
6. Implement social login (Google, Facebook, etc.)

### Production Checklist
- [ ] Configure proper email templates in Supabase
- [ ] Enable email verification
- [ ] Set up proper error logging
- [ ] Configure rate limiting
- [ ] Add CAPTCHA for signup
- [ ] Set up monitoring and alerts
- [ ] Review and test all RLS policies
- [ ] Perform security audit

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review the TODO_SIGNUP_IMPLEMENTATION.md file
3. Check console logs for detailed error messages

---

**Implementation Date**: 2024
**Status**: Complete and Ready for Testing
