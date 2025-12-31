# Learning Roadmap Generator

A full-stack Next.js application that generates personalized learning roadmaps with YouTube resources, built with Supabase for authentication and database management.

## 🚀 Features

- **Authentication**: Supabase email + password authentication
- **Roadmap Generation**: Generate learning roadmaps for any topic with difficulty levels
- **YouTube Integration**: Links to relevant YouTube tutorials for each step
- **User Management**: Save and manage your learning roadmaps
- **Responsive Design**: Works on all device sizes

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + Database + Row Level Security)
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel ready

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd roadmap-generator
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Project Settings → API
4. Copy the "URL" as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the "anon public" key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Set Up Supabase Database

Run the SQL schema in your Supabase SQL Editor:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to SQL Editor
4. Copy and run the content from `supabase-schema.sql`

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── dashboard/      # Protected routes
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   └── globals.css     # Global styles
├── components/         # Reusable components
├── lib/               # Utilities and types
│   ├── supabase.ts    # Supabase client
│   ├── types.ts       # TypeScript types
│   └── database.types.ts # Database types
└── utils/             # Utility functions
```

## 📝 Database Schema

The application uses three main tables:

1. **users**: Stores user information
2. **roadmaps**: Stores user's learning roadmaps
3. **roadmap_steps**: Stores individual steps in each roadmap

Row Level Security (RLS) is enabled to ensure users can only access their own data.

## 🚀 Deployment

### Vercel

The easiest way to deploy this application is to use [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Go to [Vercel](https://vercel.com) and create a new project
3. Import your repository
4. Add your environment variables during deployment
5. Click Deploy

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License.