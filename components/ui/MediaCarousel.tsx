"use client";

import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

export type CarouselItem = {
  src: string;
  alt: string;
  /** Present once a real clip exists; the slide plays video instead of the photo. */
  video?: string;
};

/**
 * Drag/swipe coverflow gallery (Swiper — grabCursor, touch, loop) for mixed
 * photo + video coverage. Adapted from the Skiper UI `skiper49` primitive:
 * framer-motion dropped (GSAP already owns motion sitewide), colours moved
 * onto the monochrome tokens, styling moved to globals.css.
 */
export default function MediaCarousel({ items, className = "" }: { items: CarouselItem[]; className?: string }) {
  return (
    <div className={`media-carousel relative ${className}`}>
      <Swiper
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        effect="coverflow"
        grabCursor
        slidesPerView="auto"
        centeredSlides
        loop
        autoplay={{ delay: 2800, disableOnInteraction: true }}
        coverflowEffect={{ rotate: 32, stretch: 0, depth: 140, modifier: 1, slideShadows: false }}
        pagination={{ clickable: true }}
        navigation={{ nextEl: ".mc-next", prevEl: ".mc-prev" }}
      >
        {items.map((item, i) => (
          <SwiperSlide key={item.src + i}>
            {item.video ? (
              <video
                className="plate h-full w-full object-cover"
                src={item.video}
                poster={item.src}
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 60vw, 340px"
                className="plate object-cover"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      <button aria-label="Previous" className="mc-prev">
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button aria-label="Next" className="mc-next">
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
