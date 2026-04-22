import { CheckCircle, XCircle } from "lucide-react";
import { useKey, useMedia } from "react-use";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export const Footer = ({ onCheck, status, disabled, lessonId, labels = {}, }) => {
    const defaultLabels = {
        successMessage: "Nicely done!",
        errorMessage: "Try again.",
        practiceAgain: "Practice again",
        check: "Check",
        next: "Next",
        retry: "Retry",
        continue: "Continue",
    };
    const mergedLabels = {
        ...defaultLabels,
        ...labels,
    };
    useKey("Enter", onCheck, {}, [onCheck]);
    const isMobile = useMedia("(max-width: 1024px)");
    return (<footer className={cn("h-[100px] border-t-2 lg:h-[140px]", status === "correct" && "border-transparent bg-green-100", status === "wrong" && "border-transparent bg-rose-100")}>
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
        {status === "correct" && (<div className="flex items-center text-base font-bold text-green-500 lg:text-2xl">
            <CheckCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10"/>
            {mergedLabels.successMessage}
          </div>)}

        {status === "wrong" && (<div className="flex items-center text-base font-bold text-rose-500 lg:text-2xl">
            <XCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10"/>
            {mergedLabels.errorMessage}
          </div>)}

        {status === "completed" && lessonId && (<Button variant="default" size={isMobile ? "sm" : "lg"} onClick={() => (window.location.href = `/lesson/${lessonId}`)}>
            {mergedLabels.practiceAgain}
          </Button>)}

        <Button disabled={disabled} aria-disabled={disabled} className="ml-auto" onClick={onCheck} size={isMobile ? "sm" : "lg"} variant={status === "wrong" ? "danger" : "secondary"}>
          {status === "none" && mergedLabels.check}
          {status === "correct" && mergedLabels.next}
          {status === "wrong" && mergedLabels.retry}
          {status === "completed" && mergedLabels.continue}
        </Button>
      </div>
    </footer>);
};
