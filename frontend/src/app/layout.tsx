import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "コストレ！",
  description: "気軽にコスプレグッズをシェアしよう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
