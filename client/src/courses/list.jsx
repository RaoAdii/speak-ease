"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card } from "./card";
export const List = ({ courses, activeCourseId, onChanged }) => {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const onClick = (id) => {
        if (pending)
            return;
        if (id === activeCourseId)
            return router.push("/learn");
        startTransition(() => {
            api
                .selectCourse(id)
                .then(() => {
                onChanged?.();
                router.push("/learn");
            })
                .catch(() => toast.error("Something went wrong."));
        });
    };
    return (<div className="grid grid-cols-2 gap-4 pt-6 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
      {courses.map((course) => (<Card key={course.id} id={course.id} title={course.title} imageSrc={course.imageSrc} onClick={onClick} disabled={pending} isActive={course.id === activeCourseId}/>))}
    </div>);
};
