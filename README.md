# rms-ui

Frontend for the Room Management System (RMS): React + Vite.
Backend repo: **rms-api** (must be running, default http://localhost:5000).

## Structure
```
rms-ui/src/
├── main.jsx, App.jsx          entry point and routes
├── api/client.js              axios setup (adds the login token) + helpers
├── context/AuthContext.jsx    who is logged in
├── components/                Layout (nav bar), ExpenseForm
└── pages/
    ├── Login.jsx, Profile.jsx     both roles
    ├── user/MyExpenses.jsx        user page
    └── admin/                     Dashboard, Expenses, Rent, Members
```

## Run it
```bash
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```
Open http://localhost:5173 and log in with the admin account created by `rms-api`.

Production build: `npm run build` (output in `dist/`).
