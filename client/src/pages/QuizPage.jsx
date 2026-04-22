import { useState, useTransition } from "react";
import Image from "next/image";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { cn } from "@/lib/utils";
import { useAsyncData } from "@/hooks/useAsyncData";
import { api } from "@/lib/api";

export function QuizPage() {
    const navigate = useNavigate();
    const [pending, startTransition] = useTransition();
    const { data, loading, error } = useAsyncData(api.getQuizPage, []);
    const [selectedLanguageId, setSelectedLanguageId] = useState();

    if (loading) {
        return <PageLoader />;
    }

    if (error || !data) {
        return <PageError message={error || "Failed to load quiz section."} />;
    }

    if (!data.userProgress) {
        return <Navigate to="/learn" replace />;
    }

    const languages = data.quizOverview?.languages || [];

    const selectedCourseId = selectedLanguageId || data.quizOverview?.activeCourseId || languages[0]?.courseId;
    const selectedLanguage =
        languages.find((course) => course.courseId === selectedCourseId) || null;

    const startQuiz = (courseId, quizType) => {
        if (!quizType?.lessonId || pending) {
            return;
        }

        startTransition(() => {
            api
                .selectCourse(courseId)
                .then(() => {
                const params = new URLSearchParams({
                    type: quizType.key,
                    courseId: String(courseId),
                });
                if (quizType.topic) {
                    params.set("topic", quizType.topic);
                }
                if (quizType.questionCount) {
                    params.set("n", String(quizType.questionCount));
                }
                navigate(`/quiz/${quizType.lessonId}?${params.toString()}`);
            })
                .catch(() => toast.error("Unable to launch quiz session."));
        });
    };

    return (
        <div className="mx-auto flex h-full max-w-[912px] flex-col px-3 pb-8">
            <div className="mb-6 rounded-2xl border-2 bg-slate-50 p-5">
                <h1 className="text-2xl font-bold text-neutral-700">Quiz</h1>
            </div>

            {languages.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed p-6 text-center">
                    <p className="text-sm text-neutral-500">
                        No language catalog was found. Please open courses and initialize language data.
                    </p>
                    <div className="mt-4">
                        <Button variant="primary" onClick={() => navigate("/courses")}>
                            Go To Courses
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {languages.map((language) => (
                            <button
                                key={language.courseId}
                                type="button"
                                onClick={() => setSelectedLanguageId(language.courseId)}
                                className={cn("flex items-center gap-3 rounded-xl border-2 bg-white p-4 text-left transition hover:bg-slate-50", selectedCourseId === language.courseId &&
                                    "border-sky-300 bg-sky-50")}
                            >
                                <Image src={language.imageSrc} alt={language.title} width={42} height={30} className="rounded border" />
                                <div>
                                    <p className="text-sm font-semibold text-neutral-700">{language.title}</p>
                                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                                        {language.code}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedLanguage ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {selectedLanguage.quizTypes.map((quizType) => (
                                <div key={quizType.key} className="rounded-2xl border-2 bg-white p-5">
                                    <h2 className="text-lg font-bold text-neutral-700">{quizType.title}</h2>
                                    <p className="mt-2 text-sm text-neutral-500">{quizType.description}</p>
                                    {quizType.questionCount ? (
                                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                            {quizType.questionCount} Questions
                                        </p>
                                    ) : null}
                                    <Button
                                        className="mt-4"
                                        variant="secondary"
                                        disabled={pending}
                                        onClick={() => startQuiz(selectedLanguage.courseId, quizType)}
                                    >
                                        {selectedLanguage.launchLabel || "Start"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}
