import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader, SectionCard } from "@/components/common/page";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Lexfolio" },
      {
        name: "description",
        content: "Manage your profile, password, notification preferences and session security.",
      },
      { property: "og:title", content: "Settings — Lexfolio" },
      {
        property: "og:description",
        content: "Profile, password, notification preferences and session security.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, changePassword, signOut, extendSession } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOut, setConfirmOut] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Settings" }]}
        eyebrow="Account"
        title="Settings"
        description="Profile, security and notification preferences for your counsel account."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Profile" bodyClassName="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input defaultValue={user?.name ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Professional title</Label>
            <Input defaultValue={user?.title ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue={user?.email ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input defaultValue={user?.phone ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Button size="sm" onClick={() => toast.success("Profile saved")}>
              Save profile
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Change password" description="Passwords must be at least 10 characters">
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setBusy(true);
              try {
                await changePassword(current, next);
                toast.success("Password updated");
                setCurrent("");
                setNext("");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Unable to change password.");
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
              <Label htmlFor="cur">Current password</Label>
              <Input
                id="cur"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
            </div>
            <Button disabled={busy} size="sm">
              {busy && <Loader2 className="size-4 animate-spin" />} Update password
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Notification preferences" bodyClassName="space-y-4">
          {[
            "Upcoming hearing reminders",
            "New case assignments",
            "Case status changes",
            "New documents filed",
            "Deadline warnings",
          ].map((label) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-sm">{label}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Session & security" bodyClassName="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sessions expire automatically after 45 minutes. Case material is privileged — always
            sign out on shared devices.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                extendSession();
                toast.success("Session extended");
              }}
            >
              Extend session
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirmOut(true)}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </SectionCard>
      </div>

      <ConfirmDialog
        open={confirmOut}
        onOpenChange={setConfirmOut}
        title="Sign out of Lexfolio?"
        description="You will need to sign in again to access privileged case material."
        confirmLabel="Sign out"
        onConfirm={() => {
          signOut();
          navigate({ to: "/", replace: true });
        }}
      />
    </div>
  );
}
