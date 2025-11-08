# 🐛 Bug Tracker# 🐛 Bug Tracker - Dynamic Bug Reporting System

A modern bug tracking application with Google OAuth, GitHub integration, and points system. Built with React Native and Express.js + MongoDB.A modern, production-ready bug tracking application featuring Google OAuth authentication, GitHub integration, gamified points system, and intelligent network handling. Built with React Native for mobile and Express.js + MongoDB for the backend.

## ✨ Features## ✨ Features

- **Google Sign-In** - Firebase authentication### � Authentication & Security

- **GitHub Integration** - Required repo links for bugs

- **Project Management** - Organize bugs by projects- **Google Sign-In** - Seamless authentication via Firebase Auth

- **File Attachments** - Upload screenshots and documents- **JWT Token Management** - Secure session handling with automatic refresh

- **Dark Theme** - Clean black UI- **User Isolation** - Complete data separation per authenticated user

- **Points System** - Track contributions and statistics- **Profile Management** - Customizable user profiles with avatar support

- **Smart Networking** - Retry logic and offline support

### 🐛 Bug Management

## 🚀 Quick Start

- **GitHub Repository Integration** - Required GitHub repo metadata for all bugs

### Prerequisites- **Rich Bug Details** - Title, description, priority, status, and attachments

- **File Attachments** - Upload and manage bug screenshots and documents

- Node.js 16+- **Bug Lifecycle Tracking** - From open → in-progress → resolved → closed

- React Native development environment- **Smart Deletion** - Cascade delete bugs when projects are removed

- MongoDB (local or Atlas)

- Firebase project with Google Sign-In enabled### 🚀 Project Organization

- Android Studio or Xcode

- **Multi-Project Support** - Organize bugs across different projects

### Installation- **Project Dashboard** - Overview statistics and quick access

- **User-Scoped Projects** - Projects isolated to authenticated users

1. **Clone and install**- **Project Details** - View all bugs within a project context

````bash### 🎨 User Experience

git clone https://github.com/anirudh-pedro/Bug-Tracker.git

