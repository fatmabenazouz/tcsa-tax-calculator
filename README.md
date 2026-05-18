# TCSA Tax Calculator

A full-stack SARS income tax calculator built for Tax Consulting SA.
Users enter their annual income and age to calculate their tax liability,
effective rate, marginal rate, and monthly take-home pay for the 2026/27
tax year. All calculations are saved to a Supabase database with full
create, read, and delete functionality.

## Live Demo
> 

## Tech Stack
- **Frontend:** React 18, Axios, CSS3
- **Backend:** Node.js
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel

## Features
- Calculate tax based on 2026/27 SARS brackets
- Age-based rebates (Primary / Secondary / Tertiary)
- Results: annual tax, effective rate, marginal rate, monthly take-home 
- Save every calculation to Supabase (Create)
- View recent calculations on load (Read)
- Delete any saved calculation (Delete)
- Responsive UI in Tax Consulting SA brand colours

## Environment Variables

Add these in Vercel under Project Settings → Environment Variables:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Supabase Table Setup

Run this in the Supabase SQL Editor:
```sql
CREATE TABLE calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Anonymous',
  annual_income NUMERIC NOT NULL,
  age INTEGER NOT NULL DEFAULT 30,
  tax_liability NUMERIC NOT NULL,
  effective_rate NUMERIC NOT NULL,
  take_home NUMERIC NOT NULL,
  marginal_rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Local Setup
```bash
# Root
npm install

# Frontend
cd frontend
npm install
npm start
```

For local API testing: install Vercel CLI with `npm i -g vercel` then run `vercel dev` from the root.

## Deployment

1. Push to GitHub (`tcsa-tax-calculator`)
2. Import repo on vercel.com
3. Add environment variables
4. Deploy — Vercel handles routing automatically via `vercel.json`

Made by [Fatma Ben Azouz](https://github.com/fatmabenazouz) • 2026