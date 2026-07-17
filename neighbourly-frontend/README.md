# Neighbourly - Smart Community Management Portal

Neighbourly is a premium, modern, and state-of-the-art Single Page Application (SPA) designed to streamline residential society operations. Built with React, Tailwind CSS, Lucide icons, and Zustand for state management, it offers a visual, interactive, and responsive experience for three primary roles: **Admins**, **Residents**, and **Staff**.

---

## 🚀 Key Features

### 1. 🔑 Role-Based Access & Dashboards
*   **Admin Portal**: Complete control over residents, staff, billing, facility bookings, notices, documents, complaints, and polls.
*   **Resident Dashboard**: Interactive cards showing quick stats (active complaints, due bills, approved bookings), bills list, active polls, notice board, and facility reservation system.
*   **Staff Dashboard**: Tailored views based on role (Security, Housekeeping, Maintenance) displaying only assigned jobs, visitor registration/verification flow, and automated duty schedule.

### 2. 📅 Facility Bookings & Auto-Billing
*   Residents can reserve community facilities (Club House, Swimming Pool, Gym, Party Hall, Tennis Court) choosing date and time slots.
*   Admin reviews, edits, and approves bookings.
*   **Auto-Billing Integration**: Upon Admin approval, an invoice is automatically generated and posted to the resident's billing dashboard.

### 3. 🧹 Dynamic Staff Scheduling & Job Filters
*   **Time-Dynamic Schedule Status**: Today's schedules update automatically on the staff profile based on the current actual time (transitioning dynamically between `upcoming`, `active`, and `completed`).
*   **Assigned Job Filtering**: Strict filters guarantee staff members only view tasks assigned to them personally or to their specific department.
*   **Admin Assignment Panel**: Dedicated admin management panel to schedule shifts and tasks for specific staff members.

### 4. 🗳️ Real-Time Polls & Complaining
*   Admins can create complex custom polls.
*   Residents can vote securely and immediately see live result distributions (via fallback title and option matching).
*   Complaints are mapped by flat numbers and tracking identities to guarantee full resolution transparency.

---

## 🛠️ Technology Stack
*   **Frontend**: React (Vite)
*   **State Management**: Zustand (with localStorage persistence)
*   **Styling**: Custom CSS and utility styles
*   **Icons**: Lucide React
*   **Notifications**: Sonner

---

## 📖 Quick Start

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start local development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

### Default Credentials for Testing
*   **Admin**: `admin@example.com` / `admin123`
*   **Demo Resident**: `william@example.com` / `password123`
*   **Security Staff**: `security@example.com` / `staff123`
*   **Maintenance Staff**: `maintenance@example.com` / `staff123`
*   **Housekeeping Staff**: `housekeeping@example.com` / `staff123`
