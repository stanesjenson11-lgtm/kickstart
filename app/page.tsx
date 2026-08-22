import Loader from "@/components/chrome/Loader";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";

import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Showreel from "@/components/sections/Showreel";
import Work from "@/components/sections/Work";
import Services from "@/components/sections/Services";
import Why from "@/components/sections/Why";
import Headshots from "@/components/sections/Headshots";
import Events from "@/components/sections/Events";
import Social from "@/components/sections/Social";
import Process from "@/components/sections/Process";
import Clients from "@/components/sections/Clients";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";

/**
 * Order follows the brief's hierarchy: IMPACT → WORK → TRUST → SERVICES →
 * PROCESS → CONTACT. The site sells the quality before it explains the service
 * list, which is why Services sits after Selected Work rather than before it.
 */
export default function Home() {
  return (
    <>
      <Loader />
      <SmoothScroll />
      <Nav />
      <main id="main">
        <Hero />
        <Statement />
        <Showreel />
        <Work />
        <Services />
        <Why />
        <Headshots />
        <Events />
        <Social />
        <Process />
        <Clients />
        <Testimonials />
        <About />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
