import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAsyncData } from "@/hooks/useAsyncData";
import { List } from "@/courses/list";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
export function CoursesPage() {
    const navigate = useNavigate();
    const { data, loading, error, reload } = useAsyncData(api.getCoursesPage, []);
    useEffect(() => {
        if (!loading && !error && !data) {
            navigate("/");
        }
    }, [data, error, loading, navigate]);
    if (loading) {
        return <PageLoader />;
    }
    if (error || !data) {
        return <PageError message={error || "Failed to load courses."}/>;
    }
    return (<div className="mx-auto h-full max-w-[912px] px-3">
      <h1 className="text-2xl font-bold text-neutral-700">Language Courses</h1>
      <List courses={data.courses} activeCourseId={data.activeCourseId || undefined} onChanged={reload}/>
    </div>);
}
