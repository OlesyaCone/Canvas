export interface UserRef {
  _id: string;
  username: string;
  avatar?: string;
}

export interface User extends UserRef {
  id?: string;
  email?: string;
  avatar: string;
  provider?: "local" | "google";
  isVerified?: boolean;
  myTests: string[];
  passedTests: string[];
  groups: string[];
  createdAt: string;
}
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfilePayload {
  username: string;
  avatar?: string;
}

export interface Question {
  question: string;
  img?: string;
  answers: string[];
  correctAnswer: string;
}

export interface TestComment {
  _id: string;
  user: UserRef;
  text: string;
  createdAt: string;
}

export interface Test {
  _id: string;
  title: string;
  img?: string;
  description?: string;
  author: UserRef;
  question: Question[];
  users: string[];
  visibility: "public" | "group" | "private";
  likes: number;
  dislikes: number;
  passes: number;
  comments: TestComment[];
  myReaction?: "like" | "dislike" | null;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupTest {
  _id: string;
  group: string;
  test: {
    _id: string;
    title: string;
    question: Question[];
  };
  deadline: string | null;
  assignedBy: UserRef;
  results: {
    _id: string;
    user: UserRef;
    score: number;
    total: number;
    answers: { questionIndex: number; answer: string }[];
    completedAt: string;
  }[];
  createdAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  admin: UserRef;
  moderators: UserRef[];
  members: UserRef[];
  inviteCode: string;
  chatEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestStats {
  testId: string;
  title: string;
  totalPassed: number;
  totalQuestions: number;
  avgScore: number;
  bestScore: number;
  distribution: number[];
  questionStats: {
    question: string;
    percentage: number;
  }[];
}

export type Theme = "light" | "dark";

export interface AppSettings {
  theme: Theme;
  language: string;
  notifications: boolean;
}

export interface Notification {
  _id: string;
  from: UserRef;
  type: "test_assigned" | "comment" | "like" | "dislike";
  text: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ProfileStats {
  user: User;
  stats: {
    testsCreated: number;
    testsPassed: number;
    groupsCount: number;
  };
  publicTests: Test[];
}
