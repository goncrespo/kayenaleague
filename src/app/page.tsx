import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import HowItWorks from "@/components/landing/HowItWorks";
import Rules from "@/components/landing/Rules";
import Partners from "@/components/landing/Partners";
import Pricing from "@/components/landing/Pricing";
import Reveal from "@/components/landing/Reveal";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Reveal>
        <About />
      </Reveal>
      <Reveal offset={0.5}>
        <HowItWorks />
      </Reveal>
      <Pricing />
      <Reveal>
        <Rules />
      </Reveal>
      <Reveal>
        <Partners />
      </Reveal>
    </main>
  );
}