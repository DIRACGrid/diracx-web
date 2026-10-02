import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter";
import "./index.css";
import App from "./App";

// diracx-web-components can't read import.meta.env itself (its own build
// targets es6, which has no import.meta support), so pass this through via
// a runtime global instead. See hooks/utils.tsx's useDiracxUrl for why.
window.__DIRACX_URL__ = import.meta.env.VITE_DIRACX_URL;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense>
      <App />
    </Suspense>
  </StrictMode>,
);
