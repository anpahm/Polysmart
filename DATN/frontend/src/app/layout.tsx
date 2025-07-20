import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import Header from "@/components/Header";
import SmoothScrollProvider from "../components/SmoothScrollProvider";
import Footer from "@/components/Footer";
import './globals.css'; 
import ReduxProvider from '../providers/ReduxProvider';
import ChatbotAI from '@/components/ChatbotAI';

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'] 
});

export const metadata: Metadata = {
  title: "Poly Smart - Đại lý ủy quyền Apple chính hãng",
  description: "Cửa hàng điện thoại và thiết bị công nghệ chính hãng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=geist-mono@400&f[]=geist-sans@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ReduxProvider>
          <Header />
          <SmoothScrollProvider>
          <main className="pt-16">
            {children}
          </main>
          </SmoothScrollProvider>
          <Footer />
        </ReduxProvider>
        <ChatbotAI />
      </body>
    </html>
  );
}