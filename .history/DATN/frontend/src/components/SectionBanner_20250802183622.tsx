"use client";
import Image from "next/image";

export interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

interface SectionBannerProps {
  banners: Banner[];
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
}

const SectionBanner: React.FC<SectionBannerProps> = ({ banners, currentSlide, setCurrentSlide }) => {
  if (!banners || banners.length === 0) return null;
  return (
<div className="w-screen overflow-hidden">
  <div className="relative w-full aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/5] md:h-[360px] lg:aspect-auto lg:h-[475px] group overflow-hidden">
    <div
      className="flex transition-transform duration-700 ease-in-out h-full"
      style={{
        width: `${banners.length * 100}%`,
        transform: `translateX(-${currentSlide * (100 / banners.length)}%)`,
      }}
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className="w-full flex-shrink-0 h-full relative"
          style={{ width: `${100 / banners.length}%` }}
        >
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
    </div>

  );
};

export default SectionBanner;