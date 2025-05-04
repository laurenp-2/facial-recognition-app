"use client";

import { CSSProperties } from "react";
import { Button, Divider } from "@mui/material";
import FaceDetector from "@/components/FaceDetection";
import ImageInputButton from "@/components/UploadFile";

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

      <Divider style={styles.buttonContainer}>
        <ImageInputButton></ImageInputButton>
        <Button style={styles.button}>Detect emotion</Button>
      </Divider>

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
