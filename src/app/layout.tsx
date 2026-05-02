import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visual Research Board",
  description: "A source-aware visual research board for creators."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
