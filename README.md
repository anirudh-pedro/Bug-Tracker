# Bug Tracker 🐛

A mobile bug tracking application with Google authentication and GitHub integration.

## Features

- Google Sign-In authentication
- Create and manage projects
- Report bugs with GitHub repository links
- Upload attachments
- Track bug status and priority
- Points system for contributions
- Dark theme UI

## Tech Stack

- **Frontend:** React Native, Firebase Auth
- **Backend:** Node.js, Express.js, MongoDB
- **Tools:** React Navigation, AsyncStorage

## Setup

### Prerequisites

- Node.js 16+
- MongoDB
- Firebase project
- Android Studio or Xcode

### Installation

1. Clone the repository

```bash
git clone https://github.com/anirudh-pedro/Bug-Tracker.git
cd Bug-Tracker
```

2. Install dependencies

```bash
cd server && npm install
cd ../frontend && npm install
```

3. Configure Firebase

- Add `google-services.json` to `frontend/android/app/`
- Add `GoogleService-Info.plist` to iOS project

4. Create `server/.env`

```env
mongo_uri=mongodb://localhost:27017/bugtracker
JWT_SECRET=your-secret-key
PORT=5000
```

5. Update network config

- Find your IP: `cd server && npm run find-ip`
- Update `frontend/src/config/networkConfig.js` with your IP

6. Run the app

```bash
# Start backend
cd server && npm start

# Start mobile app
cd frontend && npx react-native run-android
```

## API Endpoints

- `POST /api/auth/google` - Google authentication
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/bugs` - Get all bugs
- `POST /api/bugs` - Create bug
- `GET /api/health` - Health check

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT

## Author

[Anirudh](https://github.com/anirudh-pedro)
