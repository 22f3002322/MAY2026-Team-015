# Neighbourly

A modern Smart Apartment Community Management System built with **React, Vite, Tailwind CSS, and Zustand**.

Neighbourly is a role-based apartment management platform that simplifies communication, maintenance, billing, visitor management, facility booking, document management, and community engagement for apartment societies.

## Live Demo

Frontend deployment: [https://may-2026-team-015-dwgj-git-main-safwan-humayuns-projects.vercel.app/](https://may-2026-team-015-dwgj.vercel.app/)

## Table of Contents

- [What the Project Does](#what-the-project-does)
- [Project Team](#project-team)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Demo Credentials](#demo-credentials)
- [Authentication & State](#authentication--state)
- [Current Status](#current-status)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)



## What the Project Does

Neighbourly provides separate experiences for three primary roles:

- **Admin** — manage residents, apartments, staff, billing, visitors, complaints, facilities, notices, documents, polls, and reports
- **Resident** — view bills, raise complaints, register visitors, book facilities, vote in polls, and stay updated via notices and events
- **Staff** — role-specific workflows for Security, Maintenance, and Housekeeping

The current repository ships a complete frontend SPA with mock data and Zustand stores. Backend integration is planned and not included in this repo yet.

For frontend-focused setup details, see [frontend/README.md](frontend/README.md).

## Project Team


| Name           | Roll Number | Role                              |
| -------------- | ----------- | --------------------------------- |
| Yash Karsh     | 22f3002322  | Project Architect                 |
| Juhi Parekh    | 23f2005473  | Scrum Master                      |
| Safwan Humayun | 24f1001022  | Frontend Developer                |
| Saniya Naaz    | 23f2002592  | Backend Developer                 |
| Saumya Sarkar  | 21f3001551  | Backend Developer/Software Tester |




## Key Features



### Role-Based Access & Dashboards

- **Admin Portal** — analytics dashboard plus full control over residents, apartments, staff, billing, facility bookings, notices, documents, complaints, polls, visitors, reports, and settings
- **Resident Portal** — interactive dashboard with quick stats, bills & payments, complaints, visitor registration, documents, notices, facility booking, events, poll voting, profile, and settings
- **Staff Portal** — tailored views by role:
  - **Security** — visitor verification, visitor history, delivery register, incident reports, emergency contacts
  - **Maintenance** — assigned complaints, completed jobs, maintenance history
  - **Housekeeping** — cleaning tasks, cleaning schedule, completed cleaning



### Facility Bookings & Auto-Billing

- Residents reserve community facilities with date and time slots
- Admin reviews, edits, and approves bookings
- Upon approval, an invoice is automatically posted to the resident billing dashboard



### Dynamic Staff Scheduling & Job Filters

- Schedule status updates based on the current time (`upcoming`, `active`, `completed`)
- Staff only see jobs assigned to them or their department
- Admin assignment panel for shifts and tasks



### Polls & Complaints

- Admins create custom polls; residents vote and see result distributions
- Complaints are tracked by flat and identity for transparent resolution



### UI Highlights

- Dark mode, responsive layout, dashboard analytics
- Search & filters, pagination, loading skeletons, empty states
- Toast notifications, accessible components, smooth animations



## Tech Stack



### Frontend

- React 19
- Vite
- Tailwind CSS 4
- React Router DOM
- Lucide React
- Framer Motion



### State Management

- Zustand (with persist middleware)



### Forms & Validation

- React Hook Form
- Zod



### Charts & Notifications

- Recharts
- Sonner
- react-hot-toast



## Project Structure

```text
MAY2026-Team-015/
├── README.md
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── components/
        ├── pages/
        │   ├── admin/
        │   ├── resident/
        │   ├── staff/
        │   ├── Login.jsx
        │   ├── NotFound.jsx
        │   └── ServerError.jsx
        ├── store/
        ├── mock/
        ├── App.jsx
        ├── main.jsx
        └── index.css
```



## Getting Started



### Prerequisites

- Node.js 18+
- npm
- Git



### Clone and run

```bash
git clone https://github.com/22f3002322/MAY2026-Team-015.git
cd MAY2026-Team-015/frontend
npm install
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

### Other commands

```bash
npm run build    # production build
npm run preview  # preview production build
npm run lint     # run ESLint
```

No `.env` file is required for local frontend development with mock data.

## Demo Credentials


| Role               | Email                      | Password      |
| ------------------ | -------------------------- | ------------- |
| Admin              | `admin@example.com`        | `admin123`    |
| Demo Resident      | `william@example.com`      | `password123` |
| Security Staff     | `security@example.com`     | `staff123`    |
| Maintenance Staff  | `maintenance@example.com`  | `staff123`    |
| Housekeeping Staff | `housekeeping@example.com` | `staff123`    |




## Authentication & State

Role-based authentication supports Admin, Resident, and Staff.

Auth currently uses mock credentials and Zustand stores (with persistence) and is structured for later backend/API integration. Each feature has its own dedicated store under `frontend/src/store/`.

## Current Status

- Frontend complete (mock data)
- Responsive design and dark mode
- Role-based dashboards
- Backend not included in this repository (integration planned)



## Future Enhancements

- REST API integration
- JWT authentication
- Real-time notifications
- Payment gateway
- Email and push notifications
- Image uploads
- Expanded analytics
- Mobile application



## Contributing

Contributions are welcome.

```bash
# fork the repo on GitHub, then:
git clone https://github.com/22f3002322/MAY2026-Team-015.git
cd MAY2026-Team-015
git checkout -b feature/your-feature
# make your changes
git add .
git commit -m "Add your feature"
git push -u origin feature/your-feature
```

Then open a Pull Request on GitHub against this repository.

## Troubleshooting

**Dev server won't start**

```bash
cd frontend
rm -rf node_modules package-lock.json   # on Windows: Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm run dev
```

**Port already in use**

Vite defaults to port `5173`. Stop the other process using that port, or start Vite with a different port:

```bash
npm run dev -- --port 5174
```



## License

This project is developed for educational and portfolio purposes.
