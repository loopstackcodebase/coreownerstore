
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | LoopStack",
    default: "LoopStack - Affordable E-commerce Store for Small Businesses",
  },
  description:
    "Get your online store for just ₹199. Perfect for small businesses earning less than ₹2,000/month. No monthly fees, no complex setup, direct order management.",
  keywords:
    "affordable ecommerce, small business online store, cheap website, no monthly fees, direct orders, small business solutions",
  authors: [{ name: "LoopStack" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico", // Add your favicon here
  },
  openGraph: {
    title: "LoopStack - Affordable E-commerce Store for Small Businesses",
    description:
      "Get your online store for just ₹199. Perfect for small businesses earning less than ₹2,000/month.",
    type: "website",
    siteName: "LoopStack",
    images: [
      {
        url: "/og-image.jpg", // Add your OG image here
        width: 1200,
        height: 630,
        alt: "LoopStack - Affordable E-commerce Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoopStack - Affordable E-commerce Store for Small Businesses",
    description:
      "Get your online store for just ₹199. Perfect for small businesses earning less than ₹2,000/month.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${outfit.className} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
