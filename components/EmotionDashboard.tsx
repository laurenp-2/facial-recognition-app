import React, { CSSProperties } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@mui/material";
import { EmotionData, EmotionSummary } from "../types/emotions";

interface EmotionDashboardProps {
  emotionHistory: EmotionData[];
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onExportData: () => void;
  onClearData: () => void;
}

const EMOTION_COLORS: { [key: string]: string } = {
  happy: "#ffe876ff",
  sad: "#7f9fffff",
  angry: "#ff496eff",
  fearful: "#ff4fffff",
  disgusted: "#35ea35ff",
  surprised: "#ffb356ff",
  neutral: "#c8c8c8ff",
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    padding: "1.5rem",
    background: "rgba(20, 20, 30, 0.6)",
    borderRadius: "16px",
    border: "1px solid rgba(168, 44, 114, 0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ff6ec7 0%, #c44cff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
  },
  buttonGroup: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  button: {
    background: "linear-gradient(135deg, #ff6ec7 0%, #c44cff 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "none",
    minWidth: "100px",
  },
  buttonSecondary: {
    background: "transparent",
    color: "#ff6ec7",
    border: "2px solid #ff6ec7",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "none",
    minWidth: "100px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  statCard: {
    background: "rgba(0, 0, 0, 0.3)",
    padding: "1rem",
    borderRadius: "12px",
    border: "1px solid rgba(168, 44, 114, 0.2)",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: "0.25rem",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#ff6ec7",
  },
  chartContainer: {
    background: "rgba(0, 0, 0, 0.3)",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid rgba(168, 44, 114, 0.2)",
  },
  chartTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "1rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem 1rem",
    color: "rgba(255, 255, 255, 0.5)",
  },
  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  summaryItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
  },
  emotionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.95rem",
    color: "rgba(255, 255, 255, 0.9)",
  },
  colorDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  percentage: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#ff6ec7",
  },
};

const EmotionDashboard: React.FC<EmotionDashboardProps> = ({
  emotionHistory,
  isTracking,
  onStartTracking,
  onStopTracking,
  onExportData,
  onClearData,
}) => {
  // Calculate summary statistics
  const calculateSummary = (): EmotionSummary[] => {
    if (emotionHistory.length === 0) return [];

    const emotionCounts: { [key: string]: number } = {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0,
    };

    emotionHistory.forEach((data) => {
      emotionCounts[data.dominantEmotion]++;
    });

    const total = emotionHistory.length;
    const summary = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        percentage: (count / total) * 100,
        count,
        color: EMOTION_COLORS[emotion],
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.percentage - a.percentage);

    return summary;
  };

  // Format chart data for timeline
  const formatTimelineData = () => {
    return emotionHistory.map((data, index) => ({
      time: index,
      ...data.emotions,
    }));
  };

  // Format data for pie chart
  const formatPieData = () => {
    const summary = calculateSummary();
    return summary.map((item) => ({
      name: item.emotion,
      value: item.percentage,
      color: item.color,
    }));
  };

  const summary = calculateSummary();
  const timelineData = formatTimelineData();
  const pieData = formatPieData();
  const dominantEmotion = summary.length > 0 ? summary[0] : null;
  const sessionDuration =
    emotionHistory.length > 0
      ? Math.round(
          (emotionHistory[emotionHistory.length - 1].timestamp -
            emotionHistory[0].timestamp) /
            1000
        )
      : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Emotion Analytics</h2>
        <div style={styles.buttonGroup}>
          {isTracking ? (
            <Button
              onClick={onStopTracking}
              sx={{
                ...styles.buttonSecondary,
                "&:hover": {
                  background: "rgba(255, 110, 199, 0.1)",
                  borderColor: "#c44cff",
                },
              }}
            >
              Stop Tracking
            </Button>
          ) : (
            <Button
              onClick={onStartTracking}
              sx={{
                ...styles.button,
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #c44cff 0%, #7c3aed 100%)",
                },
              }}
            >
              Start Tracking
            </Button>
          )}
          {emotionHistory.length > 0 && (
            <>
              <Button
                onClick={onExportData}
                sx={{
                  ...styles.buttonSecondary,
                  "&:hover": {
                    background: "rgba(255, 110, 199, 0.1)",
                    borderColor: "#c44cff",
                  },
                }}
              >
                Export Data
              </Button>
              <Button
                onClick={onClearData}
                sx={{
                  ...styles.buttonSecondary,
                  "&:hover": {
                    background: "rgba(220, 20, 60, 0.1)",
                    borderColor: "#DC143C",
                    color: "#DC143C",
                  },
                }}
              >
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {emotionHistory.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Start tracking to see emotion analytics in real-time</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Dominant Emotion</div>
              <div style={styles.statValue}>
                {dominantEmotion?.emotion.toUpperCase()}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Data Points</div>
              <div style={styles.statValue}>{emotionHistory.length}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Session Duration</div>
              <div style={styles.statValue}>{sessionDuration}s</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Dominant %</div>
              <div style={styles.statValue}>
                {dominantEmotion?.percentage.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Emotion Timeline Chart */}
          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Emotion Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="time"
                  stroke="rgba(255,255,255,0.5)"
                  label={{
                    value: "Time",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  label={{
                    value: "Confidence",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(0, 0, 0, 0.9)",
                    border: "1px solid rgba(168, 44, 114, 0.3)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                {Object.keys(EMOTION_COLORS).map((emotion) => (
                  <Line
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    stroke={EMOTION_COLORS[emotion]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Full Width */}
          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Emotion Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={({ name, value }: any) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(0, 0, 0, 0.9)",
                    border: "1px solid rgba(168, 44, 114, 0.3)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary List - Full Width */}
          <div style={styles.chartContainer}>
            <h3 style={styles.chartTitle}>Emotion Breakdown</h3>
            <div style={styles.summaryList}>
              {summary.map((item) => (
                <div key={item.emotion} style={styles.summaryItem}>
                  <div style={styles.emotionLabel}>
                    <div
                      style={{
                        ...styles.colorDot,
                        background: item.color,
                      }}
                    />
                    <span style={{ textTransform: "capitalize" }}>
                      {item.emotion}
                    </span>
                  </div>
                  <div style={styles.percentage}>
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmotionDashboard;
