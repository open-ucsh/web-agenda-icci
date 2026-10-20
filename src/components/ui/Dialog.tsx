import type { ComponentPropsWithoutRef, RefObject } from "react";

type DialogSize = "small" | "medium" | "large";

interface DialogProps extends Omit<ComponentPropsWithoutRef<"dialog">, "className"> {
  dialogRef: RefObject<HTMLDialogElement | null>;
  restoreFocusRef: RefObject<HTMLElement | null>;
  size: DialogSize;
}

const SIZE_CLASSES = {
  small: "w-96",
  medium: "w-md",
  large: "w-160",
} satisfies Record<DialogSize, string>;

export function Dialog({
  dialogRef,
  restoreFocusRef,
  size,
  children,
  onClose,
  ...props
}: DialogProps) {
  return (
    <dialog
      {...props}
      className={[
        "agenda-dialog fixed inset-0 m-auto overflow-hidden rounded-xl border border-border bg-background p-0 text-text shadow-xl backdrop:bg-slate-950/25",
        SIZE_CLASSES[size],
      ].join(" ")}
      onClose={(event) => {
        onClose?.(event);

        const trigger = restoreFocusRef.current;

        if (trigger?.isConnected) {
          trigger.focus();
        }
      }}
      ref={dialogRef}
    >
      <div className="agenda-dialog-content flex flex-col">{children}</div>
    </dialog>
  );
}
