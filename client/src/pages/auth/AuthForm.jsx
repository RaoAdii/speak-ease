import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export function AuthForm({ mode, onSubmit }) {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await onSubmit(form);
        }
        catch (submitError) {
            setError(submitError instanceof Error
                ? submitError.message
                : "Something went wrong.");
        }
        finally {
            setSubmitting(false);
        }
    }
    return (<div className="flex w-full max-w-[988px] flex-1 flex-col items-center justify-center gap-8 p-4 lg:flex-row">
      <div className="relative hidden h-[424px] w-[424px] lg:block">
        <img src="/hero.svg" alt="Hero" className="h-full w-full"/>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-[420px] flex-col gap-4 rounded-2xl border-2 border-slate-200 bg-white p-8">
        <h1 className="text-3xl font-bold text-neutral-700">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h1>

        {mode === "sign-up" ? (<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="h-12 rounded-xl border-2 px-4 outline-none" placeholder="Name" required/>) : null}

        <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="h-12 rounded-xl border-2 px-4 outline-none" placeholder="Email" type="email" required/>

        <input value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="h-12 rounded-xl border-2 px-4 outline-none" placeholder="Password" type="password" required minLength={6}/>

        {error ? (<div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>) : null}

        <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={submitting}>
          {submitting
            ? "Please wait"
            : mode === "sign-in"
                ? "Login"
                : "Create account"}
        </Button>

        <p className="text-sm text-muted-foreground">
          {mode === "sign-in" ? (<>
              Need an account?{" "}
              <Link to="/sign-up" className="font-bold text-green-600">
                Sign up
              </Link>
            </>) : (<>
              Already have an account?{" "}
              <Link to="/sign-in" className="font-bold text-green-600">
                Sign in
              </Link>
            </>)}
        </p>
      </form>
    </div>);
}
