import structuredClonePonyfill from "@ungap/structured-clone";
import "@testing-library/jest-dom";

// Polyfill structuredClone for jsdom (used by @mui/x-charts).
// jest-environment-jsdom does not expose Node's native structuredClone, and
// Node's v8-serialize trick creates values from the wrong realm (instanceof
// breaks). @ungap/structured-clone implements the structured-clone algorithm
// in the current realm (unlike JSON round-tripping, it preserves Dates,
// Maps, Sets, …).
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = ((val: unknown) =>
    structuredClonePonyfill(val)) as typeof globalThis.structuredClone;
}

// Polyfill PointerEvent for jsdom (used by @mui/x-internal-gestures)
if (typeof globalThis.PointerEvent === "undefined") {
  // @ts-expect-error -- minimal polyfill for jsdom
  globalThis.PointerEvent = class PointerEvent extends MouseEvent {
    public pointerId: number;
    public pointerType: string;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? "";
    }
  };
}

// Mock layout measurements for @tanstack/react-virtual (jsdom has no layout engine).
// Only override offsetHeight/offsetWidth — these are the properties the virtualizer
// uses to determine container size. We do NOT override getBoundingClientRect globally
// because MUI Popover relies on the native implementation.
//
// This is a global override for every test; if a future test needs real layout
// measurements (e.g. to assert that an element is actually visible), call
// restoreRealLayoutMeasurements() in a beforeEach hook.
const originalOffsetHeight = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetHeight",
);
const originalOffsetWidth = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetWidth",
);

Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  get() {
    return 600;
  },
});
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  get() {
    return 800;
  },
});

// Exported so individual tests can opt out of the mocked layout values.
export function restoreRealLayoutMeasurements() {
  if (originalOffsetHeight) {
    Object.defineProperty(
      HTMLElement.prototype,
      "offsetHeight",
      originalOffsetHeight,
    );
  }
  if (originalOffsetWidth) {
    Object.defineProperty(
      HTMLElement.prototype,
      "offsetWidth",
      originalOffsetWidth,
    );
  }
}

jest.mock("@axa-fr/react-oidc");
