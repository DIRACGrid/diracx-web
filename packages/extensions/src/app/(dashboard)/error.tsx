"use client";

import { ErrorBox } from "@dirac-grid/diracx-web-components/components";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorBox msg={error.message} reset={reset} />;
}
