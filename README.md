# Linode Server Monitor

A complete solution for monitoring your Linode server, including CPU, RAM, disk usage, proxy status, and network traffic.

## Overview

This project consists of two main components:

1. **Frontend**: A Next.js dashboard that displays server metrics in real-time
2. **Backend**: A Python script that collects server metrics and sends them to Supabase

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│ Linode      │     │              │     │  Next.js      │
│ Server      ├────►│  Supabase    ├────►│  Dashboard    │
│ (monitor.py)│     │  Database    │     │  (Vercel)     │
└─────────────┘     └──────────────┘     └───────────────┘
```

## Prerequisites

- A Linode server running your services
- A Supabase account with a project set up
- Node.js 18+ (for the frontend)
- Python 3.7+ (for the backend)

## Quick Start

### Option 1: Manual Setup

#### Frontend

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to see the dashboard

#### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables in a `.env` file:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```
4. Run the setup script:
   ```bash
   sudo ./setup.sh
   ```
   This will set up the cron job and test the script.

### Option 2: Docker Setup

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
3. Start the services with Docker Compose:
   ```bash
   docker-compose up -d
   ```
4. The frontend will be available at [http://localhost:3000](http://localhost:3000)

## Supabase Database Setup

1. Create a new project in Supabase
2. Create a `server_stats` table with the following schema:
   ```sql
   CREATE TABLE server_stats (
     id BIGSERIAL PRIMARY KEY,
     created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
     cpu_percent FLOAT4,
     ram_percent FLOAT4,
     disk_percent FLOAT4,
     proxy_active BOOLEAN,
     network_rx_bytes BIGINT,
     network_tx_bytes BIGINT
   );
   ```
   
   You can also use the provided `supabase-schema.sql` file.

## Configuration

### Frontend

The frontend can be configured by modifying the following files:

- `tailwind.config.ts`: Customize the theme and styling
- `components/ServerMonitor.tsx`: Adjust dashboard layout and components

### Backend

The backend can be configured by modifying:

- `backend/monitor.py`: Customize what metrics are collected and how
- `backend/crontab.example`: Change the frequency of data collection

## Deploying to Vercel

This project is configured for easy deployment to Vercel. Follow these steps:

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one
2. Install the Vercel CLI: `npm install -g vercel`
3. Login to Vercel: `vercel login`
4. Configure your environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
5. Deploy using one of these methods:
   - Push to GitHub and connect your repository in the Vercel dashboard
   - Run `vercel` from the project directory for a manual deployment

### Important Notes

- Make sure your Supabase project is correctly configured and accessible
- CORS settings in Supabase should include your Vercel deployment URL
- The application requires proper environment variables to connect to Supabase

## License

MIT

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Chart.js](https://www.chartjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [psutil](https://github.com/giampaolo/psutil)
