"use client";

import { CSSProperties } from "react";
import FaceDetector from "@/components/FaceDetection";

const styles: { [key: string]: CSSProperties } = {
  background: { position: "relative", zIndex: "-1" },
  page: {
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
    alignItems: "center",
    textAlign: "center",
    padding: "2% max(5vw, 20px)",
    display: "flex",
    backgroundImage: "url(/393009763_34ba5513-fd0d-4432-851e-0486ed8af440.jpg)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  pageContent: {
    width: "clamp(300px, 70%, 900px)",
    backgroundColor: "black",
    boxShadow: "0 0 40px 30px rgba(0, 0, 0, 0.7)",

    color: "steelblue",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    padding: "40px",
    justifyContent: "center",
    gap: "20px",
    borderRadius: "10px",
  },
  link: {
    textDecoration: "underline",
  },
};

export default function Home() {
  return (
    <div style={styles.page}>
      <div style={styles.pageContent}>
        <div style={{ textAlign: "left", display: "flex", width: "90%", }}>
          <h1
            style={{
              fontStyle: "italic",
              backgroundImage:
                "url(https://media.istockphoto.com/id/1370962549/vector/violet-purple-pink-and-navy-blue-defocused-blurred-motion-gradient-abstract-background-vector.jpg?s=612x612&w=0&k=20&c=A6ArKVzCqEArn9ORyAYm78kbKyI47t2U2QWuHnwUkVg=)",
              color: "transparent",
              backgroundClip: "text",
              backgroundPosition: "center",
              backgroundSize: "cover",
              fontSize: "clamp(35px, 5vw + 10px, 50px)"
            }}
          >
            FACE ANALYZER
          </h1>
        </div>

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
    </div>
  );
}
