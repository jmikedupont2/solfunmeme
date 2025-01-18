import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
//import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "This is the official website repository for the $SOLFUNMEME Zero Ontology System",
  description: "$SOLFUNMEME CA BwUTq7fS6sfUmHDwAiCQZ3asSiPEapW5zDrsbwtapump",
  // other metadata
};

//      <Video />
//      <Brands />
//    <Testimonials />
//      <Pricing />
//      <Hero />
//      <Features />
//        <Blog />
//      <Contact />


export default function Home() {
  return (
    <>
      <ScrollUp />
      <AboutSectionOne />
      <AboutSectionTwo />

    </>
  );
}
