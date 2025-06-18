# Supabase Environment Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** > **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 2: Create Environment File

1. In your project root directory, create a file named `.env.local`
2. Add the following content:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

## Step 3: Verify Database Table

Make sure your `patients` table exists in Supabase with the correct schema:

```sql
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gestational_age INTEGER NOT NULL,
  weight_before DECIMAL(5,2) NOT NULL,
  weight_current DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  bmi DECIMAL(4,2),
  bmi_category VARCHAR(50),
  illness TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 4: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the patient info page
3. Fill out the form and submit
4. Check your Supabase dashboard > Table Editor > patients to see if data was saved

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables" error**
   - Make sure `.env.local` file exists in the root directory
   - Verify the variable names are exactly as shown
   - Restart your development server after creating the file

2. **Database connection errors**
   - Check that your Supabase project is active
   - Verify the URL and key are correct
   - Ensure your IP is not blocked by Supabase

3. **Table not found errors**
   - Go to Supabase dashboard > Table Editor
   - Verify the `patients` table exists
   - Check that the column names match the schema

### Next Steps:

Once the basic setup is working, consider adding:
- User authentication
- Row Level Security (RLS)
- Data validation
- Error handling improvements

## Support

If you encounter issues, check:
- Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs
- Console errors in your browser's developer tools 