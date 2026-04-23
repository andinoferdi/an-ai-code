import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ChatProvider } from "@/providers/ChatProvider";
import "./globals.css";

// ─────────────────────────────────────────────
// Font — DM Sans: clean, modern, slightly geometric
// Avoids the overused Inter look while staying neutral
// ─────────────────────────────────────────────
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Folio AI — Asisten AI Modern",
  description:
    "Frontend chatbot AI yang bersih, modern, dan siap dikembangkan.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='13' fill='%234C8E5E'/></svg>",
  },
};

// ─────────────────────────────────────────────
// Root layout
// ─────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${dmSans.variable}`}>
      <body style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
        <ThemeProvider>
          <ChatProvider>{children}</ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
