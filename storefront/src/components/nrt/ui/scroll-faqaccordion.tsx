"use client";

import * as React from "react";
import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface FAQItem {
    id: number | string;
    question: string;
    answer: string;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

interface ScrollFAQAccordionProps {
    data: FAQItem[];
    className?: string;
    questionClassName?: string;
    answerClassName?: string;
}

export default function ScrollFAQAccordion({
    data = [
        {
            id: 1,
            question: "What is Ruixen UI?",
            answer: "Ruixen UI is a sleek and modern UI component library built with React and Tailwind CSS, designed to help developers create beautiful, responsive, and accessible web applications faster."
        },
        {
            id: 2,
            question: "How do I install Ruixen UI?",
            answer: "You can install Ruixen UI via your terminal using npm or yarn: `npm install ruixenui` or `yarn add ruixenui`."
        },
        {
            id: 3,
            question: "Is Ruixen UI open-source?",
            answer: "Yes, Ruixen UI is completely open-source and available under the MIT license. You’re free to use it in both personal and commercial projects."
        },
        {
            id: 4,
            question: "Where can I find the documentation?",
            answer: "You can find full documentation, usage examples, and component APIs at our official site: docs.ruixenui.com."
        },
        {
            id: 5,
            question: "Can I contribute to Ruixen UI?",
            answer: "Definitely! Ruixen UI thrives on community support. Visit our GitHub repository to explore contribution guidelines, report issues, or submit pull requests."
        }
    ],
    className,
    questionClassName,
    answerClassName,
}: ScrollFAQAccordionProps) {
    const [openItem, setOpenItem] = React.useState<string | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const contentRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

    // Register GSAP plugins
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }
    }, []);

    // Set up GSAP animations
    useGSAP(() => {
        if (!containerRef.current || data.length === 0) return;

        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top+=100", // Start slightly lower to account for navbar if any
                end: `+=${data.length * 200}`, // adjust spacing
                scrub: 0.3,
                pin: true,
                markers: false,
            },
        });

        data.forEach((item, index) => {
            const contentRef = contentRefs.current.get(item.id.toString());
            if (contentRef) {
                tl.add(() => {
                    setOpenItem(item.id.toString());
                }, index * 2); // spacing between triggers
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, [data]);

    return (
        <div
            ref={containerRef}
            className={cn("max-w-4xl mx-auto text-center py-16 min-h-[100vh]", className)}
        >
            <h2 className="text-3xl font-bold mb-2">
                <span className="text-slate-900 transition-colors">
                    Frequently Asked Questions
                </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-200 mb-6">
                Scroll down to explore answers to some common questions.
            </p>

            <Accordion.Root type="single" collapsible value={openItem || ""} onValueChange={setOpenItem}>
                {data.map((item) => (
                    <Accordion.Item value={item.id.toString()} key={item.id} className="mb-6">
                        <Accordion.Header>
                            <Accordion.Trigger className="flex w-full items-center justify-start gap-x-4 cursor-default">
                                <div
                                    className={cn(
                                        "relative flex items-center space-x-2 rounded-xl p-4 transition-colors text-left flex-1",
                                        openItem === item.id.toString()
                                            ? "bg-nepal-red/10 text-nepal-red border border-nepal-red/20 shadow-sm"
                                            : "bg-white border border-slate-100 shadow-sm",
                                        questionClassName
                                    )}
                                >
                                    {item.icon && (
                                        <span
                                            className={cn(
                                                "absolute bottom-6",
                                                item.iconPosition === "right" ? "right-0" : "left-0"
                                            )}
                                            style={{
                                                transform: item.iconPosition === "right" ? "rotate(7deg)" : "rotate(-4deg)",
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                    )}
                                    <span className="font-semibold text-lg">{item.question}</span>
                                </div>

                                <span
                                    className={cn(
                                        "w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all",
                                        openItem === item.id.toString() && "bg-nepal-red text-white rotate-180"
                                    )}
                                >
                                    <ChevronDown className="h-5 w-5" />
                                </span>
                            </Accordion.Trigger>
                        </Accordion.Header>

                        <Accordion.Content asChild forceMount>
                            <motion.div
                                ref={(el) => {
                                    if (el) contentRefs.current.set(item.id.toString(), el);
                                }}
                                initial="collapsed"
                                animate={openItem === item.id.toString() ? "open" : "collapsed"}
                                variants={{
                                    open: { opacity: 1, height: "auto" },
                                    collapsed: { opacity: 0, height: 0 },
                                }}
                                transition={{ duration: 0.4 }}
                                className="overflow-hidden"
                            >
                                <div className="flex justify-start ml-2 mt-4 md:ml-4">
                                    <div
                                        className={cn(
                                            "relative text-left rounded-2xl px-6 py-4 text-slate-600 bg-white border border-slate-100 shadow-sm prose prose-sm max-w-none prose-a:text-nepal-red",
                                            answerClassName
                                        )}
                                        dangerouslySetInnerHTML={{ __html: item.answer }}
                                    />
                                </div>
                            </motion.div>
                        </Accordion.Content>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </div>
    );
}

// Ensure the trigger correctly displays instead of plus/minus to fit the theme
const ChevronDown = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
);

