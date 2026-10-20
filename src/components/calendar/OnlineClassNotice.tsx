import { CloudRain } from "lucide-react";

import { ONLINE_CLASS_NOTICE } from "@/data/activities";

interface OnlineClassNoticeProps {
  selectedKey: string;
}

export function OnlineClassNotice({ selectedKey }: OnlineClassNoticeProps) {
  return (
    <aside
      aria-label="Aviso de clases online"
      className={[
        "mb-4 shrink-0 items-center gap-3 rounded-md border border-brand/15 bg-brand/5 px-3 py-2.5 sm:px-4",
        selectedKey === ONLINE_CLASS_NOTICE.date ? "flex" : "hidden md:flex",
      ].join(" ")}
    >
      <CloudRain aria-hidden="true" className="size-5 shrink-0 text-brand" strokeWidth={1.75} />

      <div className="min-w-0 border-l border-brand/15 pl-3">
        <p className="text-xs font-semibold leading-5 text-brand">{ONLINE_CLASS_NOTICE.title}</p>

        <p className="text-xs leading-5 text-muted">{ONLINE_CLASS_NOTICE.message}</p>
      </div>
    </aside>
  );
}
