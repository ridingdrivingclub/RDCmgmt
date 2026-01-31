# Riding & Driving Club - Digital Garage

## Complete Setup Guide

This guide will walk you through setting up your production-ready Digital Garage application.

---

## Prerequisites

- Node.js 18+ installed
- A Supabase account (you already have this!)
- A Vercel account (for deployment)

---

## Step 1: Set Up Your Supabase Database

### 1.1 Run the Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `database/001_schema.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Wait for it to complete (you should see "Success")

### 1.2 Run the Security Policies

1. Create another **New Query**
2. Copy and paste the contents of `database/002_security_policies.sql`
3. Click **Run**

### 1.3 Set Up Storage Buckets

1. Create another **New Query**
2. Copy and paste the contents of `database/003_storage_setup.sql`
3. Click **Run**

### 1.4 Enable Realtime (for live chat)

1. Go to **Database** → **Replication** in Supabase
2. Under "Realtime" section, click the toggle to enable for these tables:
   - `messages`
   - `conversations`

---

## Step 2: Configure Authentication

### 2.1 Set Up Email Templates

1. In Supabase, go to **Authentication** → **Email Templates**
2. Customize the following templates with your branding:

**Confirm Signup:**
```html
<h2>Welcome to Riding & Driving Club</h2>
<p>Click the link below to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

**Reset Password:**
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### 2.2 Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain (e.g., `https://garage.ridinganddrivingclub.com`)
3. Add **Redirect URLs**:
   - `http://localhost:5173/*` (for local development)
   - `https://your-domain.com/*` (for production)

---

## Step 3: Create Your Admin Account

### 3.1 Sign Up as First User

1. Start the app locally (see Step 4)
2. Go to `/signup` and create an account with your email
3. Check your email and confirm the account

### 3.2 Promote Yourself to Admin

1. Go to Supabase **SQL Editor**
2. Run this query (replace with your email):

```sql
SELECT promote_to_admin('michael@ridinganddrivingclub.com');
```

3. Log out and log back in - you'll now see the Admin Dashboard!

---

## Step 4: Local Development

### 4.1 Install Dependencies

```bash
cd rdc-digital-garage
npm install
```

### 4.2 Configure Environment

The `.env` file is already configured with your Supabase credentials.

### 4.3 Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Step 5: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link to your Vercel account

4. Set environment variables in Vercel:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Option B: Deploy via GitHub

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click **Import Project** → **Import Git Repository**
4. Select your repository
5. Add environment variables:
   - `VITE_SUPABASE_URL` = `https://tounnzsavlpabdisdcfa.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_zU_sZUS1XrujzZZWIVva7g_onSic1Vw`
6. Click **Deploy**

### 5.1 Set Up Custom Domain

1. In Vercel, go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `garage.ridinganddrivingclub.com`)
3. Update DNS records as instructed
4. Update Supabase Site URL to match

---

## Step 6: Invite Your First Client

1. Log in to the admin dashboard
2. Go to **Invitations**
3. Click **Invite Client**
4. Enter their email and name
5. They'll receive an email with a signup link

---

## Features Overview

### Client Portal
- **My Garage** - View all vehicles with photos, specs, and status
- **Service History** - Complete maintenance records with costs
- **Appointments** - Upcoming services, registrations, renewals
- **Concierge** - Real-time chat with your team
- **Documents** - Registration, insurance, title documents

### Admin Dashboard
- **Dashboard** - Overview of clients, vehicles, appointments
- **Clients** - Manage client profiles and their vehicles
- **Vehicles** - Add/edit vehicles, photos, status, location
- **Service Records** - Log maintenance with costs
- **Appointments** - Schedule and manage appointments
- **Messages** - Respond to client concierge messages
- **Invitations** - Invite new clients

---

## Security Features

- **Row-Level Security** - Clients can only see their own data
- **Secure Authentication** - Email/password with verification
- **Invite-Only Access** - Controlled client onboarding
- **Encrypted Storage** - Documents stored securely in Supabase

---

## Customization

### Branding
Edit `tailwind.config.js` to update brand colors:
```js
colors: {
  'rdc': {
    primary: '#FF4400',  // Your signature red-orange
    // ... other colors
  }
}
```

### Logo
Update the Logo component in `src/components/Logo.jsx`

---

## Support

For questions or issues with this application, contact your development team.

---

## API Keys Reference

**Supabase Project URL:** `https://tounnzsavlpabdisdcfa.supabase.co`
**Supabase Anon Key:** `sb_publishable_zU_sZUS1XrujzZZWIVva7g_onSic1Vw`

⚠️ **Keep your Service Role Key private** - never commit it to code or share publicly.
