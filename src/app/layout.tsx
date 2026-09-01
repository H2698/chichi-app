import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Cinzel, Jost } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/shell/ServiceWorkerRegister";
import { AppHydrator } from "@/components/shell/AppHydrator";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chichii — Espace boutique",
  description:
    "Chichii — application de gestion de location de robes de soirée : scan QR, disponibilités, réservations, retraits et retours.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Chichii",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#33291f",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${cinzel.variable} ${jost.variable} h-full`}
    >
      <body className="h-full bg-[#e9dfd0] font-sans antialiased">
        {children}
        <AppHydrator />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
