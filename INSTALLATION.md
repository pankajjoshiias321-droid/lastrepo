# Installation Script

This project requires Node.js to run. If you don't have Node.js installed, please follow these steps:

## Installing Node.js

### Option 1: Using Node Version Manager (nvm) - Recommended
1. Download and install nvm from: https://github.com/coreybutler/nvm-windows
2. Open a new terminal as administrator
3. Run: `nvm install node`
4. Run: `nvm use node`

### Option 2: Direct Download
1. Go to https://nodejs.org/
2. Download the LTS version
3. Run the installer and follow the prompts
4. Restart your terminal

## Installing Project Dependencies

Once Node.js is installed:

1. Navigate to the project directory:
   ```bash
   cd c:\Users\panka\OneDrive\Desktop\qoder project1\roadmap-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Setting up Supabase

1. Create a free account at https://supabase.com/
2. Create a new project
3. Copy your project URL and anon key from Project Settings → API
4. Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor