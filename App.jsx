# App.jsx
# MoodTrack Frontend - Video Mood & Stress Detection System
# Place this in: frontend/src/App.jsx

```jsx
import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Home, Activity, BarChart3, Settings, 
  Download, RotateCcw, Zap, TrendingUp
} from "lucide-react";

// ============================================================================
// LOADING SCREEN COMPONENT
// ============================================================================

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="mb-6">
        <div className="inline-block">
          <div className="w-16 h-16 rounded-full border-4 border-purple-600 border-t-purple-400 animate-spin"></div>
        </div>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">🎭 MoodTrack</h1>
      <p className="text-gray-400">Initializing emotion detection...</p>
      <p className="text-gray-500 text-sm mt-4">Loading neural networks & webcam...</p>
    </div>
  </div>
);

// ============================================================================
// STRESS GAUGE COMPONENT
// ============================================================================

const StressGauge = ({ stressLevel }) => {
  const getGaugeColor = () => {
    if (stressLevel < 30) return "from-emerald-400 to-emerald-600";
    if (stressLevel < 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  const getStressLabel = () => {
    if (stressLevel < 30) return "Low";
    if (stressLevel < 60) return "Medium";
    return "High";
  };

  return (
    <div className="flex justify-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop 
                offset="0%" 
                stopColor={stressLevel < 30 ? "#10b981" : stressLevel < 60 ? "#f59e0b" : "#ef4444"} 
              />
              <stop 
                offset="100%" 
                stopColor={stressLevel < 30 ? "#059669" : stressLevel < 60 ? "#d97706" : "#dc2626"} 
              />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeDasharray={`${(stressLevel / 100) * 565} 565`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold bg-gradient-to-r ${getGaugeColor()} bg-clip-text text-transparent`}>
            {Math.round(stressLevel)}%
          </span>
          <span className="text-xs text-gray-400 mt-1">{getStressLabel()}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EMOTION BARS COMPONENT
// ============================================================================

const EmotionBars = ({ allEmotions }) => {
  if (!allEmotions) return null;

  const emotionEntries = Object.entries(allEmotions).sort((a, b) => b[1] - a[1]);
  
  const emotionColors = {
    happy: "#10b981",
    sad: "#3b82f6",
    angry: "#ef4444",
    fear: "#8b5cf6",
    surprise: "#f59e0b",
    disgust: "#ec4899",
    neutral: "#6b7280"
  };

  return (
    <div className="space-y-3">
      {emotionEntries.map(([emotion, confidence]) => (
        <div key={emotion} className="flex items-center gap-3">
          <span className="w-20 text-sm font-medium text-gray-300 capitalize">{emotion}</span>
          <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${confidence}%`,
                backgroundColor: emotionColors[emotion] || "#7c3aed"
              }}
            >
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
            </div>
          </div>
          <span className="w-12 text-right text-sm font-semibold text-gray-300">{Math.round(confidence)}%</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// TIMELINE CHART COMPONENT
// ============================================================================

const TimelineChart = ({ history }) => {
  const transformedData = history.slice(-60).map((item, idx) => ({
    name: idx,
    stress: item.stress,
    confidence: Math.round(item.confidence * 100)
  }));

  if (transformedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>Waiting for emotion data...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={transformedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #4b5563", borderRadius: "8px" }}
          labelStyle={{ color: "#f1f5f9" }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="stress" 
          stroke="#f59e0b" 
          dot={false}
          strokeWidth={2}
          name="Stress Level"
        />
        <Line 
          type="monotone" 
          dataKey="confidence" 
          stroke="#10b981" 
          dot={false}
          strokeWidth={2}
          name="Confidence"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ============================================================================
// STATISTICS PANEL COMPONENT
// ============================================================================

const StatisticsPanel = ({ stats }) => {
  if (!stats) return null;

  const totalEmotions = stats.total_emotions || {};
  const emotionArray = Object.entries(totalEmotions).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#6b7280"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4">
        <div className="text-sm text-gray-300 mb-1">Average Stress</div>
        <div className="text-3xl font-bold text-purple-300">{stats.avg_stress}%</div>
        <div className="text-xs text-gray-400 mt-2">Session Average</div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4">
        <div className="text-sm text-gray-300 mb-1">Dominant Emotion</div>
        <div className="text-2xl font-bold text-blue-300">{stats.dominant_emotion}</div>
        <div className="text-xs text-gray-400 mt-2">Most detected</div>
      </div>

      <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg p-4">
        <div className="text-sm text-gray-300 mb-1">Session Duration</div>
        <div className="text-3xl font-bold text-emerald-300">{Math.round(stats.session_duration / 60)}m</div>
        <div className="text-xs text-gray-400 mt-2">{stats.session_duration}s</div>
      </div>

      <div className="bg-gradient-to-br from-rose-900 to-rose-800 rounded-lg p-4">
        <div className="text-sm text-gray-300 mb-1">Total Detections</div>
        <div className="text-3xl font-bold text-rose-300">
          {Object.values(totalEmotions).reduce((a, b) => a + b, 0)}
        </div>
        <div className="text-xs text-gray-400 mt-2">Frames analyzed</div>
      </div>

      {emotionArray.length > 0 && (
        <div className="col-span-1 md:col-span-2 bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={emotionArray}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {emotionArray.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [emotion, setEmotion] = useState("Loading...");
  const [confidence, setConfidence] = useState(0);
  const [stressLevel, setStressLevel] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [allEmotions, setAllEmotions] = useState(null);
  const [error, setError] = useState(null);

  // Loading screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch emotion data
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        // Fetch current emotion
        fetch("http://localhost:5000/emotion")
          .then((res) => res.json())
          .then((data) => {
            setEmotion(data.emotion);
            setConfidence(data.confidence);
            setStressLevel(data.stress_level);
            setFaceDetected(data.face_detected);
            setError(null);
          })
          .catch((err) => {
            console.error("Error fetching emotion:", err);
            setError("Cannot connect to backend");
          });

        // Fetch history
        fetch("http://localhost:5000/history")
          .then((res) => res.json())
          .then((data) => {
            setHistory(data.history);
            if (data.history.length > 0) {
              setAllEmotions(data.history[data.history.length - 1].all_emotions);
            }
          })
          .catch((err) => console.error("Error fetching history:", err));

        // Fetch stats
        fetch("http://localhost:5000/stats")
          .then((res) => res.json())
          .then((data) => setStats(data))
          .catch((err) => console.error("Error fetching stats:", err));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleReset = async () => {
    try {
      await fetch("http://localhost:5000/reset", { method: "POST" });
      setHistory([]);
      setStats(null);
    } catch (err) {
      console.error("Error resetting session:", err);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("http://localhost:5000/export");
      const data = await response.json();
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `moodtrack-report-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting data:", err);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎭</div>
            <div>
              <h1 className="text-xl font-bold text-white">MoodTrack</h1>
              <p className="text-xs text-gray-400">Real-time Emotion Detection</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {error ? (
              <div className="flex items-center gap-2 bg-red-900 bg-opacity-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-300">Backend Error</span>
              </div>
            ) : faceDetected ? (
              <div className="flex items-center gap-2 bg-emerald-900 bg-opacity-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-300">Face Detected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-900 bg-opacity-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-300">No Face</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 py-3">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "history", label: "History", icon: Activity },
            { id: "settings", label: "Settings", icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentTab === id
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {currentTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Emotion Card */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                <h2 className="text-sm font-semibold text-gray-300 mb-4">Current Emotion</h2>
                <div className="text-center py-6">
                  <div className="text-6xl mb-4">
                    {emotion === "Happy" && "😊"}
                    {emotion === "Sad" && "😢"}
                    {emotion === "Angry" && "😠"}
                    {emotion === "Fear" && "😨"}
                    {emotion === "Surprise" && "😲"}
                    {emotion === "Disgust" && "🤢"}
                    {emotion === "Neutral" && "😐"}
                    {!["Happy", "Sad", "Angry", "Fear", "Surprise", "Disgust", "Neutral"].includes(emotion) && "🤷"}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{emotion}</h3>
                  <p className="text-sm text-gray-400 mb-4">Confidence: {Math.round(confidence * 100)}%</p>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                      style={{ width: `${confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Stress Level */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 mt-6">
                <h2 className="text-sm font-semibold text-gray-300 mb-4">Stress Level</h2>
                <StressGauge stressLevel={stressLevel} />
              </div>
            </div>

            {/* Emotion Classification */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
                <h2 className="text-sm font-semibold text-gray-300 mb-4">Emotion Classification</h2>
                <EmotionBars allEmotions={allEmotions} />
              </div>

              {/* Timeline */}
              {history.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 mt-6">
                  <h2 className="text-sm font-semibold text-gray-300 mb-4">Emotion Timeline</h2>
                  <TimelineChart history={history} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {currentTab === "analytics" && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-6">Session Analytics</h2>
            <StatisticsPanel stats={stats} />
          </div>
        )}

        {/* History Tab */}
        {currentTab === "history" && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-4">Emotion History</h2>
            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No emotion history yet. Wait for detection to start...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300">Time</th>
                      <th className="text-left py-3 px-4 text-gray-300">Emotion</th>
                      <th className="text-left py-3 px-4 text-gray-300">Confidence</th>
                      <th className="text-left py-3 px-4 text-gray-300">Stress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(-20).reverse().map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700 bg-opacity-30 transition">
                        <td className="py-2 px-4 text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-4 text-white font-medium">{item.emotion}</td>
                        <td className="py-2 px-4 text-gray-300">{Math.round(item.confidence * 100)}%</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.stress < 30 ? "bg-emerald-900 text-emerald-200" :
                            item.stress < 60 ? "bg-yellow-900 text-yellow-200" :
                            "bg-red-900 text-red-200"
                          }`}>
                            {item.stress}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {currentTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Session Controls</h3>
              <div className="space-y-3">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
                >
                  <RotateCcw size={18} />
                  Reset Session
                </button>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                >
                  <Download size={18} />
                  Export Report (JSON)
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">About MoodTrack</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong className="text-gray-300">Version:</strong> 1.0.0</p>
                <p><strong className="text-gray-300">ML Framework:</strong> DeepFace (TensorFlow)</p>
                <p><strong className="text-gray-300">Emotions Tracked:</strong> 7</p>
                <p><strong className="text-gray-300">Real-time Processing:</strong> ✅ Enabled</p>
                <p><strong className="text-gray-300">Privacy:</strong> 🔒 Local Processing</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-900 text-center py-4 mt-12">
        <p className="text-sm text-gray-400">
          AI VERSE 2.0 - Augment AI Hackathon | BMSCE | Video Mood & Stress Detection
        </p>
      </footer>
    </div>
  );
}
```