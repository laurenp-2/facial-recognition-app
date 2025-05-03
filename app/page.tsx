"use client";

import { useState, useRef, useEffect, CSSProperties } from "react";
import { Button } from "@mui/material";

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
  box: {
    borderRadius: "12px",
    width: "60%",
    height: "450px",
    objectFit: "cover",
    border: "1px solid steelblue",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
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
  const Webcam = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing webcam:", error);
          setHasError(true);
        }
      };
      startCamera();

      // Cleanup function to stop the media stream when the component unmounts
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
        }
      };
    }, []);
    if (hasError) {
      return (
        <div style={styles.box}>
          <p>Error accessing webcam</p>
        </div>
      );
    }

    return <video ref={videoRef} autoPlay style={styles.box} />;
  };

  return (
    <div style={styles.page}>
      <h1>Face Recognition app.</h1>

      <Webcam />

      <div style={styles.buttonContainer}>
        <Button style={styles.button}>Upload Image</Button>
        <Button style={styles.button}>Detect emotion</Button>
      </div>

      <p>
        This app uses{" "}
        <a
          href="https://github.com/serengil/deepface"
          target="_blank"
          style={styles.link}
        >
          Deepface
        </a>{" "}
        to recognize user faces.
      </p>
    </div>
  );
}
