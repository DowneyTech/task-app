import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskApp",
  description: "シンプルで洗練されたタスク管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
