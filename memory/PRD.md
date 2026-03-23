# DuoHealth - Partner Health Journey App

## Original Problem Statement
Build a clean, minimal, AI-powered web application for two partners to manage their health journey together. The central psychological principle is that people stay consistent when they have a partner doing it with them.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI**: Claude Sonnet 4 via Emergent LLM Key

## User Personas
1. **Busy Working Professionals (25-45)** - Couples who struggle with consistency due to lack of structure and accountability
2. **Health-conscious Partners** - People who want to build sustainable routines together

## Core Requirements (Static)
- [x] Paired account for two partners with invite link system
- [x] Comprehensive onboarding (health goals, dietary preferences, workout types, menstrual cycle tracking)
- [x] AI-generated shared weekly plans (workouts + meals) with individual adjustments
- [x] Shared streak counter (both must complete for streak to count)
- [x] Daily logging (workout, meals, water, energy, pain, mood, sleep)
- [x] Progress tracking with charts
- [x] Travel mode (pauses streak without breaking it)
- [x] Milestone celebrations

## What's Been Implemented (MVP - Jan 2026)
### Backend
- JWT-based authentication (register, login, me)
- Partner pairing via invite codes
- Multi-step onboarding data collection
- Couple management with travel mode
- Daily logging with streak calculation
- Weekly plan generation (AI + fallback mock)
- Progress stats and weekly summaries
- Grocery list generation from meal plans

### Frontend
- Landing page with hero section and features
- Auth pages (Login, Register)
- Partner invite/pairing flow
- 5-step onboarding form
- Shared dashboard with streak, today's plan, water tracking
- Weekly plan view with day selector
- Daily log page with all tracking inputs
- Progress page with charts (Recharts)
- Settings page with travel mode toggle

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] User authentication
- [x] Partner pairing
- [x] Basic onboarding
- [x] Dashboard with streak
- [x] Daily logging

### P1 (High Priority)
- [ ] Push notifications (Web Push API)
- [ ] Ingredient photo upload for meal planning
- [ ] Drag-and-drop workout rescheduling
- [ ] Quick workout mode (15-min version)
- [ ] Meal swap based on ingredients

### P2 (Medium Priority)
- [ ] Menstrual cycle phase auto-adjustments
- [ ] AI-powered weekly insights
- [ ] Celebration animations on milestones
- [ ] Weekly Sunday recap notification
- [ ] Streak loss prevention notifications

### P3 (Nice to Have)
- [ ] Social sharing of milestones
- [ ] Workout video guides
- [ ] Recipe step-by-step view
- [ ] Integration with fitness trackers

## Next Tasks
1. Implement push notifications for daily reminders
2. Add ingredient photo upload with Claude Vision
3. Build drag-and-drop for workout rescheduling
4. Create milestone celebration animations
