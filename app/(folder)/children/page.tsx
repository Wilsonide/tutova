"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ChildLearner = {
  id: string;
  parent_profile_id: string | null;
  user_id: string | null;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
};

type LearnerForm = {
  first_name: string;
  last_name: string;
};

const EMPTY_FORM: LearnerForm = {
  first_name: "",
  last_name: "",
};

export default function ChildrenPage() {
  const [children, setChildren] = useState<ChildLearner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<LearnerForm>(EMPTY_FORM);
  const [editingChild, setEditingChild] = useState<ChildLearner | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const loadChildren = useCallback(async () => {
    setLoading(true);

    try {
      const result = await api<ChildLearner[]>("/parents/learners");
      setChildren(result);
    } catch {
      toast.error("Unable to load your learner profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  function openAddForm() {
    setEditingChild(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEditForm(child: ChildLearner) {
    setEditingChild(child);
    setForm({
      first_name: child.first_name,
      last_name: child.last_name,
    });
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingChild(null);
    setForm(EMPTY_FORM);
  }

  function updateField(field: keyof LearnerForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();

    if (!firstName || !lastName) {
      toast.error("Please enter the child's first and last name.");
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
    };

    setSaving(true);

    try {
      if (editingChild) {
        const updated = await api<ChildLearner>(
          `/parents/learners/${editingChild.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );

        setChildren((current) =>
          current.map((child) =>
            child.id === editingChild.id ? updated : child,
          ),
        );

        toast.success("Learner profile updated.");
      } else {
        const created = await api<ChildLearner>("/parents/learners", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setChildren((current) => [...current, created]);

        toast.success("Learner profile created.");
      }

      setFormOpen(false);
      setEditingChild(null);
      setForm(EMPTY_FORM);
    } catch {
      toast.error(
        editingChild
          ? "Unable to update this learner profile."
          : "Unable to add this learner.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(child: ChildLearner) {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${child.first_name} ${child.last_name} from your learner profiles?`,
    );

    if (!confirmed) return;

    setDeletingId(child.id);

    try {
      await api<void>(`/parents/learners/${child.id}`, {
        method: "DELETE",
      });

      setChildren((current) => current.filter((item) => item.id !== child.id));

      toast.success("Learner profile removed.");
    } catch {
      toast.error("Unable to remove this learner profile.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell
      title="My Children"
      description="Manage the learner profiles linked to your parent account."
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 pb-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#1769D2]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        {/* Page introduction */}
        <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#102A56] px-6 py-7 text-white shadow-sm sm:flex-row sm:items-center sm:px-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
              <Users className="h-3.5 w-3.5" />
              Parent workspace
            </div>

            <h2 className="text-2xl font-bold tracking-tight">
              Manage your learner profiles
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/85">
              Add and maintain the profiles of the children whose learning
              activities you manage through Tutova.
            </p>
          </div>

          <Button
            onClick={openAddForm}
            className="h-11 shrink-0 bg-white px-5 font-semibold text-[#102A56] hover:bg-blue-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add a child
          </Button>
        </section>

        {/* Add / edit form */}
        {formOpen && (
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-[#102A56]">
                  {editingChild ? "Edit learner profile" : "Add a learner"}
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the child's name to create their learner profile.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="first_name"
                      className="text-sm font-medium text-slate-700"
                    >
                      First name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      minLength={1}
                      maxLength={100}
                      value={form.first_name}
                      onChange={(event) =>
                        updateField("first_name", event.target.value)
                      }
                      placeholder="Enter first name"
                      disabled={saving}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1769D2] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="last_name"
                      className="text-sm font-medium text-slate-700"
                    >
                      Last name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      minLength={1}
                      maxLength={100}
                      value={form.last_name}
                      onChange={(event) =>
                        updateField("last_name", event.target.value)
                      }
                      placeholder="Enter last name"
                      disabled={saving}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1769D2] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#1769D2] hover:bg-[#1258B5]"
                  >
                    {saving
                      ? "Saving..."
                      : editingChild
                        ? "Save changes"
                        : "Add learner"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Learner profiles */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-bold text-[#102A56]">
                Registered learners
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {children.length}{" "}
                {children.length === 1 ? "learner profile" : "learner profiles"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2]">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center justify-between gap-4 rounded-xl border border-slate-100 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-slate-100" />
                      <div className="space-y-2">
                        <div className="h-3 w-32 rounded bg-slate-100" />
                        <div className="h-2.5 w-20 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="h-8 w-20 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : children.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex flex-col justify-between gap-4 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#1769D2]">
                        {child.first_name.charAt(0).toUpperCase()}
                        {child.last_name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {child.first_name} {child.last_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Learner profile
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(child)}
                        disabled={saving || deletingId !== null}
                        className="flex-1 border-slate-200 sm:flex-none"
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(child)}
                        disabled={saving || deletingId !== null}
                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:flex-none"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        {deletingId === child.id ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1769D2]">
                  <Users className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-800">
                  No learner profiles yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Add your first child to begin managing their learning and
                  tutoring activities through Tutova.
                </p>

                <Button
                  onClick={openAddForm}
                  className="mt-5 bg-[#1769D2] hover:bg-[#1258B5]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first child
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#1769D2]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#102A56]">
                About learner profiles
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                These profiles help you organise tutoring for each child. You
                can add more than one learner and update their names when
                necessary.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1769D2] hover:text-[#1258B5]"
          >
            Return to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
