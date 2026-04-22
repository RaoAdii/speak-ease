"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useAudio, useWindowSize, useMount } from "react-use";
import { toast } from "sonner";
import { MAX_HEARTS } from "@/constants";
import { api } from "@/lib/api";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { usePracticeModal } from "@/store/use-practice-modal";
import { Challenge } from "./challenge";
import { Footer } from "./footer";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import { ResultCard } from "./result-card";

function normalizeAnswer(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}
export const Quiz = ({
    initialPercentage,
    initialHearts,
    initialLessonId,
    initialLessonChallenges,
    completedRedirectPath = "/learn",
    labels = {},
    completionMessage = "Session complete. Progress has been recorded.",
}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [incorrectAudio, _i, incorrectControls] = useAudio({
        src: "/incorrect.wav",
    });
    const [finishAudio] = useAudio({
        src: "/finish.mp3",
        autoPlay: true,
    });
    const { width, height } = useWindowSize();
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const { open: openHeartsModal } = useHeartsModal();
    const { open: openPracticeModal } = usePracticeModal();
    useMount(() => {
        if (initialPercentage === 100)
            openPracticeModal();
    });
    const [lessonId] = useState(initialLessonId);
    const [hearts, setHearts] = useState(initialHearts);
    const [percentage, setPercentage] = useState(() => {
        return initialPercentage === 100 ? 0 : initialPercentage;
    });
    const [challenges] = useState(initialLessonChallenges);
    const [activeIndex, setActiveIndex] = useState(() => {
        const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed);
        return uncompletedIndex === -1 ? 0 : uncompletedIndex;
    });
    const [selectedOption, setSelectedOption] = useState();
    const [shortAnswer, setShortAnswer] = useState("");
    const [status, setStatus] = useState("none");
    const challenge = challenges[activeIndex];
    const questionFormat = challenge?.questionFormat || "MCQ";
    const isShortAnswerQuestion = questionFormat === "SHORT_ANSWER";
    const options = challenge?.challengeOptions ?? [];
    const onNext = () => {
        setActiveIndex((current) => current + 1);
    };
    const onSelect = (id) => {
        if (isShortAnswerQuestion)
            return;
        if (status !== "none")
            return;
        setSelectedOption(id);
    };
    const onContinue = () => {
        if (isShortAnswerQuestion) {
            if (!shortAnswer.trim())
                return;
        }
        else if (!selectedOption) {
            return;
        }
        if (status === "wrong") {
            setStatus("none");
            setSelectedOption(undefined);
            if (isShortAnswerQuestion) {
                setShortAnswer("");
            }
            return;
        }
        if (status === "correct") {
            onNext();
            setStatus("none");
            setSelectedOption(undefined);
            setShortAnswer("");
            return;
        }
        const correctOption = options.find((option) => option.correct);
        const expectedAnswer = challenge?.expectedAnswer || "";
        const providedAnswer = shortAnswer;
        const isShortAnswerCorrect =
            normalizeAnswer(expectedAnswer) === normalizeAnswer(providedAnswer);
        const isMcqCorrect = Boolean(correctOption && correctOption.id === selectedOption);
        const isCorrect = isShortAnswerQuestion ? isShortAnswerCorrect : isMcqCorrect;
        if (!isShortAnswerQuestion && !correctOption)
            return;
        if (isCorrect) {
            startTransition(() => {
                api
                    .completeChallenge(challenge.id)
                    .then((response) => {
                    if (response?.error === "hearts") {
                        openHeartsModal();
                        return;
                    }
                    void correctControls.play();
                    setStatus("correct");
                    setPercentage((prev) => prev + 100 / challenges.length);
                    // This is a practice
                    if (initialPercentage === 100) {
                        setHearts((prev) => Math.min(prev + 1, MAX_HEARTS));
                    }
                })
                    .catch(() => toast.error("Something went wrong. Please try again."));
            });
        }
        else {
            startTransition(() => {
                api
                    .failChallenge(challenge.id)
                    .then((response) => {
                    if (response?.error === "hearts") {
                        openHeartsModal();
                        return;
                    }
                    void incorrectControls.play();
                    setStatus("wrong");
                    if (!response?.error)
                        setHearts((prev) => Math.max(prev - 1, 0));
                })
                    .catch(() => toast.error("Something went wrong. Please try again."));
            });
        }
    };
    if (!challenge) {
        return (<>
        {finishAudio}
        <Confetti recycle={false} numberOfPieces={500} tweenDuration={10000} width={width} height={height}/>
        <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
          <Image src="/finish.svg" alt="Finish" className="hidden lg:block" height={100} width={100}/>

          <Image src="/finish.svg" alt="Finish" className="block lg:hidden" height={100} width={100}/>

                    <h1 className="text-lg font-bold text-neutral-700 lg:text-3xl">
                        {completionMessage}
                    </h1>

          <div className="flex w-full items-center gap-x-4">
            <ResultCard variant="points" value={challenges.length * 10}/>
            <ResultCard variant="hearts" value={hearts}/>
          </div>
        </div>

                <Footer lessonId={lessonId} status="completed" labels={labels} onCheck={() => router.push(completedRedirectPath)}/>
      </>);
    }
        const title = challenge.question;
    return (<>
      {incorrectAudio}
      {correctAudio}
      <Header hearts={hearts} percentage={percentage}/>

        <div className="flex-1">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
              {title}
            </h1>

            <div>
              {challenge.type === "ASSIST" && !isShortAnswerQuestion && (<QuestionBubble question={challenge.question}/>)}

                            {isShortAnswerQuestion ? (<div className="rounded-xl border-2 p-4 lg:p-6">
                                <input type="text" value={shortAnswer} onChange={(event) => setShortAnswer(event.target.value)} placeholder="Type your answer here" disabled={pending} className="h-12 w-full rounded-xl border-2 px-4 text-base outline-none focus:border-sky-300"/>
                            </div>) : (<Challenge options={options} onSelect={onSelect} status={status} selectedOption={selectedOption} disabled={pending} type={challenge.type}/>)}
            </div>
          </div>
        </div>
      </div>

            <Footer disabled={pending ||
            (isShortAnswerQuestion ? !shortAnswer.trim() : !selectedOption)} status={status} labels={labels} onCheck={onContinue}/>
    </>);
};
