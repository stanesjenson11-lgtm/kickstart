import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

/**
 * What Android uses for the home screen and the installed app: the KS mark on
 * its black tile. Launchers always draw a shape, and Chrome puts a bare icon on
 * white, where the white mark would vanish. The browser icons in app/ are bare.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Kickstart",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#050505",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
