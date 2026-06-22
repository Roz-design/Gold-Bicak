"use client";

import { getOrderStatusLabel } from "@/lib/utils";
import { CheckCircle2, Circle, Package } from "lucide-react";

interface TimelineEntry {
  status: string;
  statusLabel: string;
  note: string | null;
  createdAt: string;
}

interface OrderTrackTimelineProps {
  currentStatus: string;
  timeline: TimelineEntry[];
}

const STEP_ORDER = [
  "SIPARIS_ALINDI",
  "ODEME_BEKLENIYOR",
  "ODEME_BILDIRILDI",
  "ODEME_ONAYLANDI",
  "HAZIRLANIYOR",
  "KARGOYA_VERILDI",
  "TESLIM_EDILDI",
];

export default function OrderTrackTimeline({
  currentStatus,
  timeline,
}: OrderTrackTimelineProps) {
  if (currentStatus === "IPTAL_EDILDI") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Bu sipariş iptal edilmiştir.
      </div>
    );
  }

  const reached = new Set(timeline.map((entry) => entry.status));
  reached.add(currentStatus);
  const currentIndex = STEP_ORDER.indexOf(currentStatus);

  return (
    <div className="mt-6">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-brand-black">
        <Package className="h-4 w-4 text-gold" />
        Sipariş Durumu
      </h3>
      <ol className="space-y-4">
        {STEP_ORDER.map((step, index) => {
          const done = reached.has(step) || index <= currentIndex;
          const active = step === currentStatus;
          const historyEntry = [...timeline].reverse().find((entry) => entry.status === step);

          return (
            <li key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                {done ? (
                  <CheckCircle2
                    className={`h-5 w-5 ${active ? "text-gold" : "text-emerald-600"}`}
                  />
                ) : (
                  <Circle className="h-5 w-5 text-neutral-300" />
                )}
                {index < STEP_ORDER.length - 1 && (
                  <div className={`mt-1 h-full min-h-6 w-px ${done ? "bg-gold/40" : "bg-neutral-200"}`} />
                )}
              </div>
              <div className="pb-2">
                <div className={`font-medium ${active ? "text-gold-dark" : done ? "text-brand-black" : "text-neutral-400"}`}>
                  {getOrderStatusLabel(step)}
                </div>
                {historyEntry && (
                  <div className="text-xs text-neutral-500">
                    {new Date(historyEntry.createdAt).toLocaleString("tr-TR")}
                    {historyEntry.note ? ` — ${historyEntry.note}` : ""}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
