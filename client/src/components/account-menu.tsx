import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AccountMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-3">
        <img
          src={user.imageSrc}
          alt={user.name}
          className="h-10 w-10 rounded-full border bg-green-500 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-neutral-700">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
