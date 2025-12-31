# Flowday - Flow State OS

**Flowday** is more than a project management tool—it is an **Operating System for Deep Work**. Designed to remove friction and help you manage your attention, not just your tasks.

> [!IMPORTANT]  
> **Latest Update (Dec 31, 2024):** Core "Deep Work" infrastructure overhaul. Implemented Global Task Management and Interactive Calendar.

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
- **Smart Timer:** Resume-ready Pomodoro timer that remembers your progress during breaks.
- **Quick-Access Widget:** Floating interactive timer to stay focused while browsing other apps.

#### 📅 Interactive Calendar (New!)
- **Seamless Planning:** Click any date to instantly create a task with a pre-set deadline.
- **Unified Overview:** View and edit tasks directly from the calendar grid.
- **Real-time Sync:** All changes reflect instantly across the Dashboard and Task pages.

#### 📊 Visual Intelligence
- **Glassmorphism UI:** A premium, modern dark-mode aesthetic that feels calm and professional.
- **Real-time Specs:** Dashboard with progress tracking, flow scores, and activity trends.

---

## 🚀 Standard Features

### 🔐 Security & Identity
- **JWT Authentication:** Secure login/registration sessions.
- **Team Invitations:** GitHub-style invitation system with email notifications.
- **Granular Access:** Project members (not just owners) can now manage tasks, facilitating true team collaboration.
- **Session Stability:** Fixed authentication handling to prevent accidental logouts during task management.

### 🛠️ Global Task Engine
- **TaskContext:** Centralized state management for tasks across the entire app.
- **Command Palette:** `Cmd+K` integration to search and edit tasks from anywhere.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **State Management:** React Context API (Custom Task & Project providers)
- **Styling:** Vanilla CSS (Custom Design System with Variables & Glassmorphism)
- **Audio:** Web Audio API (Custom Audio Engine)

### Backend
- **Language:** Go (Golang)
- **Framework:** Gin Web Framework
- **Database:** MongoDB (Official Driver)
- **Auth:** JWT v5 + Bcrypt

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
   go run ./server
   ```

3. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📈 Roadmap
- [x] **Focus Mode (v1):** Timer & Audio
- [x] **Daily Ritual:** Morning planning flow
- [x] **Global Task Infrastructure:** TaskContext & Shared Modals
- [x] **Interactive Calendar:** Date-click creation & editing
- [ ] **Advanced Analytics:** usage heatmaps & "Flow Score" calculation
- [ ] **Team Chat:** Real-time collaboration updates
- [ ] **Mobile Support:** Responsive layouts for phone/tablet

---

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-Deep%20Work-orange?style=for-the-badge" alt="Built with Deep Work" />
</p>
