import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import HowItWorks from "@/components/landing/HowItWorks";
import Rules from "@/components/landing/Rules";
import Pricing from "@/components/landing/Pricing";
import Reveal from "@/components/landing/Reveal";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Reveal><About /></Reveal>
      <HowItWorks />
      <Pricing />
      <Reveal><Rules /></Reveal>
      {/* <Reveal><Partners /></Reveal> */}
    </main>
  );
}