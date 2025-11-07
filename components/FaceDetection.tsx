/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, CSSProperties, useState } from "react";
import { Button } from "@mui/material";
import * as faceapi from "face-api.js";
import ImageInputButton from "./ImageInputButton";
import EmotionDashboard from "./EmotionDashboard";
import { EmotionData } from "../types/emotions";

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    alignItems: "center",
    width: "100%",
  },
  buttonsBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    width: "100%",
    justifyContent: "center",
  },
  videoBox: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    borderRadius: "16px",
    border: "2px solid rgba(168, 44, 114, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    aspectRatio: "16 / 9",
    background: "rgba(0, 0, 0, 0.4)",
    boxShadow: "0 8px 32px rgba(168, 44, 114, 0.2)",
  },
  imageContainer: {
    width: "100%",
    height: "auto",
    position: "relative",
    borderRadius: "16px",
    border: "2px solid rgba(168, 44, 114, 0.3)",
    overflow: "hidden",
    aspectRatio: "16 / 9",
    background: "rgba(0, 0, 0, 0.4)",
    boxShadow: "0 8px 32px rgba(168, 44, 114, 0.2)",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #ff6ec7 0%, #c44cff 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "0.75rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    textTransform: "none",
    boxShadow: "0 4px 20px rgba(255, 110, 199, 0.3)",
    transition: "all 0.3s ease",
    minWidth: "140px",
  },
  buttonSecondary: {
    background: "transparent",
    color: "#ff6ec7",
    border: "2px solid #ff6ec7",
    borderRadius: "12px",
    padding: "0.75rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    textTransform: "none",
    transition: "all 0.3s ease",
    minWidth: "140px",
  },
  messageText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "1rem",
    margin: 0,
  },
  loadingText: {
    color: "#ff6ec7",
    fontSize: "0.95rem",
    margin: 0,
  },
  processingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(0, 0, 0, 0.85)",
    color: "#ff6ec7",
    padding: "1rem 2rem",
    borderRadius: "12px",
    border: "1px solid rgba(255, 110, 199, 0.3)",
    zIndex: 10,
    fontSize: "1rem",
    fontWeight: "600",
  },
};

const FaceDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const detectionIntervalRef = useRef<number | null>(null);
  const [showEmotions, setShowEmotions] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const showEmotionsRef = useRef(showEmotions);
  const showLandmarksRef = useRef(showLandmarks);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [lastDetections, setLastDetections] = useState<any[] | null>(null);

  // Emotion tracking state
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [isTrackingEmotions, setIsTrackingEmotions] = useState(false);
  const isTrackingEmotionsRef = useRef(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      setSelectedImage(null);
      setLastDetections(null);

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
      const MODEL_URL = "/models";
      console.log("Loading face detection models from:", MODEL_URL);

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
      console.log("Face detection models loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading face detection models:", error);
      return false;
    }
  };

  const getDominantEmotion = (expressions: any): string => {
    const emotions = Object.entries(expressions) as [string, number][];
    const dominant = emotions.reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    );
    return dominant[0];
  };

  const setupFaceDetection = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    console.log("Setting up face detection");

    const video = videoRef.current;
    const canvas = canvasRef.current;

    video.addEventListener("loadedmetadata", () => {
      const displaySize = {
        width: video.clientWidth,
        height: video.clientHeight,
      };
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      faceapi.matchDimensions(canvas, displaySize);

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
            .withAgeAndGender();

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          // Track emotions if enabled and face detected
          if (isTrackingEmotionsRef.current && detections.length > 0) {
            const firstFace = detections[0];
            const emotionData: EmotionData = {
              timestamp: Date.now(),
              emotions: {
                neutral: firstFace.expressions.neutral,
                happy: firstFace.expressions.happy,
                sad: firstFace.expressions.sad,
                angry: firstFace.expressions.angry,
                fearful: firstFace.expressions.fearful,
                disgusted: firstFace.expressions.disgusted,
                surprised: firstFace.expressions.surprised,
              },
              dominantEmotion: getDominantEmotion(firstFace.expressions),
            };

            setEmotionHistory((prev) => [...prev, emotionData]);
          }

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            if (showLandmarksRef.current) {
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            }
            if (showEmotionsRef.current) {
              faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            }

            resizedDetections.forEach((detection) => {
              const { age, gender, genderProbability } = detection;
              if (age && gender) {
                const text = `${Math.round(age)} years, ${gender} (${Math.round(
                  genderProbability * 100
                )}%)`;
                const { x, y } = detection.detection.box;
                ctx.fillStyle = "#ff6ec7";
                ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
                ctx.lineWidth = 3;
                ctx.font = "bold 16px Arial";
                ctx.strokeText(text, x, y - 10);
                ctx.fillText(text, x, y - 10);
              }
            });

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

  const handleImageSelected = (image: HTMLImageElement) => {
    if (isStreaming) {
      stopCamera();
      setIsStreaming(false);
    }

    setSelectedImage(image.src);
    setIsProcessingImage(true);

    if (canvasRef.current && modelsLoaded) {
      setTimeout(() => {
        processImage(image);
        setIsProcessingImage(false);
      }, 100);
    }
  };

  const processImage = async (image: HTMLImageElement) => {
    if (!canvasRef.current || !modelsLoaded) return;

    const canvas = canvasRef.current;

    const parentElement = canvas.parentElement;
    const displaySize = {
      width: parentElement?.clientWidth || 800,
      height: parentElement?.clientHeight || 600,
    };

    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    faceapi.matchDimensions(canvas, displaySize);

    try {
      const detections = await faceapi
        .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      setLastDetections(resizedDetections);
      drawDetections(canvas, resizedDetections);

      console.log(`Detected ${detections.length} faces in image`);
    } catch (error) {
      console.error("Error during face detection on image:", error);
    }
  };

  const drawDetections = (canvas: HTMLCanvasElement, detections: any[]) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, detections);

    if (showLandmarksRef.current) {
      faceapi.draw.drawFaceLandmarks(canvas, detections);
    }

    if (showEmotionsRef.current) {
      faceapi.draw.drawFaceExpressions(canvas, detections);
    }

    detections.forEach((detection) => {
      const { age, gender, genderProbability } = detection;
      if (age && gender) {
        const text = `${Math.round(age)} years, ${gender} (${Math.round(
          genderProbability * 100
        )}%)`;
        const { x, y } = detection.detection.box;
        ctx.fillStyle = "#ff6ec7";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
        ctx.lineWidth = 3;
        ctx.font = "bold 16px Arial";
        ctx.strokeText(text, x, y - 10);
        ctx.fillText(text, x, y - 10);
      }
    });
  };

  // Emotion tracking handlers
  const handleStartTracking = () => {
    setIsTrackingEmotions(true);
    isTrackingEmotionsRef.current = true;
    setEmotionHistory([]);
  };

  const handleStopTracking = () => {
    setIsTrackingEmotions(false);
    isTrackingEmotionsRef.current = false;
  };

  const handleExportData = () => {
    // Export as JSON
    const jsonData = JSON.stringify(
      {
        sessionStart: emotionHistory[0]?.timestamp || Date.now(),
        sessionEnd:
          emotionHistory[emotionHistory.length - 1]?.timestamp || Date.now(),
        dataPoints: emotionHistory.length,
        data: emotionHistory,
      },
      null,
      2
    );

    const jsonBlob = new Blob([jsonData], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = `emotion-data-${Date.now()}.json`;
    jsonLink.click();

    // Export as CSV
    const csvHeader =
      "Timestamp,Neutral,Happy,Sad,Angry,Fearful,Disgusted,Surprised,Dominant\n";
    const csvRows = emotionHistory
      .map(
        (data) =>
          `${data.timestamp},${data.emotions.neutral},${data.emotions.happy},${data.emotions.sad},${data.emotions.angry},${data.emotions.fearful},${data.emotions.disgusted},${data.emotions.surprised},${data.dominantEmotion}`
      )
      .join("\n");
    const csvData = csvHeader + csvRows;

    const csvBlob = new Blob([csvData], { type: "text/csv" });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement("a");
    csvLink.href = csvUrl;
    csvLink.download = `emotion-data-${Date.now()}.csv`;
    csvLink.click();
  };

  const handleClearData = () => {
    setEmotionHistory([]);
    setIsTrackingEmotions(false);
    isTrackingEmotionsRef.current = false;
  };

  useEffect(() => {
    showEmotionsRef.current = showEmotions;
    if (selectedImage && lastDetections && canvasRef.current) {
      drawDetections(canvasRef.current, lastDetections);
    }
  }, [showEmotions, selectedImage, lastDetections]);

  useEffect(() => {
    showLandmarksRef.current = showLandmarks;
    if (selectedImage && lastDetections && canvasRef.current) {
      drawDetections(canvasRef.current, lastDetections);
    }
  }, [showLandmarks, selectedImage, lastDetections]);

  useEffect(() => {
    loadModels().then((success) => {
      if (success) {
        startCamera().then((cameraStarted) => {
          if (cameraStarted) {
            setupFaceDetection();
          }
        });
      }
    });

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (modelsLoaded && isStreaming) {
      setupFaceDetection();
    }
  }, [modelsLoaded, isStreaming, setupFaceDetection]);

  useEffect(() => {
    if (
      selectedImage &&
      imageRef.current &&
      imageRef.current.complete &&
      modelsLoaded
    ) {
      processImage(imageRef.current);
    }
  }, [selectedImage, modelsLoaded]);

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
          <p style={styles.messageText}>
            Camera access denied. Please enable camera permissions.
          </p>
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%" }}>
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

          {selectedImage && (
            <div style={styles.imageContainer}>
              <img
                ref={imageRef}
                src={selectedImage}
                alt="Uploaded"
                style={styles.uploadedImage}
                onLoad={() => {
                  if (imageRef.current && modelsLoaded) {
                    processImage(imageRef.current);
                  }
                }}
              />
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{
              ...styles.canvas,
              display: isStreaming || selectedImage ? "block" : "none",
            }}
          />

          {!isStreaming && !selectedImage && (
            <div style={styles.videoBox}>
              <p style={styles.messageText}>
                Webcam paused. Upload an image or start the webcam.
              </p>
            </div>
          )}

          {isProcessingImage && (
            <div style={styles.processingOverlay}>Processing image...</div>
          )}
        </div>
      )}

      <div style={styles.buttonsBox}>
        {isStreaming ? (
          <Button
            onClick={handlePause}
            sx={{
              ...styles.buttonSecondary,
              "&:hover": {
                background: "rgba(255, 110, 199, 0.1)",
                borderColor: "#c44cff",
                color: "#c44cff",
              },
            }}
          >
            Pause Video
          </Button>
        ) : (
          <Button
            onClick={handleStart}
            sx={{
              ...styles.buttonPrimary,
              "&:hover": {
                background: "linear-gradient(135deg, #c44cff 0%, #7c3aed 100%)",
                boxShadow: "0 6px 30px rgba(255, 110, 199, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Start Video
          </Button>
        )}

        <Button
          sx={{
            ...(showEmotions ? styles.buttonSecondary : styles.buttonPrimary),
            "&:hover": showEmotions
              ? {
                  background: "rgba(255, 110, 199, 0.1)",
                  borderColor: "#c44cff",
                  color: "#c44cff",
                }
              : {
                  background:
                    "linear-gradient(135deg, #c44cff 0%, #7c3aed 100%)",
                  boxShadow: "0 6px 30px rgba(255, 110, 199, 0.4)",
                  transform: "translateY(-2px)",
                },
          }}
          onClick={() => setShowEmotions(!showEmotions)}
        >
          {showEmotions ? "Hide Emotions" : "Show Emotions"}
        </Button>

        <Button
          sx={{
            ...(showLandmarks ? styles.buttonSecondary : styles.buttonPrimary),
            "&:hover": showLandmarks
              ? {
                  background: "rgba(255, 110, 199, 0.1)",
                  borderColor: "#c44cff",
                  color: "#c44cff",
                }
              : {
                  background:
                    "linear-gradient(135deg, #c44cff 0%, #7c3aed 100%)",
                  boxShadow: "0 6px 30px rgba(255, 110, 199, 0.4)",
                  transform: "translateY(-2px)",
                },
          }}
          onClick={() => setShowLandmarks(!showLandmarks)}
        >
          {showLandmarks ? "Hide Landmarks" : "Show Landmarks"}
        </Button>

        <ImageInputButton onImageSelected={handleImageSelected} />
      </div>

      {!modelsLoaded && (
        <p style={styles.loadingText}>Loading face detection models...</p>
      )}

      {/* Emotion Analytics Dashboard */}
      <EmotionDashboard
        emotionHistory={emotionHistory}
        isTracking={isTrackingEmotions}
        onStartTracking={handleStartTracking}
        onStopTracking={handleStopTracking}
        onExportData={handleExportData}
        onClearData={handleClearData}
      />
    </div>
  );
};

export default FaceDetector;
