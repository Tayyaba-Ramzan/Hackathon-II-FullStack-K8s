import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { TaskProvider } from "@/lib/contexts/TaskContext";
import { DarkModeProvider } from "@/lib/dark-mode-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo FullStack App",
  description: "A secure todo application with authentication",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 transition-colors duration-300`}
      >
        <AuthProvider>
          <DarkModeProvider>
            <TaskProvider>
              {children}
            </TaskProvider>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
