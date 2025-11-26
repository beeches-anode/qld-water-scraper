import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "QLD Water Dashboard | Queensland Water Industry Information",
  description: "Track water allocations, trading activity, regulatory plans, and industry developments across Queensland's bulk water supply network.",
  keywords: ["Queensland", "water", "allocations", "trading", "water plans", "infrastructure"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
