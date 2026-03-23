# Rubaru - Partner Health Journey App

## Original Problem Statement
Build a clean, minimal, AI-powered web application for two partners to manage their health journey together. The central psychological principle is that people stay consistent when they have a partner doing it with them.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Framer Motion + DnD Kit
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Claude Sonnet 4 via Emergent LLM Key (text + vision)

## User Personas
1. **Busy Working Professionals (25-45)** - Couples who struggle with consistency
2. **Health-conscious Partners** - People who want sustainable routines together

## Core Requirements (Static)
- [x] Paired account for two partners with invite link system
- [x] Comprehensive onboarding (health goals, diet, workouts, cycle tracking)
- [x] AI-generated shared weekly plans with individual adjustments
- [x] Shared streak counter (both must complete for streak to count)
- [x] Daily logging (workout, meals, water, energy, pain, mood, sleep)
- [x] Progress tracking with charts
- [x] Travel mode (pauses streak)
- [x] Milestone celebrations

## What's Been Implemented (Jan 2026)

### Backend API
- JWT-based authentication
- Partner pairing via invite codes
- Multi-step onboarding
- Couple management with travel mode
- Daily logging with streak calculation
- Weekly plan generation (AI + fallback)
- **NEW: Menstrual cycle phase tracking & calendar**
- **NEW: Workout rescheduling API**
- **NEW: Ingredient photo analysis (Claude Vision)**
- **NEW: Milestone celebration tracking**
- **NEW: AI-powered weekly insights**
- Progress stats and weekly summaries
- Grocery list generation
- Meal swap API
- Quick workout API

### Frontend
- Landing page with Rubaru branding
- Auth pages (Login, Register)
- Partner invite/pairing flow
- 5-step onboarding form
- Shared dashboard with streak, quick workout, weekly insights
- **NEW: Drag-and-drop workout rescheduling**
- **NEW: Quick workout modal (15-min version)**
- **NEW: Meal swap modal with ingredient input**
- **NEW: Ingredient photo scanner (Claude Vision)**
- **NEW: Menstrual cycle calendar with phase colors**
- **NEW: Milestone celebration with confetti**
- Weekly plan view with day selector
- Daily log page with all tracking inputs
- Progress page with stats, charts, and cycle calendar
- Settings page with travel mode toggle

## Features Completed

| Feature | Status |
|---------|--------|
| Partner pairing | ✅ |
| Onboarding | ✅ |
| AI-generated plans | ✅ |
| Shared streak | ✅ |
| Travel mode | ✅ |
| Daily logging | ✅ |
| Progress charts | ✅ |
| Grocery list | ✅ |
| Drag-and-drop rescheduling | ✅ |
| Quick workout mode | ✅ |
| Meal swap UI | ✅ |
| Ingredient photo upload | ✅ |
| Menstrual cycle calendar | ✅ |
| Celebration animations | ✅ |
| Weekly AI insights | ✅ |

## Remaining Items

### P1 (High Priority)
- [ ] Push notifications (Web Push API)
- [ ] Weekly Sunday recap notification
- [ ] Streak loss prevention notifications

### P2 (Medium Priority)
- [ ] Workout video guides
- [ ] Recipe step-by-step view
- [ ] Social sharing of milestones

## Next Tasks
1. Implement Web Push notifications for daily reminders
2. Add streak loss prevention nudge at 9 PM
3. Create weekly Sunday recap email/notification
