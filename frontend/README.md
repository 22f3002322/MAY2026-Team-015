# Neighbourly — Frontend

Neighbourly is a modern Single Page Application (SPA) for residential society operations. Built with React, Vite, Tailwind CSS, Lucide icons, and Zustand, it offers a responsive experience for three primary roles: **Admins**, **Residents**, and **Staff**.

Project overview and team: see the [root README](../README.md).

## Live Demo

Frontend deployment: [https://may-2026-team-015-dwgj-git-main-safwan-humayuns-projects.vercel.app/](https://may-2026-team-015-dwgj-git-main-safwan-humayuns-projects.vercel.app/)

## Prerequisites

- Node.js 18+
- npm
- Git

## Clone & run (GitHub)

```bash
# clone the repository
git clone https://github.com/22f3002322/MAY2026-Team-015.git
cd MAY2026-Team-015/frontend

# install dependencies
npm install

# start local development server
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

### Production build

```bash
npm run build
npm run preview
```



### Contribute via GitHub

```bash
git checkout -b feature/your-change
git add .
git commit -m "Describe your change"
git push -u origin feature/your-change
# then open a Pull Request on GitHub
```



## Scripts


| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start Vite development server    |
| `npm run build`   | Create production build          |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Run ESLint                       |


No `.env` file is required for local development with mock data.

## Key Features



### 1. Role-Based Access & Dashboards

- **Admin Portal**: Complete control over residents, staff, billing, facility bookings, notices, documents, complaints, and polls.
- **Resident Dashboard**: Interactive cards showing quick stats (active complaints, due bills, approved bookings), bills list, active polls, notice board, and facility reservation system.
- **Staff Dashboard**: Tailored views based on role (Security, Housekeeping, Maintenance) displaying only assigned jobs, visitor registration/verification flow, and automated duty schedule.



### 2. Facility Bookings & Auto-Billing

- Residents can reserve community facilities (Club House, Swimming Pool, Gym, Party Hall, Tennis Court) choosing date and time slots.
- Admin reviews, edits, and approves bookings.
- **Auto-Billing Integration**: Upon Admin approval, an invoice is automatically generated and posted to the resident's billing dashboard.



### 3. Dynamic Staff Scheduling & Job Filters

- **Time-Dynamic Schedule Status**: Today's schedules update automatically on the staff profile based on the current actual time (transitioning dynamically between `upcoming`, `active`, and `completed`).
- **Assigned Job Filtering**: Strict filters guarantee staff members only view tasks assigned to them personally or to their specific department.
- **Admin Assignment Panel**: Dedicated admin management panel to schedule shifts and tasks for specific staff members.



### 4. Real-Time Polls & Complaints

- Admins can create complex custom polls.
- Residents can vote securely and immediately see live result distributions (via fallback title and option matching).
- Complaints are mapped by flat numbers and tracking identities to guarantee full resolution transparency.



## Technology Stack

- **Frontend**: React 19 (Vite)
- **Routing**: React Router DOM
- **State Management**: Zustand (with localStorage persistence)
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Motion**: Framer Motion
- **Charts**: Recharts
- **Notifications**: Sonner, react-hot-toast



## Default Credentials for Testing


| Role               | Email                      | Password      |
| ------------------ | -------------------------- | ------------- |
| Admin              | `admin@example.com`        | `admin123`    |
| Demo Resident      | `william@example.com`      | `password123` |
| Security Staff     | `security@example.com`     | `staff123`    |
| Maintenance Staff  | `maintenance@example.com`  | `staff123`    |
| Housekeeping Staff | `housekeeping@example.com` | `staff123`    |




## Project Notes

- Application state lives in Zustand stores under `src/store/`
- Mock data lives under `src/mock/`
- Role pages live under `src/pages/admin`, `src/pages/resident`, and `src/pages/staff`
- Auth is mock-based today and ready for later API integration

