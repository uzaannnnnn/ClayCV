import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "ClayCV: Create Your Professional CV",
    template: "%s | ClayCV",
  },
  description:
    "Create a professional, ATS-friendly CV in minutes with ClayCV.",
  icons: {
    icon: [
      { url: "/icon.png?v=claycv", type: "image/png" },
      { url: "/favicon-32x32.png?v=claycv", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=claycv", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico?v=claycv" },
    ],
    apple: "/apple-icon.png?v=claycv",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
