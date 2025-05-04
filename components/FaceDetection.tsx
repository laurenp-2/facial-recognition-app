// src/components/FaceDetector.tsx
import React, { useEffect, useRef, CSSProperties, useState } from "react";
import { Button } from "@mui/material";
// import tf from "@tensorflow/tfjs-node";
import faceapi from "@vladmandic/face-api";

const styles: { [key: string]: CSSProperties } = {
  videoBox: {
    borderRadius: "12px",
    width: "700px",
    height: "450px",
    objectFit: "cover",
    border: "1px solid steelblue",
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
  box: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  },
  button: {
    width: "fit-content",
    color: "steelblue",
    border: "1px solid aliceblue",
    borderRadius: "8px",
  },
};

const FaceDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [hasError, setHasError] = useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setHasError(true);
    }
  };

  useEffect(() => {
    startCamera();

    const loadModelsAndDetect = async () => {
      const MODEL_URL = "/models"; // Place models in public/models folder

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      videoRef.current?.addEventListener("play", () => {
        const canvas = faceapi.createCanvasFromMedia(videoRef.current!);
        document.body.append(canvas);

        const displaySize = {
          width: videoRef.current!.videoWidth,
          height: videoRef.current!.videoHeight,
        };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(
              videoRef.current!,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceDescriptors();

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }, 100);
      });
    };

    startCamera().then(loadModelsAndDetect);
    return () => {
      stopCamera();
    };
  }, []);

  const handlePause = () => {
    stopCamera();
    setIsStreaming(false);
  };
  const handleStart = async () => {
    await startCamera();
    setIsStreaming(true);
  };

  return (
    <div style={styles.box}>
      {hasError ? (
        <div style={styles.videoBox}>
          <p>Camera access denied.</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            width={720}
            height={560}
            style={{
              ...styles.videoBox,
              display: isStreaming ? "block" : "none",
            }}
          />
          {!isStreaming && (
            <div style={styles.videoBox}>
              <p>Webcam paused.</p>
            </div>
          )}
        </>
      )}

      {isStreaming ? (
        <Button onClick={handlePause}>Pause Video</Button>
      ) : (
        <Button onClick={handleStart}>Start Video</Button>
      )}
    </div>
  );
};

export default FaceDetector;
