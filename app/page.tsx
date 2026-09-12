import Loader from "@/components/chrome/Loader";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";

import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Showreel from "@/components/sections/Showreel";
import Services from "@/components/sections/Services";
import Events from "@/components/sections/Events";
import Clients from "@/components/sections/Clients";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";

/**
 * Order follows the brief's hierarchy: IMPACT → TRUST → SERVICES → PROCESS →
 * CONTACT.
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
        <Services />
        <Events />
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
