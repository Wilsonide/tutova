"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  Inbox,
  Loader2,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";

type NotificationItem = {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

type NotificationListResponse = {
  items: NotificationItem[];
  unread_count: number;
  total: number;
  limit: number;
  offset: number;
};

const PAGE_SIZE = 20;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getNotificationHref(type: string, isAdmin: boolean) {
  if (type.startsWith("BOOKING_") || type.startsWith("SESSION_")) {
    return "/lessons";
  }

  if (type.startsWith("PROGRESS_")) {
    return isAdmin ? "/admin/progress" : "/progress";
  }

  if (type.startsWith("AGREEMENT_")) {
    return "/agreements";
  }

  if (
    type.includes("REQUEST") ||
    type === "TUTOR_ACCEPTED_REQUEST" ||
    type === "TUTOR_DECLINED_REQUEST"
  ) {
    return isAdmin && type === "ADMIN_NEW_TUTORING_REQUEST"
      ? "/admin/requests"
      : "/requests";
  }

  return "/dashboard";
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async (offset = 0, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");

    try {
      const response = await api<NotificationListResponse>(
        `/notifications?limit=${PAGE_SIZE}&offset=${offset}`,
      );

      setItems((current) =>
        append ? [...current, ...response.items] : response.items,
      );
      setUnreadCount(response.unread_count);
      setTotal(response.total);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Notifications could not be loaded.";
      setError(message);
      if (!append) setItems([]);
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  async function markAsRead(notification: NotificationItem) {
    if (notification.read_at) return;

    try {
      const result = await api<{ read_at: string }>(
        `/notifications/${notification.id}/read`,
        { method: "PATCH" },
      );

      setItems((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read_at: result.read_at }
            : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not mark notification as read.",
      );
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);

    try {
      await api("/notifications/read-all", { method: "PATCH" });
      const readAt = new Date().toISOString();
      setItems((current) =>
        current.map((item) => ({ ...item, read_at: item.read_at || readAt })),
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update notifications.",
      );
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <AppShell
      title="Notifications"
      description="Stay up to date with tutoring requests, bookings, lessons and account activity."
    >
      <div className="mx-auto w-full max-w-5xl space-y-5 pb-8">
        <Card className="border-slate-200/80 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#1769D2]">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#102A56]">
                  Your notification centre
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"} · {total} total
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || markingAll || loading}
              className="shrink-0"
            >
              {markingAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Mark all as read
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-3" aria-label="Loading notifications">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="animate-pulse border-slate-200/80">
                <CardContent className="flex gap-3 p-5">
                  <div className="h-10 w-10 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                    <div className="h-3 w-4/5 rounded bg-slate-100" />
                    <div className="h-2.5 w-1/4 rounded bg-slate-100" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error && items.length === 0 ? (
          <Card className="border-rose-200 bg-rose-50/50">
            <CardContent className="p-8 text-center">
              <p className="text-sm font-semibold text-rose-800">
                We couldn't load your notifications
              </p>
              <p className="mt-2 text-sm text-rose-700">{error}</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => void loadNotifications()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="border-dashed border-slate-300 shadow-none">
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <Inbox className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-base font-bold text-[#102A56]">
                You're all caught up
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                New tutoring requests, booking updates and important reminders will appear here.
              </p>
              <Link
                href="/dashboard"
                className="mt-5 inline-flex items-center text-sm font-semibold text-[#1769D2] hover:text-[#1258B5]"
              >
                Return to dashboard
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((notification) => (
              <Card
                key={notification.id}
                className={`border-slate-200/80 shadow-sm transition-colors ${
                  notification.read_at ? "bg-white" : "border-blue-200 bg-blue-50/30"
                }`}
              >
                <CardContent className="flex items-start gap-3 p-4 sm:p-5">
                  <div
                    className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      notification.read_at
                        ? "bg-slate-100 text-slate-500"
                        : "bg-blue-100 text-[#1769D2]"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold text-[#102A56]">
                        {notification.title}
                      </h2>
                      {!notification.read_at && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#1769D2]">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(notification.created_at)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Link
                        href={getNotificationHref(notification.notification_type, isAdmin)}
                        onClick={() => void markAsRead(notification)}
                        className="inline-flex items-center text-xs font-semibold text-[#1769D2] hover:text-[#1258B5]"
                      >
                        View update
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                      {!notification.read_at && (
                        <button
                          type="button"
                          onClick={() => void markAsRead(notification)}
                          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-[#102A56]"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {items.length < total && (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void loadNotifications(items.length, true)}
                  disabled={loadingMore}
                >
                  {loadingMore && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Load more notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
