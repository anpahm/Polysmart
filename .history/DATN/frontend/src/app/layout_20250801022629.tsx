import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import Header from "@/components/Header";
import SmoothScrollProvider from "../components/SmoothScrollProvider";
import Footer from "@/components/Footer";
import './globals.css'; 
import ReduxProvider from '../providers/ReduxProvider';
import ChatbotAI from '@/components/ChatbotAI';
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'] 
});

export const metadata: Metadata = {
  title: {
    default: "Poly Smart - Đại lý ủy quyền Apple chính hãng | iPhone, iPad, MacBook",
    template: "%s | Poly Smart"
  },
  description: "Poly Smart - Đại lý ủy quyền Apple chính hãng tại Việt Nam. Chuyên cung cấp iPhone, iPad, MacBook, Apple Watch, AirPods chính hãng với giá tốt nhất. Giao hàng toàn quốc, bảo hành chính hãng.",
  keywords: [
    "iPhone chính hãng",
    "iPad chính hãng", 
    "MacBook chính hãng",
    "Apple Watch",
    "AirPods",
    "đại lý Apple",
    "cửa hàng Apple",
    "Poly Smart",
    "Apple Việt Nam",
    "iPhone 15",
    "iPhone 15 Pro",
    "iPhone 15 Pro Max",
    "iPad Pro",
    "MacBook Pro",
    "MacBook Air"
  ],
  authors: [{ name: "Poly Smart" }],
  creator: "Poly Smart",
  publisher: "Poly Smart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://polysmart.me'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://polysmart.me',
    siteName: 'Poly Smart',
    title: 'Poly Smart - Đại lý ủy quyền Apple chính hãng',
    description: 'Đại lý ủy quyền Apple chính hãng tại Việt Nam. Chuyên cung cấp iPhone, iPad, MacBook, Apple Watch, AirPods với giá tốt nhất.',
    images: [
      {
        url: 'https://polysmart.me/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Poly Smart - Đại lý Apple chính hãng',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Poly Smart - Đại lý ủy quyền Apple chính hãng',
    description: 'Đại lý ủy quyền Apple chính hãng tại Việt Nam. Chuyên cung cấp iPhone, iPad, MacBook, Apple Watch, AirPods với giá tốt nhất.',
    images: [''],
    creator: '@polysmart',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=geist-mono@400&f[]=geist-sans@400&display=swap"
          rel="stylesheet"
        />
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" />    
        {/* Theme color */}
        <meta name="theme-color" content="#007AFF" />
        <meta name="msapplication-TileColor" content="#007AFF" />
        
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Poly Smart",
              "url": "https://polysmart.me",
              "logo": "",
              "description": "Đại lý ủy quyền Apple chính hãng tại Việt Nam",
              "foundingDate": "2020",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "VN",
                "addressLocality": "Ho Chi Minh City",
                "addressRegion": "Ho Chi Minh"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+84-xxx-xxx-xxxx",
                "contactType": "customer service",
                "availableLanguage": "Vietnamese"
              },
              "sameAs": [
                "https://facebook.com/polysmart",
                "https://instagram.com/polysmart",
                "https://youtube.com/polysmart"
              ]
            })
          }}
        />
        
        {/* Structured Data for LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Poly Smart",
              "description": "Đại lý ủy quyền Apple chính hãng tại Việt Nam",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Đường ABC",
                "addressLocality": "Ho Chi Minh City",
                "addressRegion": "Ho Chi Minh",
                "postalCode": "70000",
                "addressCountry": "VN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 10.8231,
                "longitude": 106.6297
              },
              "url": "https://polysmart.me",
              "telephone": "+84-xxx-xxx-xxxx",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": [
                    "Monday",
                    "Tuesday", 
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                  ],
                  "opens": "08:00",
                  "closes": "22:00"
                }
              ],
              "priceRange": "$$",
              "servesCuisine": "Electronics",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Apple Products",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "iPhone 15 Pro Max",
                      "brand": {
                        "@type": "Brand",
                        "name": "Apple"
                      }
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <GoogleOAuthProvider clientId="476889203302-b661q44fvhrvo4kv174o6rp95hs5vmp1.apps.googleusercontent.com">
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
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}