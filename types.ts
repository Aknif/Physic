
export enum Screen {
  LOGIN = 'LOGIN',
  ENGAGEMENT = 'ENGAGEMENT',
  CHALLENGE = 'CHALLENGE',
  VIRTUAL_LAB = 'VIRTUAL_LAB',
  EXPLANATION = 'EXPLANATION',
  COLLABORATION = 'COLLABORATION',
  RESOURCE_HUB = 'RESOURCE_HUB',
  COMMUNITY = 'COMMUNITY',
  THANK_YOU = 'THANK_YOU',
  ADMIN_REPORT = 'ADMIN_REPORT',
}

export interface StudentReport {
  id: string;
  userName: string;
  studentId: string;
  timestamp: string;
  cer: CERState;
  observationsCount: number;
  observationNotes?: string[]; // เพิ่มฟิลด์เก็บข้อความบันทึก
  questionsAsked: string[];
  aiFeedback: string;
  lmsStatus?: 'completed' | 'incomplete';
  score: number; // Overall percentage or final mission score
  quizScore: number; // Number of correct answers in Engagement phase
  totalQuizQuestions: number;
  materialsTested: string[]; // List of materials tested in the virtual lab
  collaborationBonus: number; // Points from answering peers
  starRating: number; // Student satisfaction rating
  feedbackComment: string; // Student feedback
}

export interface LabResult {
  id: string;
  n: number;
  v: number;
  core: 'Air' | 'Iron';
  b: number; // Magnetic field strength
  timestamp: Date;
}

export interface VideoObservation {
  id: string;
  text: string;
  timestamp: Date;
}

export interface CERState {
  phrase?: string;
  claim: string;
  evidence: string;
  reasoning: string;
}

export interface CommunityReply {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface CommunityQuestion {
  id: string;
  author: string;
  question: string;
  timestamp: string;
  replies: CommunityReply[];
}

export interface LMSSyncResult {
  success: boolean;
  message: string;
  apiFound: boolean;
}
