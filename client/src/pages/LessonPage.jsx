import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Quiz } from "@/lesson/quiz";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/lib/api";
export function LessonPage() {
    const params = useParams();
    const lessonId = params.lessonId ? Number(params.lessonId) : undefined;
    const loader = useMemo(() => () => api.getLessonPage(lessonId), [lessonId]);
    const { data, loading, error } = useAsyncData(loader, [lessonId]);
    if (loading) {
        return <PageLoader />;
    }
    if (error || !data) {
        return <PageError message={error || "Failed to load lesson."}/>;
    }
    if (!data.lesson || !data.userProgress) {
        return <Navigate to="/learn" replace/>;
    }
    const initialPercentage = (data.lesson.challenges.filter((challenge) => challenge.completed).length /
        data.lesson.challenges.length) *
        100;
    return (<Quiz initialLessonId={data.lesson.id} initialLessonChallenges={data.lesson.challenges} initialHearts={data.userProgress.hearts} initialPercentage={initialPercentage}/>);
}
