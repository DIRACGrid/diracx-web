import { Inter } from "next/font/google";
import { OIDCConfigurationProvider } from "@/contexts/OIDCConfigurationProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import Dashboard from "@/components/layout/Dashboard";
import { OIDCSecure } from "@/components/layout/OIDCSecure";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DiracX",
  description: "Distributed Infrastructure with Remote Agent Controller",
};

// Force an error if any components use dynamic functions or uncached data
// as these won't work in the static export.
export const dynamic = "error";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OIDCConfigurationProvider>
          <ThemeProvider>
            <OIDCSecure>{children}</OIDCSecure>
          </ThemeProvider>
        </OIDCConfigurationProvider>
      </body>
    </html>
  );
}
