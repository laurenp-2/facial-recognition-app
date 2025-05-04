/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, CSSProperties, useState } from "react";
import { Button } from "@mui/material";
import * as faceapi from "@vladmandic/face-api";

const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  },
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
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const detectionIntervalRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    
    // Clear detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
      return true;
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setHasError(true);
      return false;
    }
  };

  const loadModels = async () => {
    try {
      const MODEL_URL = "/models"; // Using local models directory
      console.log("Loading face detection models from:", MODEL_URL);

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        // Not loading faceRecognitionNet since the model file is missing
      ]);
      
      setModelsLoaded(true);
      console.log("Face detection models loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading face detection models:", error);
      return false;
    }
  };

  const setupFaceDetection = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;
    
    console.log("Setting up face detection");
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Wait for video metadata to load to get correct dimensions
    video.addEventListener('loadedmetadata', () => {
      // Set canvas dimensions to match video
      const displaySize = { width: video.clientWidth, height: video.clientHeight };
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      faceapi.matchDimensions(canvas, displaySize);
      
      // Start detection loop
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      
      detectionIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || video.paused || video.ended) return;
        
        try {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender(); // Using the age and gender model instead
            
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            
            // Draw age and gender
            resizedDetections.forEach(detection => {
              const { age, gender, genderProbability } = detection;
              if (age && gender) {
                const text = `${Math.round(age)} years, ${gender} (${Math.round(genderProbability * 100)}%)`;
                const { x, y } = detection.detection.box;
                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.fillText(text, x, y - 10);
              }
            });
            
            // Debug output
            if (detections.length > 0) {
              console.log(`Detected ${detections.length} faces`);
            }
          }
        } catch (error) {
          console.error("Error during face detection:", error);
        }
      }, 100);
    });
  }, [modelsLoaded]);

  useEffect(() => {
    // Load models first
    loadModels().then((success) => {
      if (success) {
        // Then start camera and setup detection
        startCamera().then((cameraStarted) => {
          if (cameraStarted) {
            setupFaceDetection();
          }
        });
      }
    });
    
    // Cleanup function
    return () => {
      stopCamera();
    };
  }, []);
  
  // Setup detection when models are loaded and video is streaming
  useEffect(() => {
    if (modelsLoaded && isStreaming) {
      setupFaceDetection();
    }
  }, [modelsLoaded, isStreaming, setupFaceDetection]);

  const handlePause = () => {
    stopCamera();
    setIsStreaming(false);
  };
  
  const handleStart = async () => {
    const success = await startCamera();
    if (success && modelsLoaded) {
      setupFaceDetection();
    }
  };

  return (
    <div style={styles.container}>
      {hasError ? (
        <div style={styles.videoBox}>
          <p>Camera access denied.</p>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              ...styles.videoBox,
              display: isStreaming ? "block" : "none",
            }}
          />
          <canvas 
            ref={canvasRef} 
            style={{
              ...styles.canvas,
              display: isStreaming ? "block" : "none",
            }} 
          />
          {!isStreaming && (
            <div style={styles.videoBox}>
              <p>Webcam paused.</p>
            </div>
          )}
        </div>
      )}

      {isStreaming ? (
        <Button onClick={handlePause} style={styles.button}>Pause Video</Button>
      ) : (
        <Button onClick={handleStart} style={styles.button}>Start Video</Button>
      )}
      
      {!modelsLoaded && <p>Loading face detection models...</p>}
    </div>
  );
};

export default FaceDetector;