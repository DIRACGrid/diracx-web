import "./globals.css";
import { Inter } from "next/font/google";
import { OIDCProvider } from "./components/OIDCUtils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "diracX",
  description: "Distributed Infrastructure with Remote Agent Controller",
};

const configuration = {
  client_id: process.env.DIRACX_CLIENT_ID,
  redirect_uri: process.env.REDIRECT_URI,
  scope: process.env.DEFAULT_SCOPE,
  authority: process.env.NEXT_PUBLIC_DIRACX_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OIDCProvider configuration={configuration}>{children}</OIDCProvider>
      </body>
    </html>
  );
}
