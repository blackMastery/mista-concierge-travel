"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { btnGhost, btnDanger } from "@/components/admin/ui";
import {
  updateBookingStatus,
  setMessageStatus,
  deleteMessage,
  deleteSubscriber,
  setReviewPublished,
  setTourPublished,
  deleteReview,
} from "@/app/admin/actions";

const selectCls =
  "rounded-lg border border-ink/15 bg-white px-3 py-2 font-sans text-[13px] font-medium text-ink outline-none focus:border-green";

export function BookingStatusSelect({
  id,
  status,
}: {
  id: string;
  status: "pending" | "confirmed" | "cancelled";
}) {
  const router = useRouter();
  const [val, setVal] = useState(status);
  const [pending, start] = useTransition();

  return (
    <select
      className={selectCls}
      value={val}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as typeof val;
        setVal(next);
        start(async () => {
          await updateBookingStatus(id, next);
          router.refresh();
        });
      }}
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}

export function TourStatusSelect({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [val, setVal] = useState(isPublished ? "published" : "draft");
  const [pending, start] = useTransition();

  return (
    <select
      className={selectCls}
      value={val}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as "draft" | "published";
        setVal(next);
        start(async () => {
          await setTourPublished(id, next === "published");
          router.refresh();
        });
      }}
    >
      <option value="draft">Draft</option>
      <option value="published">Published</option>
    </select>
  );
}

export function MessageActions({
  id,
  status,
}: {
  id: string;
  status: "new" | "read" | "archived";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(fn: () => Promise<unknown>, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "read" && (
        <button className={btnGhost} disabled={pending} onClick={() => act(() => setMessageStatus(id, "read"))}>
          Mark read
        </button>
      )}
      {status !== "archived" && (
        <button className={btnGhost} disabled={pending} onClick={() => act(() => setMessageStatus(id, "archived"))}>
          Archive
        </button>
      )}
      <button className={btnDanger} disabled={pending} onClick={() => act(() => deleteMessage(id), "Delete this message?")}>
        Delete
      </button>
    </div>
  );
}

export function SubscriberDelete({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className={btnDanger}
      disabled={pending}
      onClick={() => {
        if (!confirm("Remove this subscriber?")) return;
        start(async () => {
          await deleteSubscriber(id);
          router.refresh();
        });
      }}
    >
      Remove
    </button>
  );
}

export function ExportSubscribersButton({
  rows,
}: {
  rows: { email: string; created_at: string }[];
}) {
  function exportCsv() {
    const header = "email,subscribed_at\n";
    const body = rows
      .map((r) => `${r.email},${new Date(r.created_at).toISOString()}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button className={btnGhost} onClick={exportCsv} disabled={!rows.length}>
      Export CSV
    </button>
  );
}

export function ReviewControls({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(fn: () => Promise<unknown>, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button className={btnGhost} disabled={pending} onClick={() => act(() => setReviewPublished(id, !isPublished))}>
        {isPublished ? "Unpublish" : "Publish"}
      </button>
      <button className={btnDanger} disabled={pending} onClick={() => act(() => deleteReview(id), "Delete this review?")}>
        Delete
      </button>
    </div>
  );
}
