import { CloudRain } from "lucide-react";

import { ONLINE_CLASS_NOTICE } from "@/data/activities";

import styles from "./AgendaCalendar.module.css";

interface OnlineClassNoticeProps {
  selectedKey: string;
}

export function OnlineClassNotice(_props: OnlineClassNoticeProps) {
  return (
    <details className={styles.notice}>
      <summary>
        <CloudRain aria-hidden="true" />
        <span className="min-w-0 flex-1 font-medium">{ONLINE_CLASS_NOTICE.title}</span>
        <span className="shrink-0 text-xs underline underline-offset-2">Ver detalle</span>
      </summary>
      <p className={styles.noticeDetail}>{ONLINE_CLASS_NOTICE.message}</p>
    </details>
  );
}
