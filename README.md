# Face Analyzer

A real-time facial recognition and analysis application built with TypeScript, React, and Next.js that utilizes FaceAPI for face detection, emotion recognition, and facial landmark tracking.

![Face Analyzer Demo](https://github.com/laurenp-2/facial-recognition-app/raw/main/public/demo.png)

## 🌐 Live Demo

The application is deployed and accessible at: [https://facial-recognition-app-bice.vercel.app/](https://facial-recognition-app-bice.vercel.app/)

## ✨ Features

- **Real-time Face Detection**: Detects faces using your webcam feed
- **Emotion Recognition**: Analyzes and displays emotions (happy, sad, angry, etc.)
- **Facial Landmarks**: Maps and displays key facial features 
- **Image Upload Analysis**: Upload images to analyze faces in photos
- **Responsive Design**: Works across various devices and screen sizes
- **User Controls**: Pause video, toggle emotion display, toggle facial landmarks

## 🛠️ Technology Stack

- **Frontend Framework**: [React](https://reactjs.org/) with [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Face Detection**: [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- **Styling**: CSS/SCSS
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14.x or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/laurenp-2/facial-recognition-app.git
   cd facial-recognition-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📝 Usage Instructions

1. **Allow Camera Access**: When prompted, allow the application to access your camera.
2. **Wait for Models**: The application will load facial recognition models (this might take a moment).
3. **Use Controls**:
   - Click "Pause Video" to freeze the current frame
   - Toggle "Show Emotions" to display emotion recognition
   - Toggle "Show Landmarks" to display facial feature points
   - Use "Upload Image" to analyze faces in static images

## 📂 Project Structure

```
facial-recognition-app/
├── app/                 # Next.js app directory
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── page.tsx         # Main page component
├── public/              # Static assets and face-api models
├── styles/              # Global styles
├── next.config.js       # Next.js configuration
└── tsconfig.json        # TypeScript configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgements

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for the facial recognition technology
- [Next.js](https://nextjs.org/) for the React framework
- [Vercel](https://vercel.com/) for hosting the application

---

Created by [Lauren](https://github.com/laurenp-2)
