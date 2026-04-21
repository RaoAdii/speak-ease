export function LessonLayout({ children }) {
    return (<div className="flex h-full min-h-screen flex-col">
      <div className="flex h-full w-full flex-col">{children}</div>
    </div>);
}
