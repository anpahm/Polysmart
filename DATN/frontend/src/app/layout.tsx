import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import './globals.css'; 
import ReduxProvider from '../providers/ReduxProvider';

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
          <main className="pt-16">
            {children}
          </main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}