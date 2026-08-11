import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchApi, type SearchResult } from "@/lib/api";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const { data } = useQuery({
    queryKey: ["search", term],
    queryFn: () => searchApi.query(term),
    enabled: term.trim().length > 1,
  });

  const results = data ?? [];
  const groups = ["Cases", "Clients", "Hearings", "Documents", "Courts"] as const;

  const go = (r: SearchResult) => {
    onOpenChange(false);
    setTerm("");
    navigate({ to: r.to, params: (r.params ?? {}) as never });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search cases, case numbers, clients, courts, documents…"
        value={term}
        onValueChange={setTerm}
      />
      <CommandList>
        {term.trim().length < 2 ? (
          <CommandGroup heading="Suggestions">
            {["FHC/", "Meridian", "Court of Appeal", "Judgment", "Trademark"].map((s) => (
              <CommandItem key={s} onSelect={() => setTerm(s)}>
                {s}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : results.length === 0 ? (
          <CommandEmpty>No matching records.</CommandEmpty>
        ) : (
          groups.map((g) => {
            const items = results.filter((r) => r.group === g);
            if (items.length === 0) return null;
            return (
              <CommandGroup key={g} heading={g}>
                {items.map((r) => (
                  <CommandItem
                    key={`${g}-${r.id}`}
                    value={`${g} ${r.label} ${r.sub}`}
                    onSelect={() => go(r)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{r.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })
        )}
      </CommandList>
    </CommandDialog>
  );
}
