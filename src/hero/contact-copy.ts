// The Email copy interaction as a small pure controller. It owns the label state
// machine (idle → copied → idle) and nothing else: the clipboard and the timer
// are injected, so the transitions are unit-testable without a real clipboard or
// real timers. The dropdown open/close and the LinkedIn/Resume anchors are thin
// DOM glue and live in splat-panel.ts. Mirrors the sway (pure) / sway-controller
// (DOM glue) split.

/** idle = shows the Email label; copied = briefly flashes "Copied!". */
export type CopyLabel = "idle" | "copied";

/** Minimal clipboard surface — just the write we need. */
export interface ClipboardWriter {
  writeText(text: string): void | Promise<void>;
}

/** Schedules `fn` to run after `ms` and returns a canceller. Injected so tests
 *  fire the revert by hand; production passes a setTimeout-backed scheduler. */
export type Scheduler = (fn: () => void, ms: number) => () => void;

export interface ContactCopyOptions {
  /** The address to copy. */
  address: string;
  clipboard: ClipboardWriter;
  scheduler: Scheduler;
  /** How long "Copied!" shows before reverting to idle. Default 1500ms. */
  revertMs?: number;
  /** Called on every label transition so the DOM can re-render. */
  onChange?: (label: CopyLabel) => void;
}

export interface ContactCopyController {
  /** Current label state. */
  readonly label: CopyLabel;
  /** Copy the address, flash "Copied!", then revert after `revertMs`. */
  copy(): void;
}

export function createContactCopy(
  opts: ContactCopyOptions,
): ContactCopyController {
  const revertMs = opts.revertMs ?? 1500;
  let label: CopyLabel = "idle";
  let cancelRevert: (() => void) | null = null;

  const set = (next: CopyLabel): void => {
    label = next;
    opts.onChange?.(next);
  };

  return {
    get label(): CopyLabel {
      return label;
    },
    copy(): void {
      opts.clipboard.writeText(opts.address);
      // A fresh click restarts the flash: drop any in-flight revert first.
      cancelRevert?.();
      set("copied");
      cancelRevert = opts.scheduler(() => {
        cancelRevert = null;
        set("idle");
      }, revertMs);
    },
  };
}
