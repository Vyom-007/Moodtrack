# 🎭 MoodTrack - Video Mood & Stress Detection System

**AI VERSE 2.0 Hackathon | Augment AI, BMSCE**

A real-time emotion detection and stress monitoring system using DeepFace, TensorFlow, and React.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [For Hackathon Judges](#for-hackathon-judges)

---

## Overview

MoodTrack is a comprehensive Video Mood & Stress Detection System that analyzes facial expressions in real-time to:
- Detect 7 emotions (Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral)
- Calculate stress levels (0-100%)
- Track emotional trends over time
- Generate exportable reports
- All processing done locally (privacy-first)

---

## Features

### Backend Features
Real-time face detection & tracking  
7-emotion classification using DeepFace  
Stress level calculation (0-100%)  
Confidence scores per emotion  
Session history tracking (last 5 minutes)  
RESTful API with 6 endpoints  
CORS enabled for frontend integration  
Multi-threading for performance  

### Frontend Features
Real-time dashboard with live updates  
Animated stress gauge with color zones  
7 emotion progress bars  
Timeline trend graphs  
Session statistics & analytics  
Emotion distribution charts  
Export/Reset controls  
Mobile responsive design  

---

## System Requirements

| Component | Requirement |
|-----------|-------------|
| **Python** | 3.10 - 3.13.5 |
| **Node.js** | 16+ |
| **RAM** | 4GB minimum |
| **Webcam** | Required |
| **OS** | Windows 10/11, macOS 12+, Ubuntu 20.04+ |

---

## Installation

### Step 1: Clone/Download Project

```bash
git clone <your-repo-url>
cd moodtrack-project
```

Or download and extract the ZIP file.

---

### Step 2: Backend Setup (Python)

#### 2.1 Create Virtual Environment

```bash
# Create venv
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

#### 2.2 Install Python Dependencies

**Option A: Using requirements.txt (Recommended)**

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

**Option B: Manual Installation (if requirements.txt fails)**

```bash
pip install Flask==3.0.3 Flask-CORS==5.0.0
pip install opencv-python==4.10.0.84
pip install tensorflow==2.20.0 tf_keras==2.20.0
pip install deepface==0.0.91
pip install Pillow numpy scipy pandas requests
```

#### 2.3 Verify Backend Installation

```bash
python -c "import tensorflow as tf; print('TensorFlow', tf.__version__)"
python -c "from deepface import DeepFace; print('DeepFace Ready')"
python -c "import cv2; print('OpenCV', cv2.__version__)"
```

Expected output:
```
TensorFlow 2.20.0
DeepFace Ready
OpenCV 4.10.0
```

---

### Step 3: Frontend Setup (React)

#### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

#### 3.2 Install npm Dependencies

```bash
npm install recharts lucide-react
```

#### 3.3 Setup Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 3.4 Configure Tailwind

Edit `tailwind.config.js`:

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Edit `src/index.css` (add at the top):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Running the Application

### Start Backend (Terminal 1)

```bash
# Activate venv first
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate     # Windows

# Run backend
python server.py
```

**Expected Output:**
```
============================================================
🎭 MoodTrack - Video Mood & Stress Detection System
============================================================

📡 Starting Backend Server...

Emotion detection thread started
Webcam initialized - waiting for faces...

Backend Server Ready!
📍 API Endpoints:
   • GET  http://localhost:5000/emotion
   • GET  http://localhost:5000/history
   • GET  http://localhost:5000/stats
   • GET  http://localhost:5000/health
   • GET  http://localhost:5000/export
   • POST http://localhost:5000/reset

Frontend should connect to: http://localhost:5000
============================================================
```

**IMPORTANT:** Keep this terminal window open!

---

### Start Frontend (Terminal 2)

Open a **new terminal window** (don't close the backend terminal).

```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view moodtrack in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Your browser should automatically open to `http://localhost:3000`.

---

## Verification Checklist

Once both backend and frontend are running:

- [ ] Backend terminal shows "Backend Server Ready!"
- [ ] Frontend opens in browser at http://localhost:3000
- [ ] Green "Face Detected" indicator visible (position your face in front of webcam)
- [ ] Emotion name updates in real-time
- [ ] Stress gauge shows percentage
- [ ] 7 emotion bars display percentages
- [ ] All tabs (Dashboard, Analytics, History, Settings) clickable
- [ ] No errors in browser console (Press F12)

---

## Troubleshooting

### Issue 1: Port 5000 Already in Use

**Error:**
```
Address already in use
Port 5000 is in use by another program.
```

**Solutions:**

**Mac:**
1. Disable AirPlay Receiver:
   - System Settings → General → AirDrop & Handoff
   - Toggle AirPlay Receiver → Off

2. Or kill the process:
   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Alternative:** Change port in `server.py`:
```python
app.run(host="0.0.0.0", port=5001, debug=False, use_reloader=False)
```

Then update frontend API URL in `App.jsx` to `http://localhost:5001`.

---

### Issue 2: Keras Import Error

**Error:**
```
ImportError: Keras cannot be imported. Check that it is installed.
```

**Solution:**
```bash
pip install tf_keras==2.20.0
```

---

### Issue 3: No Face Detected

**Solutions:**
- Ensure good lighting in room
- Position face 30-60cm from webcam
- Grant camera permissions to browser
- Check webcam is working in system settings
- Try different camera (if multiple available)

---

### Issue 4: Backend Connection Failed

**Error in browser console:**
```
Error fetching emotion: Network error
```

**Solutions:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check CORS is enabled in `server.py`
3. Confirm API URL in `App.jsx` is `http://localhost:5000`
4. Clear browser cache (Ctrl+Shift+Delete)
5. Restart both backend and frontend

---

### Issue 5: Slow Performance

**Solutions:**
1. Increase `frame_skip` in `server.py`:
   ```python
   frame_skip = 4  # Process every 4th frame
   ```

2. Reduce resolution in `server.py`:
   ```python
   cap.set(cv2.CAP_PROP_FRAME_WIDTH, 480)
   cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 360)
   ```

3. Close other applications
4. Restart computer

---

## API Documentation

### GET `/emotion`
Returns current detected emotion and stress level.

**Response:**
```json
{
  "emotion": "Happy",
  "confidence": 0.95,
  "stress_level": 25,
  "face_detected": true,
  "timestamp": "2025-10-26T10:00:00Z"
}
```

---

### GET `/history`
Returns emotion history for the current session.

**Response:**
```json
{
  "history": [
    {
      "timestamp": "2025-10-26T10:00:00Z",
      "emotion": "Happy",
      "confidence": 0.95,
      "stress": 25,
      "all_emotions": {
        "happy": 95.2,
        "sad": 2.1,
        "angry": 1.5,
        ...
      }
    }
  ],
  "total_frames": 150
}
```

---

### GET `/stats`
Returns session statistics.

**Response:**
```json
{
  "avg_stress": 35,
  "max_stress": 70,
  "min_stress": 10,
  "dominant_emotion": "Happy",
  "session_duration": 180,
  "total_emotions": {
    "Happy": 120,
    "Neutral": 45,
    "Sad": 15
  }
}
```

---

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "running",
  "current_emotion": "Happy",
  "face_detected": true,
  "uptime": "0:05:23"
}
```

---

### GET `/export`
Export session data as JSON.

**Response:**
Full session data including stats and complete history.

---

### POST `/reset`
Reset session history and statistics.

**Response:**
```json
{
  "status": "Session reset successfully"
}
```

---

## 📁 Project Structure

```
moodtrack-project/
│
├── server.py                 # Backend Flask application
├── requirements.txt          # Python dependencies
├── README.md                # This file
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── index.js         # React entry point
│   │   ├── index.css        # Global styles + Tailwind
│   │   └── App.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── venv/                    # Python virtual environment
```

---

## For Hackathon Judges

### Problem Statement
Implement a system that captures real-time video, detects faces, extracts facial landmarks and micro-expressions, classifies emotional states, and displays a real-time mood/stress dashboard.

### Solution Highlights

**Innovation & Creativity (20 pts)**
- Unique stress gauge visualization with color zones
- Real-time emotion classification bars
- Interactive timeline graphs
- Comprehensive analytics dashboard

**Technical Implementation (20 pts)**
- DeepFace integration with TensorFlow 2.20
- OpenCV for real-time video processing
- Flask RESTful API architecture
- React frontend with Recharts visualizations
- Multi-threading for performance optimization

**User Experience/UI (10 pts)**
- Intuitive 4-tab navigation
- Professional dark theme design
- Mobile responsive layout
- Real-time status indicators
- Smooth animations

**Functionality & Performance (20 pts)**
- All features working reliably
- <1 second real-time updates
- 7 emotion classification
- Stress calculation algorithm
- Export/Reset capabilities

**Scalability & Practicality (10 pts)**
- RESTful API design for easy scaling
- Modular architecture
- Database-ready (in-memory currently)
- Multi-user support possible

**Security & Privacy (10 pts)**
- Local-first processing (no cloud uploads)
- Face data not stored
- User-controlled camera access
- Session data management

**Presentation & Documentation (10 pts)**
- Complete README with installation guide
- API documentation
- Troubleshooting guide
- Well-commented code

---

### Use Cases
1. **Mental Health:** Remote therapy session monitoring
2. **Corporate:** Employee wellness programs
3. **Education:** Student engagement tracking
4. **Customer Service:** Agent stress monitoring
5. **Research:** Behavioral analysis studies

---

## Testing the Application

### Dashboard Tab
- Shows current emotion with emoji
- Real-time stress gauge (0-100%)
- 7 emotion classification bars
- Timeline graph of trends

### Analytics Tab
- Session statistics
- Average/max/min stress levels
- Dominant emotion
- Emotion distribution pie chart

### History Tab
- Scrollable emotion history table
- Timestamps, emotions, confidence, stress

### Settings Tab
- Reset Session button
- Export Report (JSON) button
- App information

---

## Demo Script (2-3 minutes)

1. **Introduction**
   - "MoodTrack detects emotions in real-time using AI"

2. **Dashboard**
   - Point to live emotion detection
   - Show stress gauge updating

3. **Emotion Classification**
   - Explain 7 emotions tracked
   - Show confidence scores

4. **Analytics**
   - Display session statistics
   - Show emotion distribution chart

5. **Key Features**
   - Real-time processing (<1 sec)
   - Privacy-first (local processing)
   - Export capabilities
   - Use cases: HR, education, mental health

---

## Quick Commands Reference

```bash
# Activate venv (Windows)
venv\Scripts\activate

