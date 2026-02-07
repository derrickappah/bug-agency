import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { ChevronRight } from "lucide-react";

export function BusinessCategoriesDialog({ categories }) {
    const displayCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="text-[var(--accent-primary)] p-0 h-auto font-semibold">
                    View Supported Businesses
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-white border-none shadow-2xl rounded-[2rem]">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Eligible <span className="text-[var(--accent-strong)]">Businesses</span></DialogTitle>
                    <DialogDescription className="text-base font-medium">
                        The BUG Launchpad is engineered for these specific Ghanaian industries.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                        {displayCategories.map((cat, idx) => (
                            <div key={idx} className="border border-gray-100 rounded-[2rem] p-6 bg-gray-50/50 hover:bg-[var(--accent-wash)] hover:border-[var(--accent-strong)] transition-all duration-300">
                                <h4 className="font-black text-[var(--text-primary)] mb-4 flex items-center gap-2 text-sm uppercase tracking-tight">
                                    <span className="w-6 h-6 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-[10px]">{idx + 1}</span>
                                    {cat.title}
                                </h4>
                                <ul className="space-y-2">
                                    {(cat.items || []).map((item, i) => (
                                        <li key={i} className="text-xs font-bold text-[var(--text-secondary)] flex items-start gap-2 leading-tight">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-strong)] mt-1 shrink-0 opacity-40" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

const DEFAULT_CATEGORIES = [
    {
        title: "ONLINE BUSINESS",
        items: ["Hair", "Logistics & Transport", "Clothing", "Food & Drinks", "Phones & Accessories", "Perfumes"]
    },
    {
        title: "HOW TO GO VIRAL",
        items: ["How to post for more likes", "When to post", "Things to post"]
    },
    {
        title: "CONTENT CREATION",
        items: ["Male types of contents", "Female types of contents", "Animal contents", "How to manage and monetize your accounts"]
    },
    {
        title: "BLOGGING",
        items: ["How to be a blogger", "How to earn from blogging", "How to post as a blogger"]
    },
    {
        title: "REAL ESTATE",
        items: ["How to buy and sell properties online", "How to make videos for housing contents", "Property management tips and social media engagements"]
    },
    {
        title: "EDUCATION",
        items: ["How to manage social engagements"]
    },
    {
        title: "EVENT PLANNING",
        items: ["General Event Planning Services"]
    },
    {
        title: "CHURCH & RELIGION",
        items: ["How to go live", "How to grow church pages", "How to advertise for upcoming church events"]
    },
    {
        title: "SPORTS",
        items: ["General Sports Management & Content"]
    }
];
