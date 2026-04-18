import Image from "next/image";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FeedWrapper } from "@/components/feed-wrapper";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Progress } from "@/components/ui/progress";
import { UserProgress } from "@/components/user-progress";
import { QUESTS } from "@/constants";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/lib/api";

export function QuestsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useAsyncData(api.getQuestsPage, []);

  useEffect(() => {
    if (!loading && data && (!data.userProgress || !data.userProgress.activeCourse)) {
      navigate("/courses");
    }
  }, [data, loading, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !data || !data.userProgress || !data.userProgress.activeCourse) {
    return <PageError message={error || "Failed to load quests."} />;
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={data.userProgress.activeCourse}
          hearts={data.userProgress.hearts}
          points={data.userProgress.points}
        />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image src="/quests.svg" alt="Quests" height={90} width={90} />
          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Quests
          </h1>
          <p className="mb-6 text-center text-lg text-muted-foreground">
            Complete quests by earning points.
          </p>

          <ul className="w-full">
            {QUESTS.map((quest) => {
              const progress = (data.userProgress!.points / quest.value) * 100;

              return (
                <div
                  className="flex w-full items-center gap-x-4 border-t-2 p-4"
                  key={quest.title}
                >
                  <Image src="/points.svg" alt="Points" width={60} height={60} />
                  <div className="flex w-full flex-col gap-y-2">
                    <p className="text-xl font-bold text-neutral-700">
                      {quest.title}
                    </p>
                    <Progress value={progress} className="h-3" />
                  </div>
                </div>
              );
            })}
          </ul>
        </div>
      </FeedWrapper>
    </div>
  );
}
