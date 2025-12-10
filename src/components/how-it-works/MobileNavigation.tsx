"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";

interface Step {
    id: number;
    title: string;
}

interface MobileNavigationProps {
    steps: Step[];
    activeStep: number;
    setActiveStep: (step: number) => void;
}

export default function MobileNavigation({ steps, activeStep, setActiveStep }: MobileNavigationProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const activeElement = scrollRef.current.children[activeStep] as HTMLElement;
            if (activeElement) {
                const containerWidth = scrollRef.current.offsetWidth;
                const itemLeft = activeElement.offsetLeft;
                const itemWidth = activeElement.offsetWidth;

                scrollRef.current.scrollTo({
                    left: itemLeft - containerWidth / 2 + itemWidth / 2,
                    behavior: "smooth"
                });
            }
        }
    }, [activeStep]);

    return (
        <div className="md:hidden w-full bg-black/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">

                <Link href="/" className="font-bold text-lg tracking-tighter text-white">
                    KAYENA <span className="text-emerald-400">LEAGUE</span>
                </Link>
                <span className="text-xs font-mono text-gray-500">
                    PASO {activeStep + 1}/{steps.length}
                </span>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-2 p-3 scrollbar-hide snap-x"
            >
                {steps.map((step, index) => {
                    const isActive = activeStep === index;
                    return (
                        <button
                            key={step.id}
                            onClick={() => setActiveStep(index)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all snap-center whitespace-nowrap ${isActive
                                ? "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            <span className="mr-2 font-bold opacity-60">{index + 1}.</span>
                            {step.title}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
