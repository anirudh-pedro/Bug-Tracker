# 🐛 Bug Tracker - Dynamic Bug Reporting System

A comprehensive bug tracking application with GitHub integration, points system, and real-time updates. Built with React Native for mobile and Express.js for the backend.

## ✨ Features

- 🔗 **GitHub Integration** - Link repositories, track forks, and manage pull requests
- 🏆 **Points & Rewards** - Award points to developers who fix bugs
- 💬 **Enhanced Comments** - Rich comment system with GitHub profile integration
- ⚡ **Real-time Updates** - Live bug status updates and activity tracking
- 🔍 **Advanced Filtering** - Filter by status, priority, and search
- 📱 **Mobile Optimized** - Designed for mobile networks with smart caching and retries
- 🎨 **Dark Theme** - Beautiful, consistent dark theme throughout

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- React Native development environment
- MongoDB database
- Android/iOS device or emulator

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/anirudh-pedro/Bug-Tracker.git
cd Bug-Tracker
```

2. **Install server dependencies**

```bash
cd server
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Set up environment variables**

Create `server/.env`:

```env
mongo_uri=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

5. **Find your computer's IP address**

```bash
cd server
npm run find-ip
```

6. **Configure network settings**

Update `frontend/src/config/networkConfig.js` with your IP:

```javascript
BACKEND_URL: isDevelopment
  ? 'http://YOUR_IP:5000'  // Replace with your IP from step 5
  : 'https://your-production-api.com',
```

7. **Start the server**

```bash
cd server
npm start
```

8. **Run the mobile app**

```bash
cd frontend
npx react-native run-android
# or
npx react-native run-ios
```

## 📱 Mobile Network Setup

Testing on your phone using mobile network? See our detailed guides:

- **[Mobile Network Setup Guide](MOBILE_NETWORK_SETUP.md)** - Complete setup instructions
- **[Quick Reference](NETWORK_QUICK_REFERENCE.md)** - Quick command reference

### Quick Mobile Setup

1. Enable mobile hotspot on your phone
2. Connect your computer to the hotspot
3. Run `npm run find-ip` in the server directory
4. Update `networkConfig.js` with the displayed IP
5. Configure firewall to allow port 5000
6. Start the server and run the app

## 🛠️ Technology Stack

### Frontend

- **React Native** - Mobile app framework
- **React Navigation** - Navigation library
- **AsyncStorage** - Local data persistence
- **Vector Icons** - Icon library

### Backend

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Helmet** - Security middleware
- **Compression** - Response compression

## 📚 Documentation

- [Enhanced Features](ENHANCED_FEATURES.md) - Detailed feature documentation
- [Mobile Network Setup](MOBILE_NETWORK_SETUP.md) - Network configuration guide
- [Quick Reference](NETWORK_QUICK_REFERENCE.md) - Command and config reference

## 🔧 Configuration Files

### Network Configuration

- `frontend/src/config/networkConfig.js` - Network settings (URLs, timeouts, retries)
- `frontend/src/config/apiConfig.js` - API endpoint definitions
- `frontend/src/config/authConfig.js` - Authentication settings

### Utilities

- `frontend/src/utils/networkUtils.js` - Basic network utilities with caching
- `frontend/src/utils/enhancedNetworkUtils.js` - Advanced retry and error handling

## 🎯 Key Features

### GitHub Integration

- Link GitHub repositories to bugs
- Track repository forks
- Submit and track pull requests
- Auto-update bug status on PR merge

### Points System

- Set bounty points on bugs
- Award points to contributors
- Track achievements and statistics
- View leaderboards

### Real-time Updates

- Live bug status changes
- Automatic polling (30s intervals)
- Pull-to-refresh support
- Manual refresh option

### Mobile Optimization

- Extended timeouts for mobile networks
- Automatic retry with exponential backoff
- Response caching to reduce data usage
- Request deduplication
- Network quality monitoring

## 🐛 Troubleshooting

### Cannot connect to server?

1. Check if server is running: `http://YOUR_IP:5000/api/health`
2. Verify firewall allows port 5000
3. Ensure phone and computer are on same network
4. Check `networkConfig.js` has correct IP

### Connection timeouts?

1. Increase timeout in `networkConfig.js`
2. Check mobile network signal
3. Try connecting via WiFi

### Auth errors?

1. Clear app cache
2. Log out and back in
3. Check token hasn't expired

See [Troubleshooting Guide](MOBILE_NETWORK_SETUP.md#-troubleshooting) for more help.

## 📊 Network Quality

The app automatically monitors and adapts to network quality:

| Quality    | Latency | Behavior              |
| ---------- | ------- | --------------------- |
| 🟢 Good    | < 1s    | Full features enabled |
| 🟡 Fair    | 1-3s    | Reduced auto-refresh  |
| 🔴 Poor    | > 3s    | Manual refresh only   |
| ⚫ Offline | N/A     | Cached data only      |

## 🔐 Security

- JWT-based authentication
- Password hashing (bcrypt)
- Rate limiting (100 requests/15 minutes)
- Helmet security headers
- CORS protection
- Input validation

**Note:** Current CORS allows all origins for development. Update for production!

## 📝 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/google` - Google Sign-In

### Bugs

- `GET /api/bugs` - List all bugs
- `POST /api/bugs` - Create new bug
- `GET /api/bugs/:id` - Get bug details
- `PUT /api/bugs/:id` - Update bug
- `DELETE /api/bugs/:id` - Delete bug

### Projects

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details

### GitHub

- `POST /api/github/link-repo/:bugId` - Link repository
- `POST /api/github/fork/:bugId` - Record fork
- `POST /api/github/pull-request/:bugId` - Submit PR

See [API Documentation](ENHANCED_FEATURES.md#-api-endpoints) for complete list.

## 🧪 Testing

### Test Server Connection

```bash
curl http://YOUR_IP:5000/api/health
```

### Test from Phone Browser

```
http://YOUR_IP:5000/api/health
```

### Check Network Quality

In app console, look for:

```
✅ Server reachable at: http://...
Network: good, Latency: 250ms
```

## 🚀 Deployment

### Frontend (React Native)

- Build APK/IPA for distribution
- Update `BACKEND_URL` to production URL
- Configure environment variables
- Remove development fallback URLs

### Backend (Express)

- Set `NODE_ENV=production`
- Configure production MongoDB
- Update CORS settings
- Use HTTPS
- Set up reverse proxy (nginx)
- Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Anirudh** - Initial work - [anirudh-pedro](https://github.com/anirudh-pedro)

## 🙏 Acknowledgments

- React Native community
- Express.js contributors
- MongoDB team
- All open-source contributors

## 📧 Support

Having issues? Check our documentation:

- [Mobile Network Setup](MOBILE_NETWORK_SETUP.md)
- [Quick Reference](NETWORK_QUICK_REFERENCE.md)
- [Enhanced Features](ENHANCED_FEATURES.md)

Or open an issue on GitHub!

---

**Built with ❤️ for better bug tracking**
