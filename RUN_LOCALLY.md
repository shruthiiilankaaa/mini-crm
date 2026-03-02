
# Run Locally (Full instructions)

## Prerequisites
- Node.js 18+ and npm or pnpm/yarn
- MongoDB (local) or MongoDB Atlas connection string

## Backend
1. Open a terminal:
   ```bash
   cd backend
   cp .env.example .env
   # edit .env -> set MONGO_URI and JWT_SECRET
   npm install
   npm run dev
   ```
   Backend will run on http://localhost:5000 by default.

## Frontend
1. In a separate terminal:
   ```bash
   cd frontend
   cp .env.example .env
   # edit .env if you changed backend port / url
   npm install
   npm start
   ```
   Frontend will run on http://localhost:3000

## Notes
- The frontend uses localStorage to store the JWT token.
- There is a sample Jest test in `backend/tests/auth.test.js` you can run with `npm test` in the backend folder.