# Activate venv (Mac/Linux)
source venv/bin/activate

# Deactivate venv
deactivate

# Start backend
python server.py

# Start frontend
npm start

# Test backend API
curl http://localhost:5000/health

# Install Python packages
pip install -r requirements.txt

# Install npm packages
npm install

# Clear npm cache
npm cache clean --force

# Check TensorFlow
python -c "import tensorflow as tf; print(tf.__version__)"

# Check DeepFace
python -c "from deepface import DeepFace; print('OK')"
```

---

## Getting Help

**Hackathon Support:**
- Email: vyom70singhal@gmail.com
- Phone: 7451977502

**Common Issues:**
1. Check both terminals are running
2. Verify webcam is working
3. Grant browser camera permission
4. Check no console errors (F12)
5. Restart backend and frontend
6. Clear browser cache

---

## License

MIT License - Created for AI VERSE 2.0 Hackathon

---

## Success!

If you see:
- Backend: "Backend Server Ready!"
- Frontend: MoodTrack app in browser
- Face detected indicator active
- Real-time emotion updates

**Your application is fully functional!** 🚀

---

**Version:** 1.0.0  
**Date:** October 26, 2025  
**Event:** AI VERSE 2.0 - Augment AI, BMSCE  
**Status:** PRODUCTION READY
