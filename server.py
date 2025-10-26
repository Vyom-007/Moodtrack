# server.py
# MoodTrack Backend - Video Mood & Stress Detection System
# Run with: python server.py

import cv2
from deepface import DeepFace
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import threading
import numpy as np
from collections import deque
from datetime import datetime
import json
import traceback

app = Flask(__name__)
CORS(app)

# Global variables for emotion tracking
current_emotion = "Unknown"
current_confidence = 0.0
emotion_history = deque(maxlen=300)  # Last 5 minutes (300 frames at ~1 FPS)
stress_level = 0.0
face_detected = False
fps_counter = 0
frame_count = 0
session_start_time = None

# Emotion to stress mapping
STRESS_MAP = {
    'happy': 10,
    'neutral': 30,
    'sad': 40,
    'surprise': 35,
    'fear': 70,
    'disgust': 60,
    'angry': 80
}

# Emotion emoji mapping
EMOTION_EMOJI = {
    'happy': '😊',
    'sad': '😢',
    'angry': '😠',
    'fear': '😨',
    'surprise': '😲',
    'disgust': '🤢',
    'neutral': '😐'
}

def detect_emotion():
    """Main emotion detection function running in background thread"""
    global current_emotion, current_confidence, stress_level, face_detected, frame_count, session_start_time
    
    try:
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        session_start_time = datetime.now()
        
        frame_skip = 2  # Process every 2nd frame for performance
        frame_buffer = 0
        
        print("✅ Emotion detection thread started")
        print("📹 Webcam initialized - waiting for faces...")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("⚠️  Failed to read frame from camera")
                continue
            
            frame_count += 1
            frame_buffer += 1
            
            # Skip frames for performance
            if frame_buffer < frame_skip:
                continue
            
            frame_buffer = 0
            frame = cv2.flip(frame, 1)
            
            try:
                # Detect faces using DeepFace
                result = DeepFace.analyze(
                    frame, 
                    actions=['emotion'], 
                    enforce_detection=False,
                    silent=True
                )
                
                if result and len(result) > 0:
                    face_detected = True
                    emotion_data = result[0]['emotion']
                    
                    # Get dominant emotion and normalize name
                    dominant = result[0]['dominant_emotion']
                    current_emotion = dominant.capitalize()
                    current_confidence = emotion_data[dominant] / 100.0  # Normalize to 0-1
                    
                    # Calculate stress level (0-100)
                    stress_level = STRESS_MAP.get(dominant.lower(), 50)
                    
                    # Add to history for trending
                    emotion_history.append({
                        'timestamp': datetime.now().isoformat(),
                        'emotion': current_emotion,
                        'confidence': current_confidence,
                        'stress': stress_level,
                        'all_emotions': {k: round(v, 2) for k, v in emotion_data.items()}
                    })
                else:
                    face_detected = False
                    current_emotion = "No face detected"
                    current_confidence = 0.0
                    stress_level = 0
                    
            except Exception as e:
                face_detected = False
                current_emotion = "Detection error"
                current_confidence = 0.0
                print(f"⚠️  Error in emotion detection: {str(e)[:50]}")
                
    except Exception as e:
        print(f"❌ Fatal error in detection thread: {e}")
        traceback.print_exc()

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/emotion', methods=['GET'])
def get_emotion():
    """Get current emotion and stress level"""
    return jsonify({
        "emotion": current_emotion,
        "confidence": round(current_confidence, 2),
        "stress_level": stress_level,
        "face_detected": face_detected,
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/history', methods=['GET'])
def get_history():
    """Get emotion history for the timeline"""
    return jsonify({
        "history": list(emotion_history),
        "total_frames": frame_count,
        "history_size": len(emotion_history)
    }), 200

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get session statistics"""
    if not emotion_history:
        return jsonify({
            "avg_stress": 0,
            "dominant_emotion": "N/A",
            "session_duration": 0,
            "total_emotions": {},
            "emotions_data": []
        }), 200
    
    # Calculate statistics
    emotions_count = {}
    total_stress = 0
    max_stress = 0
    min_stress = 100
    
    for entry in emotion_history:
        emotion = entry['emotion']
        emotions_count[emotion] = emotions_count.get(emotion, 0) + 1
        total_stress += entry['stress']
        max_stress = max(max_stress, entry['stress'])
        min_stress = min(min_stress, entry['stress'])
    
    avg_stress = int(total_stress / len(emotion_history)) if emotion_history else 0
    dominant = max(emotions_count, key=emotions_count.get) if emotions_count else "N/A"
    session_duration = len(emotion_history)
    
    return jsonify({
        "avg_stress": avg_stress,
        "max_stress": max_stress,
        "min_stress": min_stress if min_stress != 100 else 0,
        "dominant_emotion": dominant,
        "session_duration": session_duration,
        "total_emotions": emotions_count,
        "emotions_data": list(emotion_history),
        "session_start": session_start_time.isoformat() if session_start_time else None
    }), 200

@app.route('/reset', methods=['POST'])
def reset_session():
    """Reset emotion history for new session"""
    global emotion_history, frame_count, session_start_time
    emotion_history.clear()
    frame_count = 0
    session_start_time = datetime.now()
    return jsonify({"status": "Session reset successfully"}), 200

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "current_emotion": current_emotion,
        "face_detected": face_detected,
        "uptime": str(datetime.now() - session_start_time) if session_start_time else "0:00:00"
    }), 200

@app.route('/export', methods=['GET'])
def export_session():
    """Export session data as JSON"""
    export_data = {
        "timestamp": datetime.now().isoformat(),
        "session_start": session_start_time.isoformat() if session_start_time else None,
        "stats": {
            "avg_stress": 0,
            "dominant_emotion": "N/A",
            "session_duration": len(emotion_history),
            "total_emotions": {}
        },
        "history": list(emotion_history)
    }
    
    if emotion_history:
        emotions_count = {}
        total_stress = 0
        for entry in emotion_history:
            emotion = entry['emotion']
            emotions_count[emotion] = emotions_count.get(emotion, 0) + 1
            total_stress += entry['stress']
        
        export_data["stats"]["avg_stress"] = int(total_stress / len(emotion_history))
        export_data["stats"]["dominant_emotion"] = max(emotions_count, key=emotions_count.get)
        export_data["stats"]["total_emotions"] = emotions_count
    
    return jsonify(export_data), 200

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found", "message": str(error)}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error", "message": str(error)}), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🎭 MoodTrack - Video Mood & Stress Detection System")
    print("="*60)
    print("\n📡 Starting Backend Server...\n")
    
    # Run emotion detection in background thread
    detection_thread = threading.Thread(target=detect_emotion, daemon=True)
    detection_thread.start()
    
    # Give detection thread time to initialize
    import time
    time.sleep(2)
    
    print("\n✅ Backend Server Ready!")
    print("📍 API Endpoints:")
    print("   • GET  http://localhost:5000/emotion  - Current emotion")
    print("   • GET  http://localhost:5000/history  - Emotion history")
    print("   • GET  http://localhost:5000/stats    - Session statistics")
    print("   • GET  http://localhost:5000/health   - Health check")
    print("   • GET  http://localhost:5000/export   - Export data")
    print("   • POST http://localhost:5000/reset    - Reset session")
    print("\n🌐 Frontend should connect to: http://localhost:5000")
    print("="*60 + "\n")
    
    # Run Flask app
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)