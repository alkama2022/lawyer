import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Access denied — Lexfolio" },
      {
        name: "description",
        content: "You do not have permission to view this record on Lexfolio.",
      },
      { property: "og:title", content: "Access denied — Lexfolio" },
      {
        property: "og:description",
        content: "You do not have permission to view this record on Lexfolio.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Unauthorized,
});

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This record belongs to another counsel or practice group. If you believe you should have
          access, contact your firm administrator — every access attempt is logged.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Sign in as another user</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
