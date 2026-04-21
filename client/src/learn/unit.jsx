import { LessonButton } from "./lesson-button";
import { UnitBanner } from "./unit-banner";
export const Unit = ({ title, description, lessons, activeLesson, activeLessonPercentage, }) => {
    return (<>
      <UnitBanner title={title} description={description}/>

      <div className="relative flex flex-col items-center">
        {lessons.map((lesson, i) => {
            const isCurrent = lesson.id === activeLesson?.id;
            const isLocked = !lesson.completed && !isCurrent;
            return (<LessonButton key={lesson.id} id={lesson.id} index={i} totalCount={lessons.length - 1} current={isCurrent} locked={isLocked} percentage={activeLessonPercentage}/>);
        })}
      </div>
    </>);
};
