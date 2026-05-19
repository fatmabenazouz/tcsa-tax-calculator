# TCSA Tax Calculator

A full-stack SARS income tax calculator built for Tax Consulting SA.
Users enter their annual income and age to calculate their tax liability,
effective rate, marginal rate, and monthly take-home pay for the 2026/27
tax year. All calculations are saved to a Supabase database with full functionality.

## Live Demo
> https://tcsa-tax-calculator.vercel.app/

## Tech Stack
- **Frontend:** React 18, Axios, CSS3
- **Backend:** Node.js
- **Database:** Supabase
- **Hosting:** Vercel

## Features
- Calculate tax based on 2026/27 SARS brackets
- Age-based rebates 
- Results: annual tax, effective rate, marginal rate, monthly take-home 
- Save every calculation to Supabase (Create)
- View recent calculations on load (Read)
- Delete any saved calculation (Delete)
- Responsive UI in Tax Consulting SA colour palette

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
# root
npm install

# frontend
cd frontend
npm install
npm start
```

## Deployment

1. Push to GitHub
2. Import repo on vercel.com
3. Add environment variables
4. Deploy

## Assumptions & Limitations
- Individual taxpayers only
- Standard rebates only — no pension, medical aid, or travel deductions
- Tax brackets based on 2026/27 SARS tables
- For illustrative purposes only

Made by [Fatma Ben Azouz](https://github.com/fatmabenazouz) • 2026
