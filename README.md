# Flowday - Flow State OS

**Flowday** is more than a project management tool—it is an **Operating System for Deep Work**. Designed to remove friction and help you manage your attention, not just your tasks.

> [!NOTE]  
> This project is currently in **Beta (Pre-v1)**. Core flows are stable, but we are actively refining the "Deep Work" features.

---

## 🧠 Core Philosophy: The Flow State

Most tools distract you with notifications and clutter. Flowday is designed to **disappear**, allowing you to enter a state of deep focus.

### 🌟 Key Experience Features

#### 🧘 Daily Ritual
- **Intention Setting:** Start your day with a guided morning ritual.
- **Commitment:** Select 1-3 critical tasks to conquer. "Inbox Zero" for your mind before you start.

#### ⚡ Focus Mode
- **Immersive Interface:** Enter a distraction-free full-screen environment for a specific task.
- **Neuro-Audio Engine:** Built-in **Brown Noise** generator to mask distractions and improve concentration.
- **Pomodoro Timer:** Integrated 25-minute deep work cycles.

#### � Visual Intelligence
- **Glassmorphism UI:** A premium, modern dark-mode aesthetic that feels calm and professional.
- **Real-time Specs:** Dashboard with progress tracking, flow scores, and activity trends.

---

## 🚀 Standard Features

### 🔐 Security & Identity
- **JWT Authentication:** Secure login/registration sessions.
- **Team Invitations:** GitHub-style invitation system with email notifications.
- **Role Control:** Project owners manage access and permissions.

### � Project & Task Management
- **Projects:** Organize work into dedicated workspaces.
- **Tasks:** Rich task details, status tracking (Todo, In Progress, Done).
- **Calendar:** Unified view of deadlines and schedules.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Vanilla CSS (Custom Design System with Variables & Glassmorphism)
- **Audio:** Web Audio API (Custom Audio Engine)
- **State:** React Context + Hooks

### Backend
- **Language:** Go (Golang)
- **Framework:** Gin Web Framework
- **Database:** MongoDB (Official Driver)
- **Auth:** JWT v5 + Bcrypt
- **Email:** Native SMTP

---

## ⚙️ Quick Start

### Prerequisites
- [Go 1.21+](https://go.dev/)
- [Node.js 18+](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local instance.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sargisis/flowday_frontend.git
   ```

2. **Start the Backend:**
   ```bash
   cd Flowday/flowday
   # Create a .env file based on .env.example (if available)
   go run ./server
   ```

3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The app will be available at `http://localhost:5173` (Frontend) and `http://localhost:8080` (Backend API).

---

## 📈 Roadmap
- [x] **Focus Mode (v1):** Timer & Audio
- [x] **Daily Ritual:** Morning planning flow
- [x] **New Branding:** "Flow State OS"
- [ ] **Advanced Analytics:** usage heatmaps & "Flow Score" calculation
- [ ] **Team Chat:** Real-time collaboration updates
- [ ] **Mobile Support:** Responsive layouts for phone/tablet

---

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-Deep%20Work-orange?style=for-the-badge" alt="Built with Deep Work" />
</p>
