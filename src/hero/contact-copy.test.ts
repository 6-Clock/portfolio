import { describe, it, expect } from "vitest";
import { createContactCopy } from "./contact-copy";

// Fakes for the two injected dependencies: a clipboard that records writes and a
// scheduler that captures the pending callback so the test fires the revert by
// hand instead of waiting on a real timer.
function fakes() {
  const writes: string[] = [];
  const clipboard = {
    writeText: (text: string) => {
      writes.push(text);
    },
  };
  let pending: (() => void) | null = null;
  const scheduler = (fn: () => void): (() => void) => {
    pending = fn;
    return () => {
      pending = null;
    };
  };
  return {
    writes,
    clipboard,
    scheduler,
    fireRevert: () => {
      const fn = pending;
      pending = null;
      fn?.();
    },
    hasPending: () => pending !== null,
  };
}

const ADDRESS = "arturozhang3@gmail.com";

describe("contact copy controller", () => {
  it("copies the configured address and flips the label to copied", () => {
    const f = fakes();
    const c = createContactCopy({
      address: ADDRESS,
      clipboard: f.clipboard,
      scheduler: f.scheduler,
    });

    expect(c.label).toBe("idle");
    c.copy();
    expect(f.writes).toEqual([ADDRESS]);
    expect(c.label).toBe("copied");
  });

  it("reverts to idle after the scheduled delay elapses", () => {
    const f = fakes();
    const c = createContactCopy({
      address: ADDRESS,
      clipboard: f.clipboard,
      scheduler: f.scheduler,
    });

    c.copy();
    expect(c.label).toBe("copied");
    expect(f.hasPending()).toBe(true);

    f.fireRevert();
    expect(c.label).toBe("idle");
  });

  it("works on repeated clicks, re-copying and re-flashing each time", () => {
    const f = fakes();
    const c = createContactCopy({
      address: ADDRESS,
      clipboard: f.clipboard,
      scheduler: f.scheduler,
    });

    c.copy();
    f.fireRevert();
    c.copy();

    expect(f.writes).toEqual([ADDRESS, ADDRESS]);
    expect(c.label).toBe("copied");

    f.fireRevert();
    expect(c.label).toBe("idle");
  });

  it("notifies onChange with each label transition", () => {
    const f = fakes();
    const seen: string[] = [];
    const c = createContactCopy({
      address: ADDRESS,
      clipboard: f.clipboard,
      scheduler: f.scheduler,
      onChange: (label) => seen.push(label),
    });

    c.copy();
    f.fireRevert();
    expect(seen).toEqual(["copied", "idle"]);
  });
});
