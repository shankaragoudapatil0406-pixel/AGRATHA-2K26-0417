# AGRATHA 2K26 - College Fest Management Portal

A futuristic, full-stack college fest management platform built with **pure HTML, CSS, and vanilla JavaScript**. It uses Supabase for backend services (Auth, Database, Realtime).

## Features
- **Role-based Access**: Separate Admin and Participant dashboards
- **Event Management**: Browse, search, filter, and register for events
- **Team Builder**: Create and join teams for team events
- **Digital Tickets**: QR-based entry pass system
- **Live Leaderboard**: Real-time scoring and rankings
- **Announcements**: Real-time notifications with priority levels
- **Analytics Dashboard**: Admin charts and insights (Chart.js)
- **Futuristic UI**: Dark theme, neon gradients, glassmorphism, particle animations

## Tech Stack
- HTML5 / CSS3 / Vanilla JavaScript
- Supabase (Auth, Database, Realtime)
- Lucide Icons (CDN)
- Chart.js (CDN)
- Google Fonts (Inter, Orbitron, Space Grotesk)

## Pages
| Page | Description |
|------|-------------|
| `index.html` | Landing page with hero, stats, features, countdown |
| `login.html` | User login |
| `register.html` | New user registration |
| `events.html` | Event listing with search/filter |
| `event-detail.html` | Event details and registration |
| `dashboard.html` | Participant dashboard |
| `admin.html` | Admin dashboard with analytics |
| `leaderboard.html` | Rankings and scores |
| `announcements.html` | Latest announcements |
| `teams.html` | Team management |
| `tickets.html` | Digital tickets |
| `profile.html` | User profile editor |
| `add-events.html` | Tool to seed sample events |

## Setup
1. Run `supabase-schema.sql` in your Supabase SQL Editor
2. Update `js/config.js` with your Supabase URL and Anon Key
3. Start a local server: `python -m http.server 8000`
4. Open `http://localhost:8000`

## Deployment
Push to GitHub and connect to Vercel for instant deployment.