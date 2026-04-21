import Image from "next/image";
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
import { Items } from "@/shop/items";
export function ShopPage() {
    const navigate = useNavigate();
    const { data, loading, error, reload } = useAsyncData(api.getShopPage, []);
    useEffect(() => {
        if (!loading && data && (!data.userProgress || !data.userProgress.activeCourse)) {
            navigate("/courses");
        }
    }, [data, loading, navigate]);
    if (loading) {
        return <PageLoader />;
    }
    if (error || !data || !data.userProgress || !data.userProgress.activeCourse) {
        return <PageError message={error || "Failed to load shop."}/>;
    }
    return (<div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress activeCourse={data.userProgress.activeCourse} hearts={data.userProgress.hearts} points={data.userProgress.points}/>
        <Quests points={data.userProgress.points}/>
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image src="/shop.svg" alt="Shop" height={90} width={90}/>
          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Shop
          </h1>
          <p className="mb-6 text-center text-lg text-muted-foreground">
            Spend your points on cool stuff.
          </p>
          <Items hearts={data.userProgress.hearts} points={data.userProgress.points} onUpdated={reload}/>
        </div>
      </FeedWrapper>
    </div>);
}
