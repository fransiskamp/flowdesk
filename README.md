# FlowDesk

> A modern productivity workspace for managing projects, tasks, and team collaboration.

FlowDesk is a full-stack productivity workspace designed to help teams organize projects, manage tasks, and collaborate in one centralized platform.

The application provides project management workflows with task tracking, Kanban boards, team member management, activity history, and secure authentication.

## ✨ Features

### 🔐 Authentication

* Email and password authentication
* Secure session management with Better Auth
* Password reset flow
* Protected application routes

### 📊 Dashboard

* Overview of workspace activity
* Task statistics
* Project overview
* Recent activity
* Quick access to ongoing work

### 📁 Project Management

* Create and manage projects
* Edit project information
* Delete projects
* Project-specific task management
* Project overview and details

### ✅ Task Management

* Create, edit, and delete tasks
* Task status tracking
* Priority levels
* Due dates
* Task assignment
* Task detail pages
* Pagination and filtering

### 📋 Kanban Board

* Visual task management
* Status-based task columns
* Drag-and-drop workflow
* Quick task status updates

### 👥 Team & Members

* Workspace member management
* Member roles
* Invite members
* Edit member roles
* Remove members
* Role-based access control

### 📝 Activity Tracking

* Records important workspace actions
* Tracks project and task activity
* Provides a centralized activity history

## 🛠️ Tech Stack

| Category        | Technology   |
| --------------- | ------------ |
| Framework       | Next.js      |
| Language        | TypeScript   |
| Styling         | Tailwind CSS |
| Authentication  | Better Auth  |
| Database        | PostgreSQL   |
| ORM             | Drizzle ORM  |
| UI              | React        |
| Validation      | Zod          |
| Email           | Resend       |
| Package Manager | npm          |

## 🏗️ Architecture

FlowDesk follows a modern full-stack architecture using Next.js App Router.

```text
┌──────────────────────────────┐
│          Frontend            │
│       Next.js + React        │
│      TypeScript + Tailwind   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        API Layer             │
│       Next.js Route          │
│          Handlers            │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ Better Auth │  │   Drizzle   │
│             │  │     ORM     │
└─────────────┘  └──────┬──────┘
                        │
                        ▼
                ┌─────────────┐
                │ PostgreSQL  │
                └─────────────┘
```

## 📂 Project Structure

```text
flowdesk/
├── app/
│   ├── activity/
│   ├── api/
│   │   ├── auth/
│   │   ├── members/
│   │   ├── projects/
│   │   └── tasks/
│   ├── dashboard/
│   ├── forgot-password/
│   ├── login/
│   ├── members/
│   ├── projects/
│   ├── register/
│   ├── reset-password/
│   └── tasks/
│
├── components/
│   ├── dashboard/
│   ├── kanban/
│   ├── landing/
│   ├── members/
│   ├── projects/
│   └── tasks/
│
├── db/
│   ├── index.ts
│   └── schema.ts
│
├── drizzle/
│   └── migrations/
│
├── lib/
│   ├── activity.ts
│   ├── auth.ts
│   └── auth-client.ts
│
├── scripts/
│   └── seed.ts
│
├── drizzle.config.ts
├── package.json
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/fransiskamp/flowdesk.git
cd flowdesk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="your_postgresql_connection_string"
BETTER_AUTH_SECRET="your_auth_secret"
BETTER_AUTH_URL="http://localhost:3000"
RESEND_API_KEY="your_resend_api_key"
```

> Never commit `.env.local` or other files containing secrets to the repository.

### 4. Run database migrations

```bash
npx drizzle-kit migrate
```

### 5. Seed the database

```bash
npx tsx scripts/seed.ts
```

### 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🔑 Demo Accounts

For local development, demo accounts can be created through the registration flow or the provided seed script.

> Do not use real passwords or credentials in development seeds committed to a public repository.

## 🧪 Type Checking

Run TypeScript validation with:

```bash
npx tsc --noEmit
```

## 📌 Development Notes

FlowDesk is structured around a workspace-based productivity model.

Core entities include:

```text
User
 │
 └── Workspace Membership
        │
        ├── Role
        │
        └── Workspace
              │
              ├── Projects
              │      └── Tasks
              │
              ├── Members
              │
              └── Activities
```

This structure allows authentication, authorization, project management, task management, and activity tracking to work together within a single workspace.

## 🎯 Project Goals

FlowDesk was built as a portfolio project to demonstrate practical full-stack development skills, including:

* Building a production-style Next.js application
* Designing relational database schemas
* Implementing authentication and authorization
* Developing REST-style API routes
* Managing application state and user interactions
* Building reusable React components
* Implementing CRUD workflows
* Working with database migrations
* Designing role-based workspace functionality
* Creating a responsive productivity interface

## 🔮 Future Improvements

Potential improvements include:

* Real-time collaboration
* Notifications
* Advanced task filtering
* Search functionality
* File attachments
* Comments and task discussions
* Workspace settings
* More granular permissions
* Automated testing
* Deployment and CI/CD pipeline

## 📄 License

This project is currently intended as a personal portfolio project.

---

Built with TypeScript, Next.js, PostgreSQL, and Drizzle ORM.