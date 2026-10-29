import Loader from "@/components/chrome/Loader";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import ZoomLock from "@/components/chrome/ZoomLock";
import ProjectorShot from "@/components/chrome/ProjectorShot";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";

import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import Showreel from "@/components/sections/Showreel";
import Services from "@/components/sections/Services";
import Web from "@/components/sections/Web";
import Ai from "@/components/sections/Ai";
import Gallery from "@/components/sections/Gallery";
import Clients from "@/components/sections/Clients";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";
import { faq, site } from "@/lib/content";
import { ldJson } from "@/lib/utils";

/* Here, not in the layout: FAQ markup has to match questions visible on the
   page it is on, and these are only on the home page. */
/* The showreel as a video search result. It has no audio, so the
   description stands in for a transcript. Thumbnail: a frame at 0:04. */
const videoLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: `${site.name} showreel`,
  description:
    "A 33-second showreel of corporate event, conference, launch and party coverage by Kickstart Creative Studio, a Bangalore media production studio. The web cut has no audio.",
  thumbnailUrl: `${site.url}/showreel-poster.jpg`,
  uploadDate: "2026-08-28",
  duration: "PT33S",
  contentUrl: `${site.url}/showreel.mp4`,
  embedUrl: `${site.url}/#work`,
  publisher: { "@id": `${site.url}/#business` },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/**
 * Order follows the brief's hierarchy: IMPACT → TRUST → SERVICES → PROCESS →
 * CONTACT.
 */
export default function Home() {
  return (
    <>
      <Loader />
      <SmoothScroll />
      <ZoomLock />
      <ProjectorShot />
      <Nav />
      <main id="main">
        <Hero />
        <Statement />
        <Showreel />
        <Services />
        <Web />
        <Ai />
        <Testimonials />
        <Gallery />
        <Clients />
        <About />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson([faqLd, videoLd])} />
    </>
  );
}
