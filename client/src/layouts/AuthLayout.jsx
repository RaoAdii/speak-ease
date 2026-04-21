import { AuthHeader } from "@/pages/auth/AuthHeader";
export function AuthLayout({ children }) {
    return (<div className="flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex flex-1 flex-col items-center justify-center">
        {children}
      </main>
    </div>);
}
