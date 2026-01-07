import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Check, Truck, TrendingUp, Users, Download, Lock, Smartphone, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Images from Vision Expert
  const IMAGES = {
    hero: "https://images.unsplash.com/photo-1758874385393-3ef15b394a86",
    mockup: "https://images.pexels.com/photos/8533358/pexels-photo-8533358.jpeg",
    logistics: "https://images.unsplash.com/photo-1616757957712-6c8874a8c82b"
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/leads`, { email });
      toast.success("Success! The checklist has been sent to your email.");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurchase = async (tier) => {
    const amountMap = {
        'Starter': 50,
        'Standard VIP': 150,
        'Premium VVIP': 500
    };
    
    toast.info(`Starting secure payment for ${tier}...`);
    
    try {
        // Create mock order
        await axios.post(`${API}/orders`, { 
            tier, 
            amount: amountMap[tier] || 0 
        });
        
        // Simulate payment delay
        setTimeout(() => {
            toast.success("Payment Successful! Downloading your Launchpad...");
        }, 1500);
    } catch (error) {
        toast.error("Could not process order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans">
      
      {/* Navigation - Floating */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 mx-4 mt-4 bg-white/80 backdrop-blur-md border border-[var(--border-light)] rounded-full shadow-sm max-w-5xl md:mx-auto">
        <div className="flex items-center gap-2 font-bold text-lg text-[var(--text-primary)] pl-2">
          <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-[var(--text-primary)]">
            <TrendingUp size={18} />
          </div>
          BUG Agency
        </div>
        <div className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
            <a href="#about" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">About</a>
        </div>
        <Button className="rounded-full bg-[var(--text-primary)] text-white hover:bg-[var(--text-primary)]/90 h-9 px-4 text-sm">
          Get Started
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section flex flex-col items-center justify-center pt-32 pb-20 px-4 md:pt-40 md:pb-32">
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="bg-white/50 backdrop-blur border-[var(--accent-strong)] text-[var(--text-primary)] px-4 py-1.5 rounded-full text-sm font-medium mb-4 animate-in fade-in zoom-in duration-500">
                🚀 #1 Growth Tool for Ghanaian Businesses
            </Badge>
            
            <h1 className="heading-1 mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-100">
                Stop Posting for "Likes". <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-strong)]">
                    Start Posting for Sales.
                </span>
            </h1>
            
            <p className="body-large max-w-2xl mx-auto text-[var(--text-secondary)] mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                The comprehensive digital blueprint to transform your business from "Ghosted" inquiries to consistent revenue using the tools you already have.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom-4 duration-700 delay-300">
                <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="btn-primary min-w-[200px] shadow-lg shadow-green-200/50">
                    Get The Launchpad
                    <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                             </div>
                         ))}
                    </div>
                    <span>Trusted by 500+ GH Businesses</span>
                </div>
            </div>
            
             <div className="mt-16 relative w-full max-w-4xl mx-auto animate-in fade-in duration-1000 delay-500">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-page)] via-transparent to-transparent z-10 h-full w-full pointer-events-none"></div>
                <img 
                    src={IMAGES.hero} 
                    alt="Successful Ghanaian Entrepreneur" 
                    className="rounded-2xl shadow-2xl border border-[var(--border-light)] w-full object-cover h-[300px] md:h-[500px] opacity-90"
                />
            </div>
        </div>
      </section>

      {/* Pain Points Section - The Problem */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="heading-2 mb-4">Does this sound familiar?</h2>
                <p className="body-medium text-[var(--text-secondary)]">You're working hard, but the sales just aren't matching the effort.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "Ghosted Inquiries", icon: <Users className="w-8 h-8 text-red-400"/>, desc: "People ask 'How much?' and then disappear forever." },
                    { title: "Low Visibility", icon: <Smartphone className="w-8 h-8 text-orange-400"/>, desc: "Your WhatsApp status views are stuck and not converting." },
                    { title: "Logistics Nightmares", icon: <Truck className="w-8 h-8 text-yellow-500"/>, desc: "Riders disappointing you and destroying your brand reputation." }
                ].map((item, idx) => (
                    <Card key={idx} className="border-none shadow-none bg-[var(--bg-section)] hover:bg-[var(--accent-wash)] transition-colors duration-300">
                        <CardHeader>
                            <div className="mb-4 bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">
                                {item.icon}
                            </div>
                            <CardTitle className="text-xl">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[var(--text-secondary)]">{item.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      {/* The Analogy - GPS */}
      <section className="py-20 px-4 bg-[var(--text-primary)] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
             <img src={IMAGES.logistics} className="w-full h-full object-cover mix-blend-overlay" alt="Delivery background"/>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
                <Badge className="bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)] mb-6 border-none">The Philosophy</Badge>
                <h2 className="heading-2 text-white mb-6">Not just a Map. <br/> It's a GPS.</h2>
                <p className="body-large text-gray-300 mb-6">
                    Think of BUG Social Media Agency not as a library giving you books (information), but as a <strong>GPS system for a delivery driver</strong>.
                </p>
                <p className="body-medium text-gray-400">
                    A library gives you a map and wishes you luck. The Launchpad tells you exactly which turns to take, how to avoid traffic (logistics issues), and ensures you reach your destination (a sale) as efficiently as possible.
                </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">✕</div>
                        <div>
                            <h4 className="font-bold text-white">The Old Way</h4>
                            <p className="text-sm text-gray-400">Random posting, hoping for viral luck, disorganized rider list.</p>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/20 ml-4 my-2"></div>
                    <div className="flex gap-4 items-start">
                         <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-[var(--text-primary)] flex items-center justify-center shrink-0">✓</div>
                        <div>
                            <h4 className="font-bold text-[var(--accent-primary)]">The Launchpad Way</h4>
                            <p className="text-sm text-gray-300">Strategic 5-post rule, Verified MoMo protocols, "Ghost-Proof" scripts.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Modules/Accordion */}
      <section className="py-24 px-4 bg-[var(--bg-page)]" id="features">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="heading-2 mb-4">Inside The Blueprint</h2>
                <p className="body-medium text-[var(--text-secondary)]">5 Pillars of Ghanaian Business Success</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {[
                    { id: "m1", title: "Module 1: Professionalism on a Budget", content: "Transitioning to WhatsApp Business, setting up catalogs properly, and maintaining consistent brand colors without spending millions." },
                    { id: "m2", title: "Module 2: The WhatsApp Sales Machine", content: "Implementing the '5-Post Rule' for status updates: Hook, Solution, Proof, Behind the Scenes, and Call to Action." },
                    { id: "m3", title: "Module 3: Saveable Content", content: "Focus on educational content and short-form video (15-second Reels/TikToks) using free tools like CapCut." },
                    { id: "m4", title: "Module 4: Logistics Mastery", content: "Managing a list of at least three riders, professional low-cost packaging (brown bags + stamps), and MoMo verification protocols." },
                    { id: "m5", title: "Module 5: 7-Day Growth Challenge", content: "A step-by-step daily task list including status swaps, flash sales, and profit reinvestment." }
                ].map((mod) => (
                    <AccordionItem key={mod.id} value={mod.id} className="border border-[var(--border-light)] rounded-xl px-4 bg-white shadow-sm data-[state=open]:border-[var(--accent-strong)] data-[state=open]:ring-1 data-[state=open]:ring-[var(--accent-strong)] transition-all">
                        <AccordionTrigger className="hover:no-underline py-5 text-left font-semibold text-[var(--text-primary)]">
                            {mod.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-[var(--text-secondary)] pb-6 text-base leading-relaxed">
                            {mod.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-[var(--bg-section)]" id="pricing">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="heading-2 mb-4">Choose Your Launchpad</h2>
                <p className="body-medium text-[var(--text-secondary)]">Investment tiers designed for every stage of business.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
                {/* Normal Tier */}
                <div className="product-card border-[var(--border-light)]">
                    <CardHeader>
                        <CardTitle className="text-xl text-[var(--text-secondary)]">Starter</CardTitle>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-[var(--text-primary)]">50 GHS</span>
                        </div>
                        <CardDescription>Perfect for beginners just starting out.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {["Comprehensive PDF Guide", "'Ghost-Proof' Scripts", "'The Daily 5' Tasks", "30-Day Growth Calendar"].map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                                    <Check className="w-4 h-4 text-[var(--accent-text)]" /> {feat}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full rounded-full border-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-white" onClick={() => handlePurchase('Starter')}>
                            Select Starter
                        </Button>
                    </CardFooter>
                </div>

                {/* Standard Tier - VIP (Highlighted) */}
                <div className="product-card border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)] ring-offset-2 relative transform md:-translate-y-4 z-10 shadow-xl bg-white">
                    <div className="absolute top-0 right-0 bg-[var(--accent-primary)] text-[var(--text-primary)] text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                    <CardHeader>
                        <CardTitle className="text-xl text-[var(--text-primary)] font-bold">Standard (VIP)</CardTitle>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-[var(--text-primary)]">150 GHS</span>
                        </div>
                        <CardDescription>Most successful businesses start here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="font-semibold text-[var(--text-primary)]">Everything in Starter, plus:</li>
                            {["Editable Canva Ad Templates", "30-Day Content Calendar", "Influencer/Supplier Database"].map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                                    <div className="bg-[var(--accent-wash)] p-1 rounded-full"><Check className="w-3 h-3 text-[var(--accent-text)]" /></div> {feat}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <button className="btn-primary w-full" onClick={() => handlePurchase('Standard VIP')}>
                            Get Standard VIP
                        </button>
                    </CardFooter>
                </div>

                {/* Premium Tier */}
                <div className="product-card border-[var(--border-light)]">
                    <CardHeader>
                        <CardTitle className="text-xl text-[var(--text-secondary)]">Premium (VVIP)</CardTitle>
                        <div className="mt-4">
                            <span className="text-4xl font-bold text-[var(--text-primary)]">500+ GHS</span>
                        </div>
                        <CardDescription>For serious scaling and mentorship.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="font-semibold text-[var(--text-primary)]">Everything in Standard, plus:</li>
                            {["Video Masterclass", "Private Community Access", "1-on-1 Strategy Audit"].map((feat, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                                    <Check className="w-4 h-4 text-[var(--accent-text)]" /> {feat}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full rounded-full" onClick={() => handlePurchase('Premium VVIP')}>
                            Select Premium
                        </Button>
                    </CardFooter>
                </div>
            </div>
        </div>
      </section>

      {/* Freebie Lead Magnet */}
      <section className="py-20 px-4 bg-white border-t border-[var(--border-light)]">
        <div className="max-w-3xl mx-auto text-center">
            <div className="bg-[var(--bg-section)] rounded-3xl p-8 md:p-12 border border-[var(--border-light)]">
                <h3 className="heading-3 mb-4">Not ready to buy yet?</h3>
                <p className="body-medium mb-8 text-[var(--text-secondary)]">
                    Get our <span className="font-bold text-[var(--text-primary)]">1-Page Business Checklist</span> for FREE.
                    Start organizing your business today.
                </p>
                <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <Input 
                        type="email" 
                        placeholder="Enter your email address" 
                        className="bg-white border-gray-200 h-12 rounded-full px-6"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit" className="rounded-full bg-[var(--text-primary)] h-12 px-8" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send it to me"}
                    </Button>
                </form>
                <p className="text-xs text-[var(--text-muted)] mt-4">No spam. Unsubscribe anytime.</p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--text-primary)] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="flex items-center gap-2 font-bold text-xl mb-4 justify-center md:justify-start">
                    <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-[var(--text-primary)]">
                        <TrendingUp size={18} />
                    </div>
                    BUG Agency
                </div>
                <p className="text-gray-400 text-sm">Helping Ghanaian businesses scale from likes to sales.</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Terms</a>
                <a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Privacy</a>
                <a href="#" className="hover:text-[var(--accent-primary)] transition-colors">Contact</a>
            </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
            © 2025 BUG Social Media Agency. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
