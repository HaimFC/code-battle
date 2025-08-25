# Code Battle ⚔️

Real-time coding battles with automated testing, matchmaking, timers, and a live leaderboard.  
Built with **React**, **Supabase (Postgres + Auth + Realtime)**, **Mantine UI**, **Monaco Editor**, and **Judge0** for code execution.

---

## ✨ Features

- Matchmaking & multiple modes (easy, medium, hard, hell)
- Real-time battles with countdown timers and automated navigation to results
- Code editor with language presets and starter templates
- Automated test execution with Judge0
- Submissions history with pass/fail, runtime, and memory usage
- Player profiles with ranking system:
  - Points = wins − 0.5 × loses
  - Every 100 points increases rank by 1 (up to 5)
- Responsive UI built with Mantine
- Supabase authentication (email / OAuth)
- Deployable as a single-page app (GitHub Pages supported)

---

## 🧰 Tech Stack

- **Frontend:** React, Vite, TypeScript, Mantine, Monaco Editor  
- **Backend:** Supabase (Postgres, Auth, Realtime)  
- **Code Execution:** Judge0  
- **Deployment:** GitHub Pages (SPA)

---

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies with npm or yarn
3. Create an `.env` file with your Supabase project keys and Judge0 configuration
4. Run `npm run dev` to start the development server
5. Build with `npm run build` and deploy to GitHub Pages or your hosting platform

---

## 🗄️ Database

Supabase/Postgres database includes:
- Profiles table with wins, losses, points, and ranks
- Questions table with title, description, difficulty, and test cases
- Queue table for matchmaking
- Battles and Submissions tables for storing game sessions and results

Row Level Security (RLS) policies ensure users only access their own data.

---

## 🔁 Game Flow

1. Players choose a mode and join the matchmaking queue
2. The system pairs players and starts a battle with a chosen question
3. Players code in the editor, submit solutions, and tests run automatically
4. Results are displayed and the winner is determined
5. Player profiles update with wins/losses and ranking points

---

## 🧮 Ranking System

- Points = wins − 0.5 × loses (minimum 0)  
- Rank starts at 1 and increases by 1 for each 100 points, capped at 5

---

## 🐛 Common Issues

- Ensure Supabase Realtime is enabled for battles and queue updates
- If routes fail on GitHub Pages, include a redirect in a 404.html file
- For Judge0 API, confirm your endpoint and API key are correct

---

## 🙌 Contributions

Contributions, issues, and feature requests are welcome. Please open an issue to discuss before submitting a pull request.
