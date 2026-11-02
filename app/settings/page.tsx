"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/providers";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => setName(user?.display_name || ""), [user]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ display_name: name }),
      });
      await refreshUser();
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update profile");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell
      title="Profile settings"
      description="Update the profile details associated with your Tutova account."
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <Field label="Display name" htmlFor="name">
                <Input
                  id="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Email address" htmlFor="email">
                <Input id="email" value={user?.email || ""} readOnly disabled />
                <p className="mt-1 text-xs text-slate-500">
                  Email changes are not supported by the current backend
                  endpoint.
                </p>
              </Field>
              <Field label="Account role" htmlFor="role">
                <Input id="role" value={user?.role || ""} readOnly disabled />
              </Field>
              <Button disabled={busy}>
                {busy ? "Saving…" : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
