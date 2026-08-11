import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DEMO_CREDENTIALS, useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Lexfolio Legal Case Management" },
      {
        name: "description",
        content:
          "Secure sign-in for counsel to access cases, hearings, client records and case outcomes on Lexfolio.",
      },
      { property: "og:title", content: "Sign in — Lexfolio Legal Case Management" },
      {
        property: "og:description",
        content: "Secure counsel sign-in to the Lexfolio legal case management workspace.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") navigate({ to: "/dashboard", replace: true });
  }, [status, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      await signIn(email, password);
      toast.success("Signed in", { description: "Welcome back to chambers." });
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Scale className="size-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-sidebar-accent-foreground">
              Lexfolio
            </p>
            <p className="text-xs tracking-wide text-sidebar-foreground/60">
              Legal Case Management
            </p>
          </div>
        </div>

        <div className="max-w-lg">
          <h1 className="font-display text-4xl leading-tight text-sidebar-accent-foreground">
            The complete record of your practice, in one privileged workspace.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-sidebar-foreground/70">
            Cases, hearings, clients, court documents and career outcomes — organised for counsel
            who need answers before they reach the courtroom.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-sidebar-border pt-8">
            {[
              ["54", "Matters tracked"],
              ["72%", "Success rate"],
              ["9", "Courts"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl text-sidebar-primary">{v}</dt>
                <dd className="mt-1 text-xs text-sidebar-foreground/60">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="flex items-center gap-2 text-xs text-sidebar-foreground/55">
          <ShieldCheck className="size-4" /> Privileged and confidential. Access is logged.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Scale className="size-5" />
            </div>
            <p className="font-display text-lg font-semibold">Lexfolio</p>
          </div>

          <p className="text-eyebrow">Counsel portal</p>
          <h2 className="mt-1 text-2xl font-semibold">Sign in to your chambers</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your firm credentials. Sessions expire automatically after 45 minutes of
            inactivity.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@firm.law"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked /> Keep me signed in on this device
            </label>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              Sign in securely
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-border bg-secondary/60 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Demonstration credentials</p>
            <p className="mt-1">{DEMO_CREDENTIALS.email}</p>
            <p>{DEMO_CREDENTIALS.password}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
