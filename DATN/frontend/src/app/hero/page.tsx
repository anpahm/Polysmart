 "use client";
 
 import HeroSection from '@/components/HeroSection';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    document.body.setAttribute('data-route-hero', '');
    return () => {
      document.body.removeAttribute('data-route-hero');
    };
  }, []);
  return <HeroSection />;
}
