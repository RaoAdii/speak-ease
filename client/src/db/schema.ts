export type ChallengeType = "SELECT" | "ASSIST";

export type Course = {
  id: number;
  title: string;
  imageSrc: string;
};

export type Unit = {
  id: number;
  title: string;
  description: string;
  courseId: number;
  order: number;
};

export type Lesson = {
  id: number;
  title: string;
  unitId: number;
  order: number;
};

export type Challenge = {
  id: number;
  lessonId: number;
  type: ChallengeType;
  question: string;
  order: number;
};

export type ChallengeOption = {
  id: number;
  challengeId: number;
  text: string;
  correct: boolean;
  imageSrc?: string | null;
  audioSrc?: string | null;
};

export type ChallengeProgress = {
  id?: string;
  userId: string;
  challengeId: number;
  completed: boolean;
};

export type UserProgress = {
  userId: string;
  userName: string;
  userImageSrc: string;
  activeCourseId: number | null;
  activeCourse: Course | null;
  hearts: number;
  points: number;
};

export const courses = { $inferSelect: {} as Course };
export const units = { $inferSelect: {} as Unit };
export const lessons = { $inferSelect: {} as Lesson };
export const challenges = { $inferSelect: {} as Challenge };
export const challengeOptions = { $inferSelect: {} as ChallengeOption };
export const challengeProgress = { $inferSelect: {} as ChallengeProgress };
export const userProgress = { $inferSelect: {} as UserProgress };
