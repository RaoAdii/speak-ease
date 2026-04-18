# Speak Ease - React + Express + MongoDB

This repository keeps the same Duolingo-clone product scope from the original project, but the stack has been migrated away from Next.js, Clerk, and Drizzle.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Express.js
- Database: MongoDB + Mongoose
- Auth: JWT-based email/password auth
- Admin: React Admin against the Express API

## Structure

```text
.
|-- client
|   |-- public
|   |-- src
|   |-- package.json
|   `-- .env.example
|-- server
|   |-- scripts
|   |-- src
|   |-- package.json
|   `-- .env.example
`-- todo.md
```

## Setup

1. Install frontend dependencies:

```bash
cd client
npm install
```

2. Install backend dependencies:

```bash
cd ../server
npm install
```

3. Create the environment files:

```powershell
Copy-Item client/.env.example client/.env
Copy-Item server/.env.example server/.env
```

4. Update `server/.env` with:

- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_EMAILS`

5. Seed the MongoDB database:

```bash
cd server
npm run seed
```

6. Start the backend:

```bash
cd server
npm run dev
```

7. Start the frontend in another terminal:

```bash
cd client
npm run dev
```

8. Open `http://localhost:5173`.

## Feature Scope Preserved

- Marketing page
- Sign in and sign up
- Course selection
- Learn page with unit progression
- Lesson quiz flow with hearts and XP
- Quests
- Leaderboard
- Shop
- Admin CRUD for courses, units, lessons, challenges, and challenge options

## Notes

- The root `package.json` has been removed. `client` and `server` are fully separate.
- Public lesson images and audio now live in `client/public`.
- The migration checklist is tracked in `todo.md`.
