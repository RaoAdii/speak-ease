import type { PropsWithChildren } from "react";

export function LessonLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <div className="flex h-full w-full flex-col">{children}</div>
    </div>
  );
}
