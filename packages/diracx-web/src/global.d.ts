// Mirrors the same augmentation in diracx-web-components/src/global.d.ts.
// TypeScript doesn't pick up ambient global declarations transitively from
// a dependency's source, so it's declared here too.
declare global {
  interface Window {
    __DIRACX_URL__?: string;
  }
}

export {};
