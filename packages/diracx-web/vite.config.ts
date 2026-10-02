import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // In-cluster dev mode (diracx-charts' developer.enabled mount) sets
    // PORT=8080 to match the pod's declared containerPort/Service/probes,
    // the same way Next.js's dev server used to read it. Outside the
    // cluster (standalone dev mode), fall back to 3000, matching Next's own
    // previous default and the diracx backend's hardcoded CORS allowlist of
    // http(s)://localhost:3000/:8000 (see
    // diracx-routers/src/diracx/routers/factory.py) for local dev.
    port: Number(process.env.PORT) || 3000,
    // Next's dev server binds all interfaces by default; Vite's defaults to
    // localhost only. Match Next's behavior, since this also needs to be
    // reachable from outside the container when run in-cluster (e.g. the
    // kubelet readiness probe connects from outside the pod's loopback).
    host: true,
    // Vite's DNS-rebinding protection rejects requests whose Host header
    // isn't in an explicit allowlist; Next's dev server never had this
    // restriction. The demo generates a hostname dynamically per machine
    // (<ip>.nip.io), so there's no fixed value to allowlist — disable the
    // check to match Next's prior behavior.
    allowedHosts: true,
  },
});
