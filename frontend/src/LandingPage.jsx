import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Check, Truck, TrendingUp, Users, Download, Lock, Smartphone, Star, ArrowRight, Map, Navigation, Radar, ShieldCheck, Zap } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./components/ui/carousel";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [api, setApi] = React.useState(null);

  // Auto-swipe for testimonials
  React.useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 4000); // Swipe every 4 seconds

    return () => clearInterval(intervalId);
  }, [api]);

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

      {/* The Analogy - GPS Redesign */}
      <section className="py-24 px-4 bg-[var(--text-primary)] text-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--accent-primary)] rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[var(--accent-strong)] rounded-full blur-[120px] opacity-10"></div>

        <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <Badge className="bg-white/10 text-[var(--accent-primary)] border-white/20 mb-6 backdrop-blur-sm px-4 py-1.5">
                        <Radar className="w-3 h-3 mr-2 animate-pulse" />
                        Strategic Framework
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                        Stop following maps. <br/>
                        <span className="text-[var(--accent-primary)]">Start using GPS.</span>
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
                        A map tells you where the destination is and leaves you to figure out the traffic. 
                        <strong> BUG Agency is your GPS.</strong> We provide real-time redirection, avoid the "Ghosting" traffic jams, and calculate the fastest route to your next GH¢ 10,000.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-6 mt-12">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="bg-[var(--accent-wash)] p-3 rounded-xl">
                                <Navigation className="w-6 h-6 text-[var(--accent-primary)]" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Live Guidance</h4>
                                <p className="text-sm text-gray-400">Step-by-step scripts for every customer inquiry.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="bg-orange-500/10 p-3 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Traffic Bypass</h4>
                                <p className="text-sm text-gray-400">Proven MoMo protocols to avoid payment delays.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Catchy Visual Dashboard Card */}
                    <div className="bg-[#1a1b1e] rounded-[2rem] border border-white/10 shadow-2xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent"></div>
                        
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">System Status: Active</div>
                        </div>

                        <div className="space-y-8">
                            {/* Comparison Row 1 */}
                            <div className="relative">
                                <div className="flex justify-between text-xs mb-3">
                                    <span className="text-gray-500 uppercase">Old Strategy</span>
                                    <span className="text-red-400">Error 404</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-red-500/40"></div>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-2">"Hoping for viral luck" — Unpredictable results.</p>
                            </div>

                            {/* Comparison Row 2 */}
                            <div className="relative">
                                <div className="flex justify-between text-xs mb-3">
                                    <span className="text-[var(--accent-primary)] uppercase font-bold">The Launchpad</span>
                                    <span className="text-[var(--accent-primary)]">Optimized</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[92%] bg-[var(--accent-primary)] shadow-[0_0_15px_rgba(143,236,120,0.5)] transition-all duration-1000 group-hover:w-[98%]"></div>
                                </div>
                                <div className="flex gap-4 mt-3">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-300">
                                        <Zap className="w-3 h-3 text-[var(--accent-primary)]" /> 5-Post Rule
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-300">
                                        <Zap className="w-3 h-3 text-[var(--accent-primary)]" /> Ghost-Proof
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Navigation UI Element */}
                        <div className="mt-12 p-6 rounded-2xl bg-[var(--accent-primary)] text-[var(--text-primary)] relative transform group-hover:scale-[1.02] transition-transform duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] uppercase font-bold opacity-60">Route Recommendation</div>
                                    <div className="text-lg font-bold">Next Sale: 12 mins</div>
                                </div>
                                <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
                                    <Navigation className="w-6 h-6 rotate-45" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Blur behind the card */}
                    <div className="absolute -z-10 inset-0 translate-x-4 translate-y-4 bg-black/40 rounded-[2rem] blur-xl"></div>
                </div>
            </div>
        </div>
      </section>

      {/* Results Section - Bento Redesign */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div className="max-w-2xl">
                    <Badge className="bg-[var(--accent-wash)] text-[var(--accent-text)] border-[var(--accent-strong)] mb-4 px-4 py-1.5">
                        Performance Metrics
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] leading-tight">
                        We don't sell hope. <br/>
                        <span className="text-[var(--text-secondary)]">We deliver revenue.</span>
                    </h2>
                </div>
                <div className="bg-[var(--bg-section)] p-4 rounded-2xl border border-[var(--border-light)] flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100" alt="client" />
                        ))}
                    </div>
                    <div className="text-sm">
                        <div className="font-bold text-[var(--text-primary)]">500+ Businesses</div>
                        <div className="text-[var(--text-secondary)] text-xs">Verified Growth</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
                {/* Main Metric - Large Bento Card */}
                <div className="md:col-span-8 p-8 md:p-12 rounded-[2.5rem] bg-[var(--text-primary)] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-[var(--accent-primary)] font-mono text-sm uppercase tracking-widest mb-6">Growth Multiplier</div>
                        <div className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter">340%</div>
                        <h4 className="text-2xl font-bold mb-4">Average Revenue Lift</h4>
                        <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                            Our clients see an average 3.4x increase in monthly revenue within 90 days of implementing the full BUG blueprint.
                        </p>
                    </div>
                    <div className="mt-12 flex gap-4 overflow-hidden grayscale opacity-30">
                        {/* Mock Logos for local flair */}
                        {['GhanaFood', 'AccraTech', 'KumasiStyles', 'SME-GH'].map(logo => (
                            <div key={logo} className="px-4 py-2 border border-white/20 rounded-lg text-xs font-bold whitespace-nowrap">{logo}</div>
                        ))}
                    </div>
                </div>

                {/* Secondary Metric - Vertical Bento Card */}
                <div className="md:col-span-4 p-8 rounded-[2.5rem] bg-[var(--accent-primary)] text-[var(--text-primary)] flex flex-col justify-between group">
                    <div>
                        <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center mb-8">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="text-5xl font-bold mb-2">12.5x</div>
                        <h4 className="font-bold text-xl uppercase tracking-tight">Conversion Jump</h4>
                    </div>
                    <p className="mt-8 text-sm font-medium opacity-80 leading-relaxed">
                        Moving from random status updates to our "5-Post Rule" leads to a massive leap in payment completions.
                    </p>
                </div>

                {/* Third Metric - Small Bento Card */}
                <div className="md:col-span-4 p-8 rounded-[2.5rem] border border-[var(--border-light)] bg-[var(--bg-section)] hover:bg-white transition-colors group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <Users className="w-5 h-5 text-[var(--accent-text)]" />
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">Reach</span>
                    </div>
                    <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">50k+</div>
                    <p className="text-sm text-[var(--text-secondary)]">Monthly organic impressions for even the smallest boutiques.</p>
                </div>

                {/* Fourth Metric - Call to Action Bento Card */}
                <div className="md:col-span-8 p-8 rounded-[2.5rem] bg-[var(--accent-wash)] border border-[var(--accent-strong)] flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="flex-1">
                        <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Ready to be our next success story?</h4>
                        <p className="text-[var(--text-secondary)] text-sm">Join 500+ businesses scaling the right way.</p>
                    </div>
                    <Button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="rounded-full bg-[var(--text-primary)] px-8 h-14 group-hover:scale-105 transition-transform">
                        Get Your Blueprint
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
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

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="heading-2 mb-4">What Our Clients Say</h2>
                <p className="body-medium text-[var(--text-secondary)]">Trusted by entrepreneurs across Accra, Kumasi, and beyond.</p>
            </div>

            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full relative"
            >
                <CarouselContent>
                    {[
                        { name: "Akosua Mensah", role: "CEO, Akosua's Boutique", text: "Before BUG, I was getting 100 status views but zero sales. After implementing the 5-post rule, I sold out my entire new stock in 48 hours. The logistics module alone is worth the price!", rating: 5 },
                        { name: "Kwame Boateng", role: "Founder, KB Electronics", text: "The 'Ghost-Proof' scripts changed everything. I used to lose customers when I mentioned the price. Now, I have a clear path to closing sales. Highly recommended for any GH business.", rating: 5 },
                        { name: "Serwaa Appiah", role: "Owner, Serwaa's Skin Care", text: "I finally feel like a professional. My brand colors are consistent, and my riders are actually showing up on time thanks to the verified list. BUG is a lifesaver.", rating: 5 },
                        { name: "Yaw Frimpong", role: "Founder, YF Footwear", text: "I used to struggle with pricing transparency. Now my catalog does the talking. Revenue is up by 40% since joining the BUG community.", rating: 5 },
                        { name: "Efua Asantewaa", role: "Creative Director, Efua's Fabrics", text: "The '5-Post Rule' is magic. I don't feel like I'm spamming my contacts anymore, and the engagement is real and consistent.", rating: 5 },
                        { name: "Kojo Addo", role: "CEO, Gadget Hub GH", text: "The logistics mastery module saved my business reputation. Verified riders make all the difference in Accra traffic. No more disappointed customers.", rating: 5 },
                        { name: "Ama Konadu", role: "Owner, Ama's Kitchen", text: "Transitioning to WhatsApp Business was scary but the BUG blueprint made it so simple. My daily orders have doubled in just two months!", rating: 5 },
                        { name: "Derrick Tetteh", role: "Manager, DT Mobile", text: "Ghosting was my biggest problem. The 'Ghost-Proof' scripts actually work. 80% of my 'How much' inquiries now end in successful payments.", rating: 5 },
                        { name: "Naa Shika", role: "Founder, Shika's Jewelry", text: "I love the Canva ad templates. My statuses look so professional now, and I'm getting customers from Kumasi and Takoradi too!", rating: 5 },
                        { name: "Prince Osei", role: "Owner, P.O. Groceries", text: "The 7-Day Growth Challenge gave me the kickstart I needed. BUG is the real deal for GH SMEs looking to scale without ads.", rating: 5 },
                        { name: "Abena Boateng", role: "CEO, Abena's Accessories", text: "I used to post randomly and hope for the best. Now I have a strategy. My followers are actually buying, not just liking my posts.", rating: 5 },
                        { name: "Ekow Blankson", role: "Founder, Ekow's Electronics", text: "The supply chain tips in the Standard tier are gold. I've found better suppliers and significantly reduced my operational costs.", rating: 5 },
                        { name: "Zainab Issah", role: "Owner, Zee's Modest Wear", text: "The community support in the Premium tier is amazing. It's so good to be around other GH entrepreneurs who truly get the struggle.", rating: 5 }
                    ].map((testimonial, i) => (
                        <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                            <Card className="h-full border border-[var(--border-light)] hover:shadow-lg transition-shadow bg-[var(--bg-section)] mx-1">
                                <CardHeader>
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-[var(--text-primary)] italic mb-6">"{testimonial.text}"</p>
                                </CardHeader>
                                <CardFooter className="flex items-center gap-4 border-t border-[var(--border-light)] pt-6">
                                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[var(--text-primary)] font-bold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[var(--text-primary)] text-sm">{testimonial.name}</div>
                                        <div className="text-xs text-[var(--text-secondary)]">{testimonial.role}</div>
                                    </div>
                                </CardFooter>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="flex justify-center gap-4 mt-8">
                    <CarouselPrevious className="static translate-y-0" />
                    <CarouselNext className="static translate-y-0" />
                </div>
            </Carousel>
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
                        <Button 
                            variant="outline" 
                            className="w-full rounded-full border-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-white"
                            onClick={() => window.open('https://wa.me/233000000000?text=I%20am%20interested%20in%20the%20Premium%20VVIP%20tier', '_blank')}
                        >
                            Talk to an Expert
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

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-[var(--bg-page)] border-t border-[var(--border-light)]">
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
                <p className="body-medium text-[var(--text-secondary)]">Everything you need to know about the BUG Launchpad.</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {[
                    { q: "How soon will I see results?", a: "Many of our clients see an increase in inquiries within the first 7 days of applying the '5-Post Rule' and optimizing their WhatsApp Business profile." },
                    { q: "Is this for new or existing businesses?", a: "Both! If you're just starting, it saves you months of trial and error. If you're already selling, it helps you scale and professionalize your operations." },
                    { q: "Do I need to pay for ads?", a: "No. The Launchpad focuses on organic growth and maximizing the tools you already have (WhatsApp, Instagram, TikTok) without spending a pesewa on ads." },
                    { q: "What happens after I purchase?", a: "You'll receive an instant download link for the PDF guide and templates. If you chose the Standard or Premium tiers, our team will reach out within 24 hours to set up your bonuses." },
                    { q: "Is there support if I get stuck?", a: "Yes! Premium members get access to our private community and 1-on-1 strategy audits. We're here to ensure you succeed." }
                ].map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border border-[var(--border-light)] rounded-xl px-4 bg-white shadow-sm transition-all">
                        <AccordionTrigger className="hover:no-underline py-5 text-left font-semibold text-[var(--text-primary)]">
                            {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-[var(--text-secondary)] pb-6 text-base leading-relaxed">
                            {faq.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </section>

      {/* About Section - Meet the Agency */}
      <section className="py-24 px-4 bg-white" id="about">
        <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-[var(--accent-primary)] rounded-full -z-10 opacity-50 blur-2xl"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" 
                        alt="BUG Agency Team" 
                        className="rounded-3xl shadow-2xl border border-[var(--border-light)]"
                    />
                    <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-[var(--border-light)] max-w-[200px]">
                        <p className="text-sm font-bold text-[var(--text-primary)]">"Our mission is to empower 10,000 Ghanaian businesses by 2030."</p>
                    </div>
                </div>
                <div>
                    <Badge variant="outline" className="mb-6 border-[var(--accent-strong)] text-[var(--accent-strong)]">Our Story</Badge>
                    <h2 className="heading-2 mb-6">Built by Entrepreneurs, For Entrepreneurs</h2>
                    <p className="body-large text-[var(--text-secondary)] mb-6">
                        BUG Social Media Agency started with a simple observation: Ghanaian business owners are incredibly hardworking, but many are struggling to translate that hard work into online sales.
                    </p>
                    <p className="body-medium text-[var(--text-secondary)] mb-8">
                        We spent 3 years testing strategies in the local market—figuring out exactly what makes a customer in Accra click "Pay" and why they ghost in the middle of a chat. The result is **The Launchpad**: a proven system tailored for the unique challenges of the Ghanaian digital landscape.
                    </p>
                    <div className="flex gap-4">
                        <Button className="rounded-full bg-[var(--text-primary)] px-8">Read Our Full Story</Button>
                        <Button variant="outline" className="rounded-full px-8">Our Team</Button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--text-primary)] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 font-bold text-2xl mb-6">
                    <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-[var(--text-primary)]">
                        <TrendingUp size={22} />
                    </div>
                    BUG Agency
                </div>
                <p className="text-gray-400 max-w-sm mb-6">
                    Helping Ghanaian businesses transition from "Ghosted" inquiries to consistent revenue using strategic social media blueprints.
                </p>
                <div className="flex gap-4">
                    {['Instagram', 'Twitter', 'LinkedIn', 'Facebook'].map((social) => (
                        <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[var(--accent-primary)] hover:text-[var(--text-primary)] transition-all">
                            <span className="sr-only">{social}</span>
                            <div className="w-5 h-5 bg-gray-400 rounded-sm"></div> {/* Placeholder icon */}
                        </a>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="font-bold mb-6 text-white uppercase tracking-wider text-sm">Quick Links</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                    <li><a href="#features" className="hover:text-white transition-colors">The Launchpad</a></li>
                    <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Tiers</a></li>
                    <li><a href="#about" className="hover:text-white transition-colors">Our Story</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold mb-6 text-white uppercase tracking-wider text-sm">Contact Us</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                    <li>Accra, Ghana</li>
                    <li>hello@bugagency.gh</li>
                    <li>+233 (0) 50 000 0000</li>
                    <li className="pt-4 font-bold text-white">Mon - Fri: 9am - 6pm</li>
                </ul>
            </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2025 BUG Social Media Agency. All rights reserved.</p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
                <a href="#" className="hover:text-white">Refund Policy</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
