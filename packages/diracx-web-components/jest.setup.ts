import "@testing-library/jest-dom";

// Polyfill structuredClone for jsdom (used by @mui/x-charts)
if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = <T>(val: T): T =>
    JSON.parse(JSON.stringify(val));
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

jest.mock("@axa-fr/react-oidc");
