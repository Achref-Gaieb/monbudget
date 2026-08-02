import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "MonBudget";
const APP_DESCRIPTION =
  "Application intelligente de gestion budgétaire permettant de suivre ses revenus, dépenses et objectifs financiers.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} — Gestion de budget 50/30/20`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "budget",
    "50/30/20",
    "gestion de budget",
    "épargne",
    "finances personnelles",
    "budget mensuel",
    "suivi des dépenses",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  category: "finance",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: APP_NAME,
    title: `${APP_NAME} — Gestion de budget 50/30/20`,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Gestion de budget 50/30/20`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  // Light is the app's default; Providers keeps this in sync with the
  // active theme at runtime.
  themeColor: "#ffffff",
};

/**
 * Applies the stored theme before first paint to avoid a flash.
 * Priority: saved preference → light. The OS preference is only consulted
 * when the user explicitly chose "system" in Settings.
 */
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem('budget-app-v1')||'{}');var t=(s.state&&s.state.settings&&s.state.settings.theme)||'light';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#0a0a0a');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // Smooth for in-page anchors, instant on route changes (Next 16 behaviour)
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
