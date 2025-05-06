"use client";

import { CSSProperties } from "react";
import FaceDetector from "@/components/FaceDetection";

const styles: { [key: string]: CSSProperties } = {
  page: {
    color: "steelblue",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    padding: "40px",
    justifyContent: "center",
    gap: "20px",
  },
  link: {
    textDecoration: "underline",
  },
};

export default function Home() {
  return (
    <div style={styles.page}>
      <h1>Facial Recognition</h1>

      <FaceDetector />

      <p>
        This app uses{" "}
        <a
          href="https://github.com/vladmandic/face-api"
          target="_blank"
          style={styles.link}
        >
          FaceAPI
        </a>{" "}
        to recognize and analyze user faces.
      </p>
    </div>
  );
}
