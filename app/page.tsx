"use client";

import { CSSProperties } from "react";
import FaceDetector from "@/components/FaceDetection";

const styles: { [key: string]: CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    background:
      "linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a1a 100%)",
    position: "relative",
    overflow: "hidden",
  },
  backgroundOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "radial-gradient(circle at 20% 50%, rgba(168, 44, 114, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(112, 12, 167, 0.15) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  pageContent: {
    position: "relative",
    width: "100%",
    maxWidth: "1000px",
    background: "rgba(15, 15, 20, 0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(168, 44, 114, 0.2)",
    borderRadius: "24px",
    padding: "2.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    boxShadow:
      "0 20px 60px rgba(168, 44, 114, 0.15), 0 0 100px rgba(112, 12, 167, 0.1)",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #ff6ec7 0%, #c44cff 50%, #7c3aed 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "0.02em",
    margin: 0,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "400",
    margin: 0,
  },
  footer: {
    textAlign: "center",
    padding: "1rem",
    background: "rgba(168, 44, 114, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(168, 44, 114, 0.1)",
  },
  footerText: {
    fontSize: "0.95rem",
    color: "rgba(255, 255, 255, 0.7)",
    margin: 0,
  },
  link: {
    color: "#ff6ec7",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.2s ease",
  },
};

export default function Home() {
  return (
    <div style={styles.page}>
      <div style={styles.backgroundOverlay} />
      <div style={styles.pageContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Face Analyzer</h1>
          <p style={styles.subtitle}>
            AI-powered facial detection, emotion analysis, and age estimation
          </p>
        </div>

        <FaceDetector />

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Powered by{" "}
            <a
              href="https://github.com/vladmandic/face-api"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c44cff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#ff6ec7")}
            >
              Face-API.js
            </a>{" "}
            for real-time face recognition and analysis
          </p>
        </div>
      </div>
    </div>
  );
}
