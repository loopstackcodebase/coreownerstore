import Header from "@/component/header/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecomz - Product Details",
  description: "Explore our premium products and add them to your cart.",
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="relative">{children}</main>
    </div>
  );
}
