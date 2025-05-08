/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, CSSProperties, useState } from "react";
import { Button } from "@mui/material";
import * as faceapi from "face-api.js";
import ImageInputButton from "./ImageInputButton";

const styles: { [key: string]: CSSProperties } = {
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  },
  buttonsBox: { display: "flex", flexDirection: "row", gap: "10px" },
  videoBox: {
    width: "50vw",
    height: "auto",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #700c43",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    aspectRatio: "3 / 2",
  },
  imageContainer: {
    width: "50vw",
    height: "auto",
    position: "relative",
    borderRadius: "12px",
    border: "1px solid #700c43",
    overflow: "hidden",
    aspectRatio: "3 / 2",
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
    backgroundImage:
      "url(https://media.istockphoto.com/id/1370962549/vector/violet-purple-pink-and-navy-blue-defocused-blurred-motion-gradient-abstract-background-vector.jpg?s=612x612&w=0&k=20&c=A6ArKVzCqEArn9ORyAYm78kbKyI47t2U2QWuHnwUkVg=)",
    backgroundPosition: "left",
    color: "#ffe8fe",
    border: "1px solid #a82c72",
    borderRadius: "8px",
  },
  buttonSecondary: {
    backgroundImage:
      "url(https://media.istockphoto.com/id/1370962549/vector/violet-purple-pink-and-navy-blue-defocused-blurred-motion-gradient-abstract-background-vector.jpg?s=612x612&w=0&k=20&c=A6ArKVzCqEArn9ORyAYm78kbKyI47t2U2QWuHnwUkVg=)",
    color: "transparent",
    backgroundClip: "text",
    backgroundPosition: "center",
    border: "1px solid #a82c72",
    borderRadius: "8px",
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
      // Clear any existing image when starting camera
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
      const MODEL_URL = "/models"; // Using local models directory
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

  const setupFaceDetection = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    console.log("Setting up face detection");

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Wait for video metadata to load to get correct dimensions
    video.addEventListener("loadedmetadata", () => {
      // Set canvas dimensions to match video
      const displaySize = {
        width: video.clientWidth,
        height: video.clientHeight,
      };
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
            .withAgeAndGender();

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

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

            // Draw age and gender
            resizedDetections.forEach((detection) => {
              const { age, gender, genderProbability } = detection;
              if (age && gender) {
                const text = `${Math.round(age)} years, ${gender} (${Math.round(
                  genderProbability * 100
                )}%)`;
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

  const handleImageSelected = (image: HTMLImageElement) => {
    // Stop camera if it's running
    if (isStreaming) {
      stopCamera();
      setIsStreaming(false);
    }

    // Set image URL to display the image
    setSelectedImage(image.src);
    setIsProcessingImage(true);

    // Process the image for face detection
    if (canvasRef.current && modelsLoaded) {
      // Short delay to ensure DOM updates before processing
      setTimeout(() => {
        processImage(image);
        setIsProcessingImage(false);
      }, 100);
    }
  };

  const processImage = async (image: HTMLImageElement) => {
    if (!canvasRef.current || !modelsLoaded) return;

    const canvas = canvasRef.current;

    // Get the parent container dimensions
    const parentElement = canvas.parentElement;
    const displaySize = {
      width: parentElement?.clientWidth || 800,
      height: parentElement?.clientHeight || 600,
    };

    // Set canvas dimensions to match container
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

      // Store the detections for reuse when toggling settings
      setLastDetections(resizedDetections);

      // Draw the detections
      drawDetections(canvas, resizedDetections);

      console.log(`Detected ${detections.length} faces in image`);
    } catch (error) {
      console.error("Error during face detection on image:", error);
    }
  };

  // Separate function to draw detections - can be called when toggling settings
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

    // Draw age and gender
    detections.forEach((detection) => {
      const { age, gender, genderProbability } = detection;
      if (age && gender) {
        const text = `${Math.round(age)} years, ${gender} (${Math.round(
          genderProbability * 100
        )}%)`;
        const { x, y } = detection.detection.box;
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(text, x, y - 10);
      }
    });
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
    // Load models
    loadModels().then((success) => {
      if (success) {
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

  // When selected image changes and there's an image ref available, process it
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
          <p>Camera access denied.</p>
        </div>
      ) : (
        <div style={{ position: "relative", width: "50vw" }}>
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
              <p>Webcam paused. Upload an image or start the webcam.</p>
            </div>
          )}

          {isProcessingImage && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "5px",
                zIndex: 10,
              }}
            >
              Processing image...
            </div>
          )}
        </div>
      )}

      <div style={styles.buttonsBox}>
        {isStreaming ? (
          <Button
            onClick={handlePause}
            sx={{ fontFamily: "var(--inter)", textTransform: "none" }}
            style={styles.buttonSecondary}
          >
            Pause Video
          </Button>
        ) : (
          <Button
            onClick={handleStart}
            sx={{ fontFamily: "var(--inter)", textTransform: "none" }}
            style={styles.buttonPrimary}
          >
            Start Video
          </Button>
        )}

        <Button
          style={showEmotions ? styles.buttonSecondary : styles.buttonPrimary}
          sx={{ fontFamily: "var(--inter)", textTransform: "none" }}
          onClick={() => setShowEmotions(!showEmotions)}
        >
          {showEmotions ? "Hide Emotions" : "Show Emotions"}
        </Button>

        <Button
          style={showLandmarks ? styles.buttonSecondary : styles.buttonPrimary}
          sx={{ fontFamily: "var(--inter)", textTransform: "none" }}
          onClick={() => setShowLandmarks(!showLandmarks)}
        >
          {showLandmarks ? "Hide Landmarks" : "Show Landmarks"}
        </Button>

        <ImageInputButton onImageSelected={handleImageSelected} />
      </div>

      {!modelsLoaded && <p>Loading face detection models...</p>}
    </div>
  );
};

export default FaceDetector;
