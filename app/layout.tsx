import type { Metadata } from "next";
import { Navbar } from "@/components/uiComponents/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Estate Analyzer",
  description: "Create, organize, and manage your property investment blocks",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
