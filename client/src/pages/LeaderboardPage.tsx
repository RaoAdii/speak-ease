import Image from "next/image";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Quests } from "@/components/quests";
import { Separator } from "@/components/ui/separator";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/lib/api";

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useAsyncData(api.getLeaderboardPage, []);

  useEffect(() => {
    if (!loading && data && (!data.userProgress || !data.userProgress.activeCourse)) {
      navigate("/courses");
    }
  }, [data, loading, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !data || !data.userProgress || !data.userProgress.activeCourse) {
    return <PageError message={error || "Failed to load leaderboard."} />;
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
        <div className="flex w-full flex-col items-center">
          <Image src="/leaderboard.svg" alt="Leaderboard" height={90} width={90} />
          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Leaderboard
          </h1>
          <p className="mb-6 text-center text-lg text-muted-foreground">
            See where you stand among other learners in the community.
          </p>
          <Separator className="mb-4 h-0.5 rounded-full" />
          {data.leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className="flex w-full items-center rounded-xl p-2 px-4 hover:bg-gray-200/50"
            >
              <p className="mr-4 font-bold text-lime-700">{index + 1}</p>
              <Avatar className="ml-3 mr-6 h-12 w-12 border bg-green-500">
                <AvatarImage src={entry.userImageSrc} className="object-cover" />
              </Avatar>
              <p className="flex-1 font-bold text-neutral-800">{entry.userName}</p>
              <p className="text-muted-foreground">{entry.points} XP</p>
            </div>
          ))}
        </div>
      </FeedWrapper>
    </div>
  );
}
