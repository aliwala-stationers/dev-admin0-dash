import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { DataProvider } from "@/lib/data-context";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aliwala Admin",
    template: "%s | Aliwala Admin",
  },
  description: "Professional dashboard for managing inventory and orders.",
  icons: {
    icon: "/favicon.ico", // Ensure this file exists in your /public folder
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthProvider>
            <DataProvider>
              {children}
              <Toaster richColors visibleToasts={4} expand={true}/>
            </DataProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}