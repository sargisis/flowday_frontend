# Flowday - Smart Project & Task Management

Flowday is a modern, collaborative platform designed to streamline project management and task tracking. This repository contains both the **React Frontend** and the **Go Backend**.

> [!NOTE]  
> This project is currently in **pre-v1** status. Many core features are implemented, but refinement and final stabilizing work are ongoing.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- Secure **JWT-based Authentication**.
- **User Registration & Login** with password hashing (bcrypt).
- **Password Reset** flow via email notifications.
- **Protected Routes** ensuring project data is only accessible to authorized members.

### 📁 Project Management
- Create, manage, and track multiple projects.
- **Ownership Control:** Projects are managed by owners who can invite/remove members.
- **Team Management:** Seamless invitation system (GitHub style).
- **Email Notifications:** Automatic emails for invitations, acceptance, and rejection.

### 📝 Task Tracking
- **Detailed Tasks:** Add descriptions, set statuses (Pending, In Progress, Completed).
- **Calendar Integration:** View your tasks organized by date.
- **Real-time Statistics:** Visual dashboard showing task progress and project metrics.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Vanilla CSS (Modern custom design system)
- **State/Routing:** React Router v6, Context API for project/auth state
- **API Client:** Axios

### Backend
- **Language:** Go (Golang)
- **Web Framework:** Gin
- **Database:** MongoDB (using official Go driver)
- **Email:** Native SMTP integration
- **Auth:** JWT (Golang JWT v5)

---

## 📁 Project Structure

```text
├── frontend/          # Frontend (React)
│   ├── src/
│   │   ├── api/       # API integration layers
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # React Contexts (Auth, Project)
│   │   └── pages/     # Main page views
│   └── ...
└── ...
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Go 1.21+](https://go.dev/)
- [Node.js 18+](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB instance

### Environment Configuration

### Running the Application

1. **Start the Backend:**
   ```bash
   cd Flowday/flowday
   go run ./server
   ```

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📈 Roadmap (Pre-v1)
- [x] Core Authentication
- [x] Project and Task CRUD
- [x] Team Invitation System
- [x] Calendar View
- [ ] Drag-and-drop Task Kanban
- [ ] Real-time Collaboration (WebSockets)
- [ ] Advanced Dashboard Analytics
