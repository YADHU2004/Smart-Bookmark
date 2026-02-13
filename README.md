# Smart Bookmark Manager

A modern, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.  
Users can securely log in with Google, save private bookmarks, and see updates instantly across tabs.

Live Demo: https://smartbookmark-ten.vercel.app

---

## Features

- Google OAuth login (Supabase Auth)
- Private bookmarks per user
- Add and delete bookmarks
- Real-time sync across multiple tabs
- Instant UI updates (Optimistic UI)
- Secure Row Level Security (RLS)
- Fully deployed on Vercel
- Modern responsive UI using Tailwind CSS

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React
- Tailwind CSS

**Backend**
- Supabase Auth (Google OAuth)
- Supabase Postgres Database
- Supabase Realtime

**Deployment**
- Vercel

---

## Architecture Overview

User → Next.js frontend → Supabase Auth → Supabase Database → Realtime → UI update

All bookmark data is securely stored and isolated per user using Row Level Security.

---

## Database Schema

Table: bookmarks

Columns:

- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- title (text)
- url (text)
- created_at (timestamp)

Row Level Security ensures users can only access their own bookmarks.

---

## Problems Faced and Solutions

### 1. Realtime updates were delayed

**Problem:**
Bookmarks were not updating instantly after adding or deleting.

**Cause:**
UI was waiting for Supabase realtime event and refetching data.

**Solution:**
Implemented Optimistic UI updates:

- Immediately update state using setBookmarks()
- Sync with Supabase in background
- Result: Instant UI response

---

### 2. User session was null after login

**Problem:**
Console error: "User not found"

**Cause:**
supabase.auth.getUser() was called before session fully initialized.

**Solution:**
Used supabase.auth.getSession() instead and initialized dashboard only after session exists.

---

### 3. After login, redirect went to localhost instead of Vercel URL

**Problem:**
Production login redirected to http://localhost:3000/dashboard

**Cause:**
Supabase Site URL was still set to localhost.

**Solution:**
Updated Supabase settings:

Authentication → URL Configuration

Set:

Site URL:
https://smartbookmark-ten.vercel.app

Added redirect URLs:
https://smartbookmark-ten.vercel.app
https://smartbookmark-ten.vercel.app/dashboard

Also updated login code:

```js
redirectTo: `${window.location.origin}/dashboard`

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
