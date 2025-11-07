
export interface EmotionData {
  timestamp: number;
  emotions: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    disgusted: number;
    surprised: number;
  };
  dominantEmotion: string;
}

export interface EmotionSummary {
  emotion: string;
  percentage: number;
  count: number;
  color: string;
}

export interface SessionData {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  emotionHistory: EmotionData[];
  summary: EmotionSummary[];
}