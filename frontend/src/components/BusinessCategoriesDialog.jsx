import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { ChevronRight } from "lucide-react";

export function BusinessCategoriesDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="text-[var(--accent-primary)] p-0 h-auto font-semibold">
                    View Eligible Businesses
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[var(--text-primary)]">Supported Business Categories</DialogTitle>
                    <DialogDescription>
                        The BUG Launchpad is tailored for these Ghanaian industries.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4 mt-4">
                    <div className="grid md:grid-cols-2 gap-4 pb-8">
                        {CATEGORIES.map((cat, idx) => (
                            <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                <h4 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-xs">{idx + 1}</span>
                                    {cat.title}
                                </h4>
                                <ul className="space-y-1.5">
                                    {cat.items.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                            <ChevronRight className="w-3 h-3 mt-1 text-[var(--accent-text)] shrink-0" />
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

const CATEGORIES = [
    {
        title: "Food & Beverages",
        items: ["Local food vendors (waakye, banku, kenkey, fufu)", "Chop bars & street food", "Catering services", "Juice, sobolo & local drink brands", "Pastry & bakery businesses"]
    },
    {
        title: "Fashion & Beauty",
        items: ["Clothing brands (African wear, streetwear)", "Seamstresses & fashion designers", "Hair salons & barbershops", "Makeup artists", "Skincare & cosmetic brands", "Wig & hair vendors"]
    },
    {
        title: "Agriculture & Agribusiness",
        items: ["Poultry, piggery & livestock farms", "Fish farming (tilapia, catfish)", "Crop farming (cassava, maize, vegetables)", "Organic food sellers", "Agro-input suppliers"]
    },
    {
        title: "Real Estate & Construction",
        items: ["Property sales & rentals", "Land sales", "Real estate agents", "Building materials suppliers", "Interior decoration & furnishing", "Home renovation services"]
    },
    {
        title: "Digital & Online Businesses",
        items: ["Online stores (Instagram shops)", "Social media management services", "Graphic design & branding", "Website development", "Online coaching & training", "Affiliate marketing"]
    },
    {
        title: "Transportation & Logistics",
        items: ["Delivery services (motor & van)", "Car rentals", "Ride services", "Moving & relocation services"]
    },
    {
        title: "Education & Training",
        items: ["Private tutors", "Exam prep centers (WASSCE, BECE)", "Skill training (IT, tailoring, makeup)", "Online courses", "Educational consultants"]
    },
    {
        title: "Events & Entertainment",
        items: ["Event planning & decoration", "MCs, DJs & live bands", "Photography & videography", "Content creators & influencers", "Ticket sales platforms"]
    },
    {
        title: "Retail & Trading",
        items: ["Mini marts & convenience stores", "Phone & electronics sellers", "Household items sellers", "Cosmetics & accessories vendors", "Wholesale & retail traders"]
    },
    {
        title: "Tourism & Hospitality",
        items: ["Hotels & guest houses", "Travel & tour agencies", "Local tourism experiences", "Car hire for tourists", "Airbnb hosts"]
    },
    {
        title: "Professional & Business Services",
        items: ["Business registration services", "Accounting & tax consultants", "Legal services", "Insurance agents", "HR & recruitment services"]
    },
    {
        title: "Creative & Cultural Businesses",
        items: ["Art & craft sellers", "Kente & bead makers", "Cultural wear designers", "Handmade souvenirs", "Local content brands"]
    },
    {
        title: "Faith-Based & Community",
        items: ["Bookshops & religious items", "Gospel event promotions", "Christian/Muslim apparel", "Faith-based training programs"]
    },
    {
        title: "Repair & Technical Services",
        items: ["Phone repairs", "Appliance repairs", "Auto mechanics", "Electricians & plumbers", "Solar installation services"]
    },
    {
        title: "Sports & Athletics",
        items: ["Sports Academies", "Fitness & Personal Training", "Sports Retail", "Sports Scouting & Management", "Sports Facilities & Rentals", "Sports Media & Content", "Recovery & Physiotherapy"]
    }
];
