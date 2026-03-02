# 🏢 Mini CRM — Full Stack Customer Relationship Manager

A full-stack CRM application built with the MERN stack. Manage customers, track leads through a sales pipeline, monitor activity logs, and receive real-time email notifications for every action.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

---

## ✨ Features

### Core
- 🔐 JWT Authentication (Register / Login / Protected routes)
- 👥 Full Customer CRUD (Create, Read, Update, Delete)
- 📋 Lead management per customer with pipeline statuses
- 📊 Live dashboard with stats (customers, leads by status)
- 🔍 Search customers by name or email
- 📄 Pagination on customer listings

### Advanced
- 🕐 **Activity Log** — every action (add/update/delete) is logged with a timestamp and shown as a timeline on each customer's page
- 📧 **Real-time Email Notifications** — beautiful branded emails fire instantly on every action:
  - New customer added
  - New lead added
  - Lead status changed
  - Lead deleted
- ⏰ **Follow-up Reminders** — set a follow-up date on any lead; a daily cron job sends reminder emails at 8 AM
- 🎨 **Premium UI** — warm editorial design with Playfair Display typography, dark green accents, and a cream palette

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & schemas |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Joi | Request validation |
| Nodemailer | Email notifications |
| node-cron | Scheduled follow-up reminders |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 (CRA) | UI framework |
| Tailwind CSS v3 | Utility styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client with JWT interceptor |
| React Hot Toast | Toast notifications |
| Context API | Global auth state |
| Google Fonts | Playfair Display + DM Sans typography |

---

## 📁 Project Structure

```
mini-crm/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # MongoDB connection
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT verification middleware
│   │   │   └── role.js                # Role-based access control
│   │   ├── models/
│   │   │   ├── User.js                # User schema
│   │   │   ├── Customer.js            # Customer schema
│   │   │   ├── Lead.js                # Lead schema (with followUpDate)
│   │   │   └── Activity.js            # Activity log schema
│   │   ├── routes/
│   │   │   ├── auth.js                # Register & Login
│   │   │   └── customers.js           # Customer + Lead + Activity routes
│   │   └── services/
│   │       └── reminderService.js     # Nodemailer + cron job
│   ├── tests/
│   │   └── auth.test.js               # Jest + Supertest auth tests
│   ├── server.js                      # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js               # Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.js         # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.js               # Login page
│   │   │   ├── Register.js            # Register page
│   │   │   ├── Dashboard.js           # Stats overview + recent customers
│   │   │   ├── Customers.js           # Customer list, search, pagination
│   │   │   └── CustomerDetail.js      # Leads + Activity log timeline
│   │   ├── App.js                     # Routes + protected route logic
│   │   └── index.js                   # Entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Gmail account (for email notifications)

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> For `EMAIL_PASS`: Go to Google Account → Security → App Passwords → generate one for "Mail"

Start the server:
```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs on `http://localhost:3000` (or 3001 if 3000 is busy)

---

## 📡 API Reference

### Auth Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login + get JWT | ❌ |

### Customer Routes (All Protected 🔒)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers` | Create customer |
| GET | `/api/customers` | List customers (paginated + searchable) |
| GET | `/api/customers/stats` | Lead stats by status |
| GET | `/api/customers/:id` | Get customer + leads + activity log |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer + leads + activities |
| POST | `/api/customers/:id/leads` | Add lead to customer |
| PUT | `/api/customers/:id/leads/:leadId` | Update lead |
| DELETE | `/api/customers/:id/leads/:leadId` | Delete lead |

### Query Params

```
GET /api/customers?page=1&limit=10&q=google
```

---

## 📧 Email Notification System

Every action in the CRM triggers a branded email notification:

| Trigger | Email |
|---|---|
| New customer added | 👤 New customer added — {name} |
| New lead added | ✨ New lead added — {title} |
| Lead status changed | 🔄 Lead updated — {old} → {new} |
| Lead deleted | 🗑️ Lead deleted — {title} |
| Follow-up date reached | ⏰ Follow-up reminder — {title} |

The cron job runs daily at **8:00 AM** and checks for any leads with a follow-up date matching today.

To test reminders manually:
```
GET http://localhost:5000/api/test-reminders
```

---

## 🕐 Activity Log

Every mutation is recorded in the `Activity` collection:

```json
{
  "customerId": "...",
  "userId": "...",
  "action": "Lead status changed",
  "detail": "\"Enterprise Deal\" changed from New → Converted",
  "createdAt": "2024-03-02T12:30:00.000Z"
}
```

Activities are shown as a **visual timeline** on each customer's detail page.

---

## 📊 Lead Pipeline

```
New → Contacted → Converted ✅
              ↘ Lost ❌
```

---

## 🔐 Auth Flow

```
Register / Login
      ↓
JWT token stored in localStorage
      ↓
Axios interceptor attaches token to every request
      ↓
Backend middleware verifies token on protected routes
      ↓
Logout clears token + redirects to login
```

---
