import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FeedWrapper } from "@/components/feed-wrapper";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/lib/api";
import { Header } from "@/learn/header";
import { Unit } from "@/learn/unit";

export function LearnPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useAsyncData(api.getLearnPage, []);

  useEffect(() => {
    if (
      !loading &&
      data &&
      (!data.courseProgress || !data.userProgress || !data.userProgress.activeCourse)
    ) {
      navigate("/courses");
    }
  }, [data, loading, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !data || !data.userProgress || !data.userProgress.activeCourse) {
    return <PageError message={error || "Failed to load learning data."} />;
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={data.userProgress.activeCourse}
          hearts={data.userProgress.hearts}
          points={data.userProgress.points}
        />
        <Quests points={data.userProgress.points} />
      </StickyWrapper>

      <FeedWrapper>
        <Header title={data.userProgress.activeCourse.title} />
        {data.units.map((unit) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={data.courseProgress?.activeLesson}
              activeLessonPercentage={data.lessonPercentage}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
}