cd Bug-Tracker- **Dark Theme UI** - Elegant black (#000000) background with transparent accents

- **Onboarding Flow** - Smooth first-time user experience

# Install dependencies- **Responsive Design** - Optimized layouts for all screen sizes

cd server && npm install- **Loading States** - Visual feedback during async operations

cd ../frontend && npm install

```### 📱 Mobile Network Excellence



2. **Configure Firebase**- **Intelligent Retry Logic** - Exponential backoff for failed requests

- **Multiple URL Fallbacks** - Automatic failover to backup servers

- Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)- **Network Quality Monitoring** - Adaptive behavior based on connection speed

- Enable Google Sign-In- **Extended Timeouts** - Mobile-friendly request timeouts (30s)

- Download `google-services.json` → `frontend/android/app/`- **Circuit Breaker Pattern** - Prevents cascading failures

- Download `GoogleService-Info.plist` → Add to Xcode project

### 🏆 Gamification

3. **Environment setup**

- **Points System** - Award points for bug fixes and contributions

Create `server/.env`:- **User Statistics** - Track bugs reported, fixed, and points earned

- **Leaderboards** - Compare performance with other users

```env

mongo_uri=mongodb://localhost:27017/bugtracker## 🚀 Quick Start

JWT_SECRET=your-secret-key

PORT=5000### Prerequisites

NODE_ENV=development

```- **Node.js** 16+ and npm

- **React Native** development environment ([setup guide](https://reactnative.dev/docs/environment-setup))

4. **Network configuration**- **MongoDB** database (local or cloud)

- **Firebase Project** with Google Sign-In enabled

Find your IP: `cd server && npm run find-ip`- **Android Studio** (for Android) or **Xcode** (for iOS)

- Physical Android/iOS device or emulator

Update `frontend/src/config/networkConfig.js`:

### Installation

```javascript

const DEV_BACKEND_IP = '10.126.128.115'; // Your IP here1. **Clone the repository**

````

````bash

5. **Run the app**git clone https://github.com/anirudh-pedro/Bug-Tracker.git

cd Bug-Tracker

```bash```

# Terminal 1 - Start backend

cd server && npm start2. **Install server dependencies**



# Terminal 2 - Run mobile app```bash

cd frontendcd server

npx react-native run-android  # or run-iosnpm install

````

## 🛠️ Tech Stack3. **Install frontend dependencies**

**Frontend:** React Native, Firebase Auth, React Navigation, AsyncStorage```bash

cd ../frontend

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjsnpm install

````

**Tools:** Metro Bundler, Gradle, CocoaPods

4. **Configure Firebase**

## 📱 Mobile Testing

   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

Testing on physical device:   - Enable Google Sign-In in Authentication → Sign-in methods

   - Download `google-services.json` (Android) and place in `frontend/android/app/`

1. Enable mobile hotspot   - Download `GoogleService-Info.plist` (iOS) and add to Xcode project

2. Connect computer to hotspot

3. Run `npm run find-ip` and update `networkConfig.js`5. **Set up environment variables**

4. Allow port 5000 in firewall

5. Start server and run appCreate `server/.env`:



See [Mobile Network Setup](MOBILE_NETWORK_SETUP.md) for detailed guide.```env

mongo_uri=mongodb://localhost:27017/bugtracker

## 🐛 Troubleshooting# or use MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/bugtracker



### Cannot connect to server?JWT_SECRET=your-super-secret-jwt-key-change-this

PORT=5000

```bashNODE_ENV=development

# Test server```

curl http://YOUR_IP:5000/api/health

6. **Find your computer's IP address**

# Should return: {"status":"ok","timestamp":"..."}

```For mobile testing on the same network:



- Check firewall allows port 5000```bash

- Verify same WiFi networkcd server

- Confirm IP in `networkConfig.js`npm run find-ip

````

### Google Sign-In issues?

This will display your local IP (e.g., `10.126.128.115`).

- Verify `google-services.json` in `frontend/android/app/`

- Check Firebase Console has Google Sign-In enabled7. **Configure network settings**

- Clear app data and retry

Update `frontend/src/config/networkConfig.js`:

### Build errors?

````javascript

**Android:**// Development IP - replace with YOUR IP from step 6

```bashconst DEV_BACKEND_IP = "10.126.128.115"; // ← Change this!

cd frontend/android && ./gradlew cleanconst DEV_BACKEND_PORT = "5000";

npx react-native run-android

```const DEVELOPMENT_URLS = [

  `http://${DEV_BACKEND_IP}:${DEV_BACKEND_PORT}`, // Primary

**iOS:**  "http://10.0.2.2:5000", // Android emulator fallback

```bash  "http://localhost:5000", // iOS simulator fallback

cd frontend/ios && pod install];

npx react-native run-ios```

````

8. **Start the MongoDB server** (if running locally)

## 📝 API Endpoints

````bash

### Authenticationmongod

- `POST /api/auth/google` - Google Sign-In```

- `GET /api/users/profile-status` - Onboarding status

9. **Start the backend server**

### Projects

- `GET /api/projects` - List projects```bash

- `POST /api/projects` - Create projectcd server

- `DELETE /api/projects/:id` - Delete projectnpm start

````

### Bugs

- `GET /api/bugs` - List bugs (filters: `?status=open&priority=high`)You should see: `✅ Server running on port 5000`

- `POST /api/bugs` - Create bug (requires: title, description, projectId, githubRepo)

- `PUT /api/bugs/:id` - Update bug10. **Run the mobile app**

- `DELETE /api/bugs/:id` - Delete bug

**For Android:**

### System

- `GET /api/health` - Health check```bash

- `GET /api/dashboard/stats` - Dashboard statisticscd frontend

npx react-native run-android

## 🚀 Deployment```

### Backend**For iOS:**

`env`bash

NODE_ENV=productioncd frontend

mongo_uri=mongodb+srv://user:pass@cluster.mongodb.net/bugtrackernpx pod-install

JWT_SECRET=strong-random-secretnpx react-native run-ios

````



Update CORS in `server/server.js` to your domain.11. **Test the connection**



### Frontend- Open the app on your device/emulator

- Tap **"Get Started"**

Update `frontend/src/config/networkConfig.js`:- Sign in with Google

- You should land on the dashboard!

```javascript

const PRODUCTION_BACKEND_URL = 'https://api.yourdomain.com';## 📱 Mobile Network Setup

```

Testing on your phone using mobile network? See our detailed guides:

Build releases:

```bash- **[Mobile Network Setup Guide](MOBILE_NETWORK_SETUP.md)** - Complete setup instructions

# Android- **[Quick Reference](NETWORK_QUICK_REFERENCE.md)** - Quick command reference

cd frontend/android && ./gradlew bundleRelease

### Quick Mobile Setup

# iOS

# Open in Xcode → Product → Archive1. Enable mobile hotspot on your phone

```2. Connect your computer to the hotspot

3. Run `npm run find-ip` in the server directory

## 🔐 Security4. Update `networkConfig.js` with the displayed IP

5. Configure firewall to allow port 5000

- Firebase OAuth 2.0 & JWT tokens6. Start the server and run the app

- Rate limiting (100 req/15min)

- Helmet security headers## 🛠️ Technology Stack

- User data isolation

- bcrypt password hashing### Frontend (Mobile)



⚠️ **Before production:** Change JWT_SECRET, update CORS, enable HTTPS- **React Native 0.80+** - Cross-platform mobile framework

- **React Navigation v6** - Native stack and tab navigation

## 🤝 Contributing- **Firebase Auth** - Google Sign-In integration

- **AsyncStorage** - Secure local token and data persistence

1. Fork the repo- **React Native Vector Icons** - Material and Ionicons icon sets

2. Create feature branch (`git checkout -b feature/name`)- **Custom Network Layer** - Enhanced retry logic and error handling

3. Commit changes (`git commit -m 'feat: description'`)

4. Push to branch (`git push origin feature/name`)### Backend (Server)

5. Open Pull Request

- **Node.js** - JavaScript runtime

## 📄 License- **Express.js** - Web application framework

- **MongoDB** - NoSQL database

MIT License - see [LICENSE](LICENSE)- **Mongoose** - MongoDB object modeling

- **JWT (jsonwebtoken)** - Stateless authentication

## 👥 Author- **bcryptjs** - Password hashing

- **express-rate-limit** - Rate limiting middleware

**Anirudh** - [anirudh-pedro](https://github.com/anirudh-pedro)- **Helmet** - Security headers

- **Compression** - Response compression

## 📧 Support- **CORS** - Cross-origin resource sharing



- [Issues](https://github.com/anirudh-pedro/Bug-Tracker/issues)### DevOps & Tools

- [Mobile Network Setup Guide](MOBILE_NETWORK_SETUP.md)

- [Enhanced Features](ENHANCED_FEATURES.md)- **Metro Bundler** - React Native build tool

- **Gradle** - Android build system

---- **CocoaPods** - iOS dependency management

- **Git** - Version control

**Built with ❤️ for better bug tracking**- **npm** - Package management


## 📚 Documentation

- [Enhanced Features](ENHANCED_FEATURES.md) - Detailed feature documentation
- [Mobile Network Setup](MOBILE_NETWORK_SETUP.md) - Network configuration guide
- [Quick Reference](NETWORK_QUICK_REFERENCE.md) - Command and config reference

## 🔧 Configuration Files

### Network & API Configuration

- **`frontend/src/config/networkConfig.js`** - Core network settings

  - Backend URLs (development, emulator, production)
  - Timeout configurations (30s for mobile networks)
  - Retry logic (3 attempts with exponential backoff)
  - Multiple fallback URLs for resilience

- **`frontend/src/config/apiConfig.js`** - API endpoint definitions

  - Auth endpoints (`/api/auth/google`, `/api/auth/login`)
  - Bug CRUD operations
  - Project management
  - User profile routes

- **`frontend/src/config/authConfig.js`** - Authentication configuration
  - Token management
  - Firebase integration
  - Session handling

### Network Utilities

- **`frontend/src/utils/enhancedNetworkUtils.js`** - Production-grade networking

  - Circuit breaker pattern
  - Automatic retry with backoff
  - Request deduplication
  - Network quality detection
  - Server connectivity testing
  - Centralized error handling

- **`frontend/src/utils/networkUtils.js`** - Basic network helpers
  - Simple request wrapper
  - Response caching
  - Token injection

## 🎯 Key Features in Detail

### Google OAuth Authentication

The app uses Firebase Authentication for a seamless Google Sign-In experience:

1. User taps "Sign in with Google"
2. Firebase handles OAuth flow
3. Backend receives Google ID token at `/api/auth/google`
4. Server validates token and creates/fetches user
5. JWT access token returned to client
6. Token stored securely in AsyncStorage
7. Automatic token injection in all API requests

**First-time users** complete an onboarding flow to set username and preferences.

### GitHub Integration & Bug Workflow

Every bug **requires** a GitHub repository link:

- **Repository URL** - Must be a valid GitHub repo
- **Branch Tracking** - Specify which branch has the bug
- **Attachment Support** - Upload screenshots, logs, or documents
- **Status Lifecycle** - Open → In Progress → Resolved → Closed
- **Priority Levels** - Low, Medium, High, Critical
- **Assignee Management** - Assign bugs to team members

### Project-Based Organization

Bugs are organized into projects for better management:

- **Create Projects** - Define project name, description, and settings
- **Bug Grouping** - View all bugs within a project
- **Project Dashboard** - Statistics on open/closed bugs
- **Cascade Deletion** - Deleting a project removes all its bugs
- **User Isolation** - Projects are scoped to the authenticated user

### Enhanced Network Handling

Built for unreliable mobile networks:

- **Automatic Retries** - Failed requests retry up to 3 times
- **Exponential Backoff** - 1s → 2s → 4s delays between retries
- **URL Fallbacks** - Tries multiple backend URLs if primary fails
- **Connection Testing** - `/api/health` endpoint for diagnostics
- **Timeout Management** - 30-second timeouts for slow connections
- **Error Categorization** - Network, auth, validation, and server errors

### Points & Gamification

Motivate your team with a built-in points system:

- **Bug Bounties** - Set point rewards for fixing bugs
- **Profile Statistics** - Track bugs created, fixed, and points earned
- **Achievement Tracking** - Monitor user contributions over time
- **Leaderboards** - (Coming soon) Compete with team members

## 🐛 Troubleshooting

### Cannot connect to server?

**Symptoms:** "Network request failed" or timeout errors

**Solutions:**

1. **Verify server is running:**

   ```bash
   curl http://YOUR_IP:5000/api/health
   ```

   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check firewall settings:**

   - Windows: Allow port 5000 in Windows Defender Firewall
   - macOS: System Preferences → Security → Firewall → Allow port 5000
   - Linux: `sudo ufw allow 5000/tcp`

3. **Confirm same network:**

   - Phone and computer must be on the **same WiFi/network**
   - Mobile hotspot works great for testing

4. **Validate IP in networkConfig.js:**

   ```javascript
   const DEV_BACKEND_IP = "10.126.128.115"; // Must match your actual IP
   ```

5. **Test from phone browser:**
   - Open `http://YOUR_IP:5000/api/health` in Chrome/Safari
   - If this fails, it's a network/firewall issue, not the app

### Google Sign-In not working?

**Symptoms:** "Sign in failed" or stuck on login screen

**Solutions:**

1. **Verify Firebase setup:**

   - `google-services.json` exists in `frontend/android/app/`
   - Google Sign-In is **enabled** in Firebase Console
   - SHA-1/SHA-256 certificates registered (Android)

2. **Check backend auth endpoint:**

   ```bash
   # Should be reachable from the app
   curl http://YOUR_IP:5000/api/auth/google
   ```

3. **Clear app data and retry:**

   - Android: Settings → Apps → Bug Tracker → Clear Storage
   - iOS: Delete and reinstall the app

4. **Review logs:**
   - Run `npx react-native log-android` or `npx react-native log-ios`
   - Look for Firebase/auth errors

### Connection timeouts or slow responses?

**Symptoms:** Requests take forever or timeout after 30s

**Solutions:**

1. **Increase timeout in `networkConfig.js`:**

   ```javascript
   TIMEOUTS: {
     DEFAULT: 45000,  // Increase from 30s to 45s
     UPLOAD: 90000,   // For file uploads
   }
   ```

2. **Check mobile network quality:**

   - Switch from mobile data to WiFi if possible
   - Move closer to router for better signal

3. **Enable retry logs:**
   - Check Metro bundler logs for retry attempts
   - Look for "Retrying request (attempt X/3)" messages

### "Token expired" or auth errors?

**Symptoms:** Logged out unexpectedly, "Unauthorized" errors

**Solutions:**

1. **Clear AsyncStorage and re-login:**

   - The app should handle this automatically
   - If not, log out manually and sign in again

2. **Check JWT secret consistency:**

   - Ensure `server/.env` has the same `JWT_SECRET` (if server restarted)

3. **Verify token is being sent:**
   - Check network logs for `Authorization: Bearer ...` header

### Android build errors?

**Symptoms:** Gradle build fails, missing dependencies

**Solutions:**

1. **Clean and rebuild:**

   ```bash
   cd frontend/android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

2. **Check `google-services.json`:**

   - Must be in `frontend/android/app/`
   - Must be valid JSON (download again from Firebase if needed)

3. **Sync Gradle files:**
   - Open `frontend/android` in Android Studio
   - File → Sync Project with Gradle Files

### iOS build errors?

**Symptoms:** CocoaPods errors, Xcode build failures

**Solutions:**

1. **Reinstall pods:**

   ```bash
   cd frontend/ios
   pod deintegrate
   pod install
   cd ..
   npx react-native run-ios
   ```

2. **Check `GoogleService-Info.plist`:**

   - Must be added to Xcode project (not just filesystem)
   - Verify in Xcode: Project Navigator → frontend → GoogleService-Info.plist

3. **Clean build:**
   - In Xcode: Product → Clean Build Folder (⇧⌘K)
   - Then rebuild

### Still having issues?

See our detailed guides:

- **[Mobile Network Setup Guide](MOBILE_NETWORK_SETUP.md)** - Comprehensive network troubleshooting
- **[Quick Reference](NETWORK_QUICK_REFERENCE.md)** - Common commands and configs
- **[Enhanced Features](ENHANCED_FEATURES.md)** - Feature-specific documentation

Or open an issue on [GitHub Issues](https://github.com/anirudh-pedro/Bug-Tracker/issues) with:

- Error messages and logs
- Device/OS version
- Steps to reproduce

## 📊 Network Quality

The app automatically monitors and adapts to network quality:

| Quality    | Latency | Behavior              |
| ---------- | ------- | --------------------- |
| 🟢 Good    | < 1s    | Full features enabled |
| 🟡 Fair    | 1-3s    | Reduced auto-refresh  |
| 🔴 Poor    | > 3s    | Manual refresh only   |
| ⚫ Offline | N/A     | Cached data only      |

## 🔐 Security

This application implements multiple layers of security:

### Authentication & Authorization

- **Firebase Google Sign-In** - Industry-standard OAuth 2.0 flow
- **JWT Tokens** - Stateless authentication with configurable expiry
- **bcryptjs Password Hashing** - Salted hashing for legacy email/password auth
- **Token Validation** - Middleware verifies JWT on protected routes
- **Secure Storage** - AsyncStorage for encrypted token persistence on device

### API Security

- **Rate Limiting** - 100 requests per 15 minutes per IP (configurable)
- **Helmet.js** - Sets secure HTTP headers:
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
- **CORS Protection** - Configurable allowed origins
- **Input Validation** - Mongoose schema validation on all inputs
- **Error Sanitization** - No sensitive data leaked in error messages

### Data Security

- **User Isolation** - All queries filtered by authenticated `userId`
- **Cascade Deletion** - Orphaned bugs deleted when projects removed
- **No SQL Injection** - Mongoose ODM prevents injection attacks
- **Environment Secrets** - Sensitive keys in `.env` (not committed to Git)

### Network Security

- **HTTPS Recommended** - Use SSL/TLS in production
- **Token Expiry** - JWTs expire and require re-authentication
- **Secure Cookies** - HttpOnly, Secure flags for web (if applicable)

### ⚠️ Production Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Update CORS to allow only your domain (not `*`)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Use MongoDB connection string with authentication
- [ ] Enable MongoDB IP whitelisting
- [ ] Remove or secure all development fallback URLs
- [ ] Review rate limiting thresholds
- [ ] Set up security monitoring and alerts
- [ ] Regularly update dependencies (`npm audit fix`)
- [ ] Enable Firebase App Check (mobile app integrity)

**Current CORS Setting (Development):**

```javascript
// ⚠️ Change for production!
cors({ origin: "*", credentials: true });
```

**Production CORS:**

```javascript
cors({
  origin: ["https://yourdomain.com", "https://app.yourdomain.com"],
  credentials: true,
});
```

## 📝 API Endpoints

### Authentication

- `POST /api/auth/google` - Google Sign-In (Firebase ID token → JWT)
- `POST /api/auth/login` - Email/password login (legacy)
- `POST /api/auth/signup` - User registration (legacy)
- `GET /api/users/profile-status` - Check if user completed onboarding

### Users

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile (username, avatar, etc.)
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/stats` - Get user statistics (bugs, points)

### Projects

- `GET /api/projects` - List all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details with bugs
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (cascades to bugs)

### Bugs

- `GET /api/bugs` - List all bugs (with filters)
  - Query params: `?status=open&priority=high&search=keyword`
- `POST /api/bugs` - Create new bug
  - Required: `title`, `description`, `projectId`, `githubRepo`
  - Optional: `priority`, `attachments`, `assignee`
- `GET /api/bugs/:id` - Get bug details
- `PUT /api/bugs/:id` - Update bug
  - Can update: `status`, `priority`, `description`, `assignee`
- `DELETE /api/bugs/:id` - Delete bug
- `POST /api/bugs/:id/attachments` - Upload attachment
- `DELETE /api/bugs/:id/attachments/:attachmentId` - Remove attachment

### System

- `GET /api/health` - Health check endpoint
  - Returns: `{"status":"ok","timestamp":"..."}`
- `GET /api/dashboard/stats` - Dashboard statistics
  - Returns: Project count, bug counts by status, recent activity

### Example Request (Create Bug)

```javascript
POST /api/bugs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Login button not responding on Android",
  "description": "When tapping the login button on Android 13...",
  "projectId": "507f1f77bcf86cd799439011",
  "githubRepo": "https://github.com/myorg/myproject",
  "priority": "high",
  "status": "open",
  "attachments": [
    {
      "name": "screenshot.png",
      "url": "https://storage.example.com/screenshot.png",
      "type": "image"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "bugId": "BUG-1234",
    "title": "Login button not responding on Android",
    "status": "open",
    "createdAt": "2025-11-08T10:30:00.000Z",
    ...
  }
}
```

See **[Enhanced Features](ENHANCED_FEATURES.md#-api-endpoints)** for complete API documentation.

## 🧪 Testing

### Manual Testing

#### Test Backend Health

```bash
# From terminal
curl http://YOUR_IP:5000/api/health

# Expected response
{"status":"ok","timestamp":"2025-11-08T10:30:00.000Z"}
```

#### Test from Phone Browser

Open in mobile browser:

```
http://YOUR_IP:5000/api/health
```

If this works, your network setup is correct!

#### Test Authentication

```bash
# Test Google auth endpoint (should return 400 without token)
curl -X POST http://YOUR_IP:5000/api/auth/google

# Expected
{"error":"ID token is required"}
```

#### Test Protected Endpoints

```bash
# Get projects (requires valid JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://YOUR_IP:5000/api/projects
```

### Network Diagnostics

The app includes built-in network quality monitoring. Check logs for:

```
✅ Server reachable at: http://10.126.128.115:5000
📶 Network quality: good (250ms latency)
🔄 Using fallback URL: http://10.0.2.2:5000
⚠️  Network quality degraded: fair (2500ms latency)
❌ Server unreachable, retrying...
```

### Common Test Scenarios

1. **First-time user flow:**

   - Launch app → Tap "Get Started"
   - Sign in with Google
   - Complete onboarding (set username)
   - Land on dashboard

2. **Create project and bug:**

   - Navigate to Projects tab
   - Create new project
   - Go to project details
   - Add a bug with GitHub repo

3. **Test offline resilience:**

   - Enable airplane mode
   - Try to load bugs (should show cached data)
   - Disable airplane mode
   - Pull to refresh (should sync)

4. **Test retry logic:**
   - Stop backend server
   - Try to fetch data (should see retry attempts)
   - Restart server
   - App should reconnect automatically

### Running Automated Tests

(Testing framework setup coming soon)

```bash
# Frontend tests (planned)
cd frontend
npm test

# Backend tests (planned)
cd server
npm test
```

## 🚀 Deployment

### Production Checklist

#### Backend (Express + MongoDB)

1. **Environment Configuration**

   ```env
   NODE_ENV=production
   mongo_uri=mongodb+srv://user:pass@cluster.mongodb.net/bugtracker
   JWT_SECRET=your-production-secret-change-this
   PORT=5000
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

2. **Security Hardening**

   - Update CORS in `server/server.js`:
     ```javascript
     const corsOptions = {
       origin: process.env.ALLOWED_ORIGINS || "https://yourdomain.com",
       credentials: true,
     };
     ```
   - Enable HTTPS (use reverse proxy like nginx)
   - Set up SSL certificates (Let's Encrypt recommended)
   - Configure rate limiting (currently: 100 req/15min)
   - Review and update Helmet security headers

3. **Database**

   - Use MongoDB Atlas or managed MongoDB
   - Enable authentication and IP whitelisting
   - Set up backups and monitoring
   - Create indexes for performance:
     ```javascript
     db.bugs.createIndex({ userId: 1, status: 1 });
     db.projects.createIndex({ userId: 1 });
     ```

4. **Deployment Options**

   - **Heroku:** `git push heroku main`
   - **DigitalOcean:** Deploy on App Platform or Droplet
   - **AWS:** EC2, Elastic Beanstalk, or ECS
   - **Vercel/Render:** Serverless or container deployment

5. **Monitoring & Logging**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor server health (`/api/health` endpoint)
   - Configure log aggregation (Logtail, Papertrail)

#### Frontend (React Native)

1. **Update Network Configuration**

   Edit `frontend/src/config/networkConfig.js`:

   ```javascript
   const PRODUCTION_BACKEND_URL = 'https://api.yourdomain.com';

   const NETWORK_CONFIG = {
     BACKEND_URL: __DEV__
       ? resolveDevelopmentBackendUrl()
       : PRODUCTION_BACKEND_URL,
     // Remove or comment out fallback URLs for production
     FALLBACK_URLS: __DEV__ ? [...] : [],
   };
   ```

2. **Firebase Configuration**

   - Use production Firebase project
   - Update `google-services.json` (Android)
   - Update `GoogleService-Info.plist` (iOS)
   - Configure OAuth redirect URIs

3. **Build Android APK/AAB**

   ```bash
   cd frontend/android
   ./gradlew bundleRelease  # For AAB (Google Play)
   # or
   ./gradlew assembleRelease  # For APK
   ```

   Output: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

4. **Build iOS IPA**

   - Open `frontend/ios/frontend.xcworkspace` in Xcode
   - Select "Any iOS Device" as target
   - Product → Archive
   - Distribute App → App Store Connect

5. **Code Signing**

   - **Android:** Generate release keystore

     ```bash
     keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore \
       -alias release -keyalg RSA -keysize 2048 -validity 10000
     ```

     Update `android/app/build.gradle` with keystore config

   - **iOS:** Configure signing in Xcode (Apple Developer account required)

6. **App Store Submission**
   - **Google Play:** Upload AAB, fill store listing, submit for review
   - **Apple App Store:** Upload via Xcode/Transporter, complete App Store Connect listing

### Environment Variables Summary

| Variable          | Development   | Production           |
| ----------------- | ------------- | -------------------- |
| `NODE_ENV`        | `development` | `production`         |
| `mongo_uri`       | Local/Atlas   | Atlas (replica set)  |
| `JWT_SECRET`      | Any string    | Strong random secret |
| `PORT`            | `5000`        | `5000` or dynamic    |
| `ALLOWED_ORIGINS` | `*`           | Specific domain(s)   |

### Post-Deployment

- Monitor error rates and performance
- Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- Configure automatic backups
- Test all features in production
- Set up uptime monitoring (UptimeRobot, Pingdom)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Getting Started

1. **Fork the repository**

   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Bug-Tracker.git
   cd Bug-Tracker
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-new-feature
   # or
   git checkout -b fix/bug-description
   ```

3. **Make your changes**

   - Follow existing code style and conventions
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**

   - Test on both Android and iOS if possible
   - Verify backend changes with `npm start`
   - Check for console errors

5. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   # or
   git commit -m "fix: resolve login timeout issue"
   ```

   **Commit Message Format:**

   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

6. **Push to your fork**

   ```bash
   git push origin feature/amazing-new-feature
   ```

7. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes clearly

### Contribution Guidelines

- **Code Quality:** Maintain existing code style and structure
- **Documentation:** Update README or comments for significant changes
- **Scope:** Keep PRs focused on a single feature or fix
- **Testing:** Test thoroughly before submitting
- **Issues:** Check existing issues before creating duplicates

### Areas We'd Love Help With

- [ ] Unit and integration tests (Jest, React Native Testing Library)
- [ ] iOS-specific bug fixes and optimizations
- [ ] Accessibility improvements (screen reader support, contrast)
- [ ] Internationalization (i18n) support
- [ ] Advanced filtering and search features
- [ ] Real-time notifications (push notifications)
- [ ] Dark/light theme toggle
- [ ] Export bugs to CSV/PDF
- [ ] Integration with other bug trackers (Jira, Linear)

### Questions?

- Open an issue for bugs or feature requests
- Tag issues with appropriate labels
- Be respectful and constructive in discussions

Thank you for contributing! 🎉

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.


## 👥 Authors & Acknowledgments

### Core Team

- **Anirudh** - _Lead Developer_ - [anirudh-pedro](https://github.com/anirudh-pedro)

### Built With

Special thanks to the open-source community and these amazing projects:

- **[React Native](https://reactnative.dev/)** - Cross-platform mobile framework
- **[Express.js](https://expressjs.com/)** - Fast, unopinionated web framework
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Firebase](https://firebase.google.com/)** - Authentication and backend services
- **[React Navigation](https://reactnavigation.org/)** - Routing and navigation
- **[Mongoose](https://mongoosejs.com/)** - Elegant MongoDB object modeling

---

**Built with ❤️ for better bug tracking**

_Making bug management simple, effective, and even fun!_
````
