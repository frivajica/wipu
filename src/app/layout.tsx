import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { AuthGuard } from "@/components/auth-guard";
import { Header } from "@/components/layout/header";
import { ToastContainer } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Wipu - Shared Ledger",
  description: "A shared expense/income tracker for couples and small teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${manrope.variable} font-sans antialiased bg-background text-text-primary`}
      >
        <Providers>
          <AuthGuard>
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-6">
              {children}
            </main>
          </AuthGuard>
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
