import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sign in · Claude",
  description: "Your thinking partner for big ambitions.",
  icons: { icon: "/seo/favicon-32.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
