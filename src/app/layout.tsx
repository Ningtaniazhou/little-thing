import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "啾啾小事 · Little Thing",
  description: "扭一颗蛋，做一件小事，治愈你的每一天。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
