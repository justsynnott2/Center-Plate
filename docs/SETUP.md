# CenterPlate Setup Guide

This guide will help you set up the CenterPlate development environment.

## Prerequisites

### Required Software
1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org)
   - Verify installation: `node --version`

2. **Git**
   - Download from [git-scm.com](https://git-scm.com)
   - Verify installation: `git --version`

3. **MongoDB Atlas Account**
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string

4. **Firebase Account**
   - Sign up at [firebase.google.com](https://firebase.google.com)
   - Create a new project
   - Enable Authentication

5. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

6. **Development Tools**
   - Android Studio (for Android development)
   - VS Code (recommended IDE)

## Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/CenterPlate.git
cd CenterPlate
```

### 2. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   DB_NAME=your_db_name
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY=your_private_key
   FOURSQUARE_API_KEY=your_foursquare_api_key

   ```

3. **Database Setup**
   - Create a new database in MongoDB Atlas
   - Update the connection string in `.env`
   - Run the database sync script:
     ```bash
     npm run firebase:sync
     ```

4. **Start the Backend Server**
   ```bash
   npm start
   ```

### 3. Frontend Setup

1. **Install Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   EXPO_PUBLIC_API_IP=your_local_ip_address
   EXPO_PUBLIC_API_PORT=3000
   EXPO_PUBLIC_API_URL=http://$EXPO_PUBLIC_API_IP:$EXPO_PUBLIC_API_PORT/api
   EXPO_PUBLIC_SOCKET_URL=http://$EXPO_PUBLIC_API_IP:$EXPO_PUBLIC_API_PORT

   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Start the Frontend**
   ```bash
   npm start
   ```

## Development Workflow

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm start
   ```

3. **Run on Device/Emulator**
   - Press 'a' to run on Android emulator
   - Press 'i' to run on iOS simulator
   - Scan QR code with Expo Go app for physical device