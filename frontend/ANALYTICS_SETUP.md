# Analytics Setup - Google Analytics 4

This document describes how to set up and use Google Analytics 4 (GA4) in Flowday.

## Quick Setup

### Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with your Google account
3. Click **"Start measuring"** or **"Admin"** (gear icon)

### Step 2: Create a Property

1. In the Admin section, click **"Create Property"**
2. Enter property name: `Flowday` (or your preferred name)
3. Select time zone and currency
4. Click **"Next"**
5. Fill in business information (optional)
6. Click **"Create"**

### Step 3: Set up Data Stream

1. After creating property, select **"Web"** as platform
2. Enter website URL: `https://flowday.app` (or your domain)
3. Enter stream name: `Flowday Web`
4. Click **"Create stream"**

### Step 4: Get Measurement ID

1. After creating the stream, you'll see a **Measurement ID**
2. It looks like: `G-XXXXXXXXXX` (starts with "G-")
3. **Copy this ID**

### Step 5: Add to Your Project

1. Open `.env` file in `frontend/` directory
2. Add the Measurement ID:
   ```env
   VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Replace `G-XXXXXXXXXX` with your actual Measurement ID
4. Save the file
5. **Restart dev server** - analytics will start tracking

### Visual Guide

The Measurement ID can be found in:
- **Admin** → **Data Streams** → Select your stream → **Measurement ID**

It will look like this:
```
Measurement ID: G-ABC123XYZ
```

---

**Note:** 
- The Measurement ID is public (not a secret)
- You can use the same ID for development and production
- Analytics data appears in GA4 dashboard after a few hours

## Tracked Events

The following events are automatically tracked:

### User Events
- `sign_up` - User registration
- `login` - User login

### Task Events
- `task_create` - Task creation
- `task_complete` - Task completion
- `task_update` - Task updates

### Focus Mode Events
- `focus_start` - Focus session start
- `focus_end` - Focus session end

### Other Events
- `project_create` - Project creation
- `invitation_sent` - Team invitation sent
- `feature_use` - Feature usage
- `search` - Search queries
- `exception` - Errors (analytics only)

### Page Views
All page views are automatically tracked via `AnalyticsTracker` component.

## Usage in Code

### Track Custom Events

```typescript
import { trackEvent, trackFeatureUsage } from '../utils/analytics'

// Simple event
trackEvent('button_click', { button_name: 'create_task' })

// Feature usage
trackFeatureUsage('command_palette', { action: 'search' })
```

### Available Tracking Functions

```typescript
// User actions
trackRegistration('email')
trackLogin('email')

// Task actions
trackTaskCreate(taskId, 'high')
trackTaskComplete(taskId, durationMinutes)
trackTaskUpdate(taskId, 'status')

// Focus mode
trackFocusStart(taskId, plannedMinutes)
trackFocusEnd(taskId, actualMinutes)

// Other
trackProjectCreate(projectId)
trackInvitationSent(email)
trackSearch(query, resultCount)
```

## Privacy & GDPR

- Analytics only tracks if `VITE_GA4_MEASUREMENT_ID` is set
- No personal data is tracked (only user actions)
- Consider adding cookie consent banner for GDPR compliance
- Users can disable tracking via browser extensions

## Testing

1. **Development:** Analytics is disabled if Measurement ID is not set
2. **Testing:** Use GA4 Debug View to see events in real-time
3. **Production:** Events appear in GA4 dashboard after a few hours

## Disabling Analytics

To disable analytics:
1. Remove `VITE_GA4_MEASUREMENT_ID` from `.env`
2. Or set it to empty string
3. Restart the application

---

For more information, see [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
