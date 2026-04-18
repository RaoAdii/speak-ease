import type {
  Challenge,
  ChallengeOption,
  Course,
  Lesson,
  Unit,
  UserProgress
} from "@/db/schema";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  imageSrc: string;
  role: "user" | "admin";
  activeCourseId: number | null;
  hearts: number;
  points: number;
};

export type UnitWithLessons = Unit & {
  lessons: (Lesson & { completed: boolean })[];
};

export type LessonWithChallenges = Lesson & {
  challenges: (Challenge & {
    completed: boolean;
    challengeOptions: ChallengeOption[];
  })[];
};

export type LearnPageResponse = {
  userProgress: UserProgress | null;
  courseProgress: {
    activeLesson?: (Lesson & { unit: Unit }) | undefined;
    activeLessonId?: number;
  } | null;
  lessonPercentage: number;
  units: UnitWithLessons[];
};

export type CoursesPageResponse = {
  courses: Course[];
  activeCourseId: number | null;
};

export type LessonPageResponse = {
  lesson: LessonWithChallenges | null;
  userProgress: UserProgress | null;
};

export type LeaderboardResponse = {
  userProgress: UserProgress | null;
  leaderboard: {
    userId: string;
    userName: string;
    userImageSrc: string;
    points: number;
  }[];
};

export type SimpleProgressResponse = {
  userProgress: UserProgress | null;
};
