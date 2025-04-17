# Linode Server Monitor - Installation Guide

This guide will help you set up the Linode Server Monitor frontend application.

## Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account with a project set up
- A properly configured `server_stats` table in your Supabase database

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (or download it)
git clone <your-repository-url>
cd linode-server-monitor

# Install dependencies
npm install
# or
yarn install
```

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root directory of the project
2. Add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under Project Settings > API.

## Step 3: Ensure Your Supabase Database is Set Up

Make sure your Supabase project has a `server_stats` table with the following columns:

- `id`: int8 (auto-incrementing primary key)
- `created_at`: timestamptz (defaults to `now()`)
- `cpu_percent`: float4
- `ram_percent`: float4
- `disk_percent`: float4
- `proxy_active`: bool
- `network_rx_bytes`: int8
- `network_tx_bytes`: int8

## Step 4: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Visit http://localhost:3000 in your browser to see the dashboard.

## Step 5: Production Deployment

For production deployment, you can use Vercel:

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

Or deploy directly to Vercel, Netlify, or another hosting platform of your choice.

## Troubleshooting

- If you see "No data available" on the dashboard, make sure your backend monitoring script is running and pushing data to the Supabase database.
- If you see connection errors, double-check your Supabase credentials in `.env.local`.
- For any issues with charts or visualization, check your browser console for errors. 