# Flowday Frontend - Developer Documentation

**Version:** 1.0  
**Last Updated:** January 2025

---

## 📚 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Best Practices](#best-practices)

---

## Overview

Flowday is a **Flow State Operating System** - a productivity application focused on deep work and attention management. The frontend is built with React 19, TypeScript, and Vite.

### Key Features

- **Focus Mode**: Distraction-free environment with Pomodoro timer and audio engine
- **Task Management**: Global task system with Kanban board and calendar integration
- **Team Collaboration**: Project-based teams with invitations and messaging
- **Daily Ritual**: Morning planning flow for task prioritization
- **Analytics**: Dashboard with progress tracking and flow scores

---

## Technology Stack

### Core
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 5** - Build tool and dev server
- **React Router 7** - Client-side routing

### State Management
- **React Context API** - Global state (Task, Project, User, Focus contexts)
- **TanStack Query (React Query)** - Server state management and caching

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS
- **Custom CSS** - Glassmorphism design system
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Additional Libraries
- **Axios** - HTTP client
- **Zod** - Schema validation
- **date-fns** - Date utilities
- **@dnd-kit** - Drag and drop (Kanban)
- **canvas-confetti** - Achievement animations

### Development Tools
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Sentry** - Error tracking (optional)
- **PWA Plugin** - Progressive Web App support

