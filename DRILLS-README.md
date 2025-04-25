
# Adding Drills to the Golf Coach App

This document provides instructions for adding the driving drills to your Supabase database.

## Method 1: Using Edge Functions (Recommended)

The application includes an Edge Function called `add-drills` that will add all the driving drills to the database.

1. Make sure you have the Supabase CLI installed:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase login
supabase link --project-ref xocrhthipvspkndtkxeq
```

3. Deploy the edge function:
```bash
supabase functions deploy add-drills
```

4. Invoke the function:
```bash
supabase functions invoke add-drills
```

5. Verify the drills were added by checking the Supabase dashboard or running:
```bash
supabase db query 'SELECT COUNT(*) FROM drills'
```

## Method 2: Using SQL

You can also add the drills directly using SQL. A SQL script is provided in `scripts/populate-drills.sql`.

1. Navigate to the Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of the `scripts/populate-drills.sql` file
4. Run the SQL

## Method 3: Manual API Usage

If you prefer a more programmatic approach, you can use the provided JavaScript script:

1. Set your Supabase service role key as an environment variable:
```bash
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

2. Run the script:
```bash
node scripts/populate-drills.js
```

## Drill Structure

Each drill includes:
- Title
- Overview
- Difficulty level
- Category
- Duration
- Focus areas
- Instructions formatted as markdown with:
  - Step-by-step instructions
  - Common mistakes
  - Pro tips

## Troubleshooting

If you encounter issues:

1. Check the database logs in the Supabase dashboard
2. Make sure your service role key has the necessary permissions
3. Verify the drills table has all required columns (especially `instructions`)
