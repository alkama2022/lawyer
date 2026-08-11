import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Lexfolio" },
      {
        name: "description",
        content: "Request a secure password reset link for your Lexfolio counsel account.",
      },
      { property: "og:title", content: "Reset your password — Lexfolio" },
      {
        property: "og:description",
        content: "Request a secure password reset link for your Lexfolio counsel account.",
      },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { requestReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
        {sent ? (
          <div className="surface-card p-6 text-center">
            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-success/12 text-success">
              <MailCheck className="size-5" />
            </div>
            <h1 className="text-lg font-semibold">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              If <span className="text-foreground">{email}</span> matches a counsel account, a
              reset link valid for 30 minutes has been sent.
            </p>
            <Button asChild variant="secondary" className="mt-5 w-full">
              <Link to="/reset-password" search={{ token: "demo-token" }}>
                Open reset form
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="text-eyebrow">Account recovery</p>
            <h1 className="mt-1 text-2xl font-semibold">Forgot your password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the email registered with your firm and we will send a secure reset link.
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError(null);
                try {
                  await requestReset(email);
                  setSent(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Something went wrong.");
                } finally {
                  setBusy(false);
                }
              }}
            >
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@firm.law"
                />
              </div>
              <Button className="w-full" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />} Send reset link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
