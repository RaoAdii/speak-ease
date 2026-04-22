import { useMemo } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { Quiz } from "@/lesson/quiz";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/lib/api";

export function QuizSessionPage() {
    const params = useParams();
    const [searchParams] = useSearchParams();
    const lessonId = params.lessonId ? Number(params.lessonId) : undefined;
    const quizType = searchParams.get("type") || undefined;
    const topic = searchParams.get("topic") || undefined;
    const questionCount = searchParams.get("n")
        ? Number(searchParams.get("n"))
        : undefined;
    const selectedCourseId = searchParams.get("courseId")
        ? Number(searchParams.get("courseId"))
        : undefined;
    const loader = useMemo(() => {
        if (!lessonId) {
            return null;
        }

        return () =>
            api.getQuizSession(lessonId, {
                type: quizType,
                courseId: selectedCourseId,
                topic,
                n: questionCount,
            });
    }, [lessonId, quizType, selectedCourseId, topic, questionCount]);

    const { data, loading, error } = useAsyncData(loader || (() => Promise.resolve(null)), [lessonId, quizType, selectedCourseId, topic, questionCount]);

    if (!lessonId) {
        return <Navigate to="/quiz" replace />;
    }

    if (loading) {
        return <PageLoader />;
    }

    if (error || !data) {
        return <PageError message={error || "Failed to load quiz."} />;
    }

    if (!data.lesson || !data.userProgress) {
        return <Navigate to="/quiz" replace />;
    }

    const initialPercentage = (data.lesson.challenges.filter((challenge) => challenge.completed).length /
        data.lesson.challenges.length) *
        100;

    return (
        <Quiz
            initialLessonId={undefined}
            initialLessonChallenges={data.lesson.challenges}
            initialHearts={data.userProgress.hearts}
            initialPercentage={initialPercentage}
            completedRedirectPath="/quiz"
            completionMessage="Quiz session complete. Progress has been recorded."
        />
    );
}
