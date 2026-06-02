export interface User {
  id?: string;
  email?: string;
  username: string;
  avatar: string;
}

export interface Question {
  question: string;
  img?: string;
  answers: string[];
  correctAnswer: string;
}

export interface Test {
  _id: string;
  title: string;
  img?: string;
  description?: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  question: Question[];
  users: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  admin: {
    _id: string;
    username: string;
    avatar?: string;
  };
  moderators: { _id: string; username: string; avatar?: string }[];
  members: { _id: string; username: string; avatar?: string }[];
  inviteCode: string;
  chatEnabled: boolean;
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
  assignedBy: { _id: string; username: string };
  results: {
    user: { _id: string; username: string; avatar?: string };
    score: number;
    total: number;
    completedAt: string;
  }[];
  createdAt: string;
}

export type Theme = "light" | "dark";

export interface AppSettings {
  theme: Theme;
  language: string;
  notifications: boolean;
}
