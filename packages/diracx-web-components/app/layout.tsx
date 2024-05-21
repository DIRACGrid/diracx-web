import React from "react";

// Force an error if any components use dynamic functions or uncached data
// as these won't work in the static export.
export const dynamic = "error";

// This is needed for Jest tests
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
