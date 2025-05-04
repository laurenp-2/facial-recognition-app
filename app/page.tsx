"use client";

import { CSSProperties } from "react";
import { Button } from "@mui/material";
// import Webcam from "@/components/Webcam";
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

  button: {
    backgroundColor: "steelblue",
    color: "aliceblue",
    border: "1px solid steelblue",
    borderRadius: "8px",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
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

      <div style={styles.buttonContainer}>
        <Button style={styles.button}>Upload Image</Button>
        <Button style={styles.button}>Detect emotion</Button>
      </div>

      <p>
        This app uses{" "}
        <a
          href="https://github.com/vladmandic/face-api"
          target="_blank"
          style={styles.link}
        >
          FaceAPI
        </a>{" "}
        to recognize user faces.
      </p>
    </div>
  );
}