---

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── robots.txt
│   └── vite.svg
├── src/
│   ├── api/               # API client functions
│   │   ├── axios.ts      # Axios instance & interceptors
│   │   ├── auth.ts       # Authentication API
│   │   ├── tasks.ts      # Tasks API
│   │   ├── projects.ts   # Projects API
│   │   ├── messages.ts   # Messages API
│   │   ├── notifications.ts
│   │   └── ai.ts         # AI features API
│   ├── components/        # React components
│   │   ├── achievements/  # Achievement badges & streaks
│   │   ├── activity/      # Activity feed
│   │   ├── ai/           # AI coach & bot
│   │   ├── command-palette/
│   │   ├── dashboard/    # Dashboard cards
│   │   ├── kanban/       # Kanban board
│   │   ├── notification/
│   │   ├── priority/     # Priority pipeline
│   │   ├── skeletons/    # Loading skeletons
│   │   ├── state/        # Empty states
│   │   ├── task-components/
│   │   └── ...
│   ├── context/          # React Context providers
│   │   ├── TaskContext.tsx
│   │   ├── ProjectContext.tsx
│   │   ├── UserContext.tsx
│   │   └── FocusContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useFocusTrend.ts
│   │   ├── useSound.ts
│   │   └── useTaskQueries.ts
│   ├── layouts/          # Layout components
│   │   └── DashboardLayout.tsx
│   ├── pages/            # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── TasksPage.tsx
│   │   ├── FocusMode.tsx
│   │   ├── Login.tsx
│   │   └── ...
│   ├── providers/        # App-level providers
│   │   └── QueryProvider.tsx
│   ├── routers/          # Routing configuration
│   │   └── router.tsx
│   ├── test/             # Test utilities
│   │   ├── setup.ts
│   │   └── utils.tsx
│   ├── utils/            # Utility functions
│   │   ├── cn.ts         # className utility
│   │   ├── audioEngine.ts
│   │   ├── notificationManager.ts
│   │   └── sentry.ts
│   ├── App.tsx           # (Removed - not used)
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── .env.example          # Environment variables template
├── vite.config.ts        # Vite configuration
├── vitest.config.ts      # Vitest configuration
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** or **yarn** or **pnpm**
- **Backend API** running (default: `http://localhost:8080`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flowday_frontend/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   VITE_FILE_UPLOAD_BASE_URL=http://localhost:8080
   VITE_SENTRY_DSN=your-sentry-dsn-here  # Optional
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

---

## Development Guide

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with HMR

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage report

# Code Quality
npm run lint             # Run ESLint
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the project structure
   - Use TypeScript for type safety
   - Write tests for new features
   - Follow existing code patterns

3. **Test your changes**
   ```bash
   npm run test:run
   npm run lint
   npm run build  # Ensure build succeeds
   ```

4. **Commit and push**
   ```bash
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with React and TypeScript rules
- **Formatting**: Follow existing code style
- **Naming**: 
  - Components: PascalCase (`TaskItem.tsx`)
  - Utilities: camelCase (`cn.ts`)
  - Constants: UPPER_SNAKE_CASE

---

## Testing

### Test Structure

Tests are co-located with the code they test:
- `ComponentName.test.tsx` - Component tests
- `utilName.test.ts` - Utility tests
- `hookName.test.ts` - Hook tests

### Running Tests

```bash
# Watch mode (recommended for development)
npm test

# Single run
npm run test:run

# With coverage
npm run test:coverage

# UI mode
npm run test:ui
```

### Writing Tests

Use React Testing Library for component tests:

```tsx
import { render, screen } from '../../test/utils'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

See `src/test/README.md` for more details.

### Test Coverage Goals

- Utilities: 90%+
- Components: 70%+
- Critical paths: 100%

---

## Build & Deployment

### Production Build

```bash
npm run build
```

This will:
- Type check the code (`tsc -b`)
- Build optimized production bundle
- Generate PWA files (manifest, service worker)
- Output to `dist/` directory

### Build Output

- `dist/index.html` - Entry HTML
- `dist/assets/js/` - JavaScript chunks (code split)
- `dist/assets/css/` - CSS files
- `dist/manifest.webmanifest` - PWA manifest
- `dist/sw.js` - Service Worker
- `dist/workbox-*.js` - Workbox runtime

### Deployment

The `dist/` folder contains static files that can be deployed to:
- **Vercel** (recommended for React)
- **Netlify**
- **AWS S3 + CloudFront**
- **Any static hosting**

---

## Configuration

### Environment Variables

All environment variables must start with `VITE_` to be accessible in the code.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api/v1` |
| `VITE_FILE_UPLOAD_BASE_URL` | File upload base URL | `http://localhost:8080` |
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking | (optional) |
| `VITE_GA4_MEASUREMENT_ID` | Google Analytics 4 Measurement ID | (optional) |

See `ENV_SETUP.md` for detailed configuration.

### Vite Configuration

Main configuration file: `vite.config.ts`

Key features:
- Code splitting (manual chunks)
- PWA plugin configuration
- Build optimizations
- Path aliases (`@/` for `src/`)

### TypeScript Configuration

- `tsconfig.json` - Root config
- `tsconfig.app.json` - App code config
- `tsconfig.node.json` - Node scripts config

---

## Architecture

### State Management

The application uses a hybrid approach:

1. **React Context API** - Global application state
   - `TaskContext` - Task management
   - `ProjectContext` - Project selection
   - `UserContext` - User data
   - `FocusContext` - Focus mode state

2. **TanStack Query** - Server state
   - Automatic caching
   - Background refetching
   - Optimistic updates
   - Error handling

### Routing

- **React Router 7** with `createBrowserRouter`
- Code splitting with `React.lazy()`
- Protected routes via `ProtectedRoute` component
- Route-based code splitting for performance

### API Layer

- **Axios** instance in `src/api/axios.ts`
- Automatic token injection
- Token refresh handling
- Error interceptors
- Retry logic for network errors

### Component Architecture

- **Pages** - Route-level components
- **Components** - Reusable UI components
- **Layouts** - Layout wrappers
- **Contexts** - State providers
- **Hooks** - Custom logic hooks

---

## Best Practices

### Component Development

1. **Use TypeScript** for all components
2. **Keep components small** and focused
3. **Extract logic** into custom hooks
4. **Use Context** for global state, props for local state
5. **Memoize expensive computations** with `useMemo`
6. **Handle loading and error states**

### API Integration

1. **Use TanStack Query** for data fetching
2. **Handle errors gracefully** with error boundaries
3. **Show loading states** with skeletons
4. **Implement optimistic updates** where appropriate
5. **Cache appropriately** using React Query defaults

### Performance

1. **Code splitting** - Routes are lazy loaded
2. **Image optimization** - Use lazy loading
3. **Memoization** - Use `React.memo` for expensive components
4. **Virtual scrolling** - For long lists (future improvement)
5. **Bundle size** - Monitor with `npm run build`

### Accessibility

1. **ARIA labels** - Add where needed
2. **Keyboard navigation** - Ensure all interactive elements are accessible
3. **Color contrast** - Follow WCAG guidelines
4. **Screen readers** - Test with screen reader tools

---

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**
- Run `npm run lint` to see detailed errors
- Check `tsconfig.json` configuration
- Ensure all types are properly defined

**Tests fail:**
- Clear test cache: Delete `node_modules/.vite`
- Check `vitest.config.ts` configuration
- Ensure test setup files are correct

**API requests fail:**
- Check `VITE_API_BASE_URL` in `.env`
- Verify backend is running
- Check browser console for CORS errors

**PWA not working:**
- Ensure `vite-plugin-pwa` is configured
- Check that icons exist in `public/`
- Verify manifest is generated in `dist/`

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [TanStack Query Docs](https://tanstack.com/query)
- [React Router Docs](https://reactrouter.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

## Contributing

1. Follow the code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Ensure build passes before committing
5. Use meaningful commit messages

---

**Last Updated:** January 2025  
**Maintained by:** Flowday Team
