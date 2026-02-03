import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { Check, Truck, TrendingUp, Users, Download, Lock, Smartphone, Star, ArrowRight, Map, Navigation, Radar, ShieldCheck, Zap, Activity, Sparkles, PlayCircle, Flag, Layers, Gift, HelpCircle, Globe, Loader2, Package as PackageIcon } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./components/ui/carousel";
import { toast } from "sonner";
import { PurchaseDialog } from "./components/PurchaseDialog";
import { BusinessCategoriesDialog } from "./components/BusinessCategoriesDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./components/ui/sheet";
import { supabase } from './lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
// import { usePaystackPayment } from 'react-paystack'; // Switched to Native for reliability

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const API = `${BACKEND_URL}/api`;

const TransformHeadline = ({ content }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative inline-block"
            >
                <span className="text-lg sm:text-2xl md:text-3xl font-medium text-gray-400 italic tracking-wider">
                    {content?.hero_small_text || 'Stop Posting for "Likes".'}
                </span>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.6, delay: 1.2, ease: "easeInOut" }}
                    className="absolute top-1/2 left-0 h-[3px] bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.8,
                    delay: 1.8,
                    type: "spring",
                    stiffness: 100
                }}
                className="flex flex-col items-center"
            >
                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
                    {content?.hero_title_row1 || 'Start Posting for'}
                </span>
                <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-strong)] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                    {content?.hero_title_accent || 'Sales.'}
                </span>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 4 }}
                    className="absolute -inset-8 bg-[var(--accent-primary)]/10 blur-3xl rounded-full -z-10"
                />
            </motion.div>
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [api, setApi] = React.useState(null);
    const [siteContent, setSiteContent] = useState({});
    const [packages, setPackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(true);

    // Purchase Dialog State
    const [purchaseOpen, setPurchaseOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState("Starter");
    const [selectedAmount, setSelectedAmount] = useState(50);
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [tempPaymentData, setTempPaymentData] = useState(null);
    const [preFlightOrderId, setPreFlightOrderId] = useState(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const orderRef = React.useRef(null);
    const dataRef = React.useRef(null);
    const pkgRef = React.useRef(null);

    // Keep refs in sync with state
    useEffect(() => { orderRef.current = preFlightOrderId; }, [preFlightOrderId]);
    useEffect(() => { dataRef.current = tempPaymentData; }, [tempPaymentData]);
    useEffect(() => { pkgRef.current = selectedPackageId; }, [selectedPackageId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch site content
                const { data: contentData, error: contentError } = await supabase.from('site_content').select('*');
                if (contentError) throw contentError;
                const contentMap = {};
                contentData?.forEach(item => {
                    if (item.key.includes('_items')) {
                        try {
                            contentMap[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                        } catch (e) {
                            contentMap[item.key] = item.value;
                        }
                    } else {
                        contentMap[item.key] = item.value;
                    }
                });
                setSiteContent(contentMap);

                // Fetch packages
                const { data: pkgData, error: pkgError } = await supabase
                    .from('packages')
                    .select('*')
                    .order('order_index', { ascending: true });
                if (pkgError) throw pkgError;
                setPackages(pkgData || []);

                // Fetch Categories (Business Types)
                console.log("Fetching business categories...");
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name', { ascending: true });

                if (catError) {
                    console.error("Error fetching categories:", catError);
                    toast.error(`Database Error: ${catError.message}. Using fallback categories.`);
                }

                if (!catData || catData.length === 0) {
                    console.log("No categories found in DB or error occurred. Using fallbacks...");
                    const fallbacks = [
                        { id: 'f1', name: 'Real Estate' },
                        { id: 'f2', name: 'E-commerce' },
                        { id: 'f3', name: 'Logistics' },
                        { id: 'f4', name: 'Local Business' }
                    ];
                    setCategories(fallbacks);
                } else {
                    console.log("Categories loaded from DB:", catData.length);
                    setCategories(catData);
                }

            } catch (err) {
                console.error("Error fetching initial data:", err);
                // Convert object error to string for toast
                const errMsg = err.message || JSON.stringify(err);
                toast.error(`Initialization Error: ${errMsg}`);
            } finally {
                setLoadingPackages(false);
                setLoadingCategories(false);
            }
        };
        fetchData();
    }, []);

    // Auto-swipe for testimonials
    useEffect(() => {
        if (!api) return;

        const intervalId = setInterval(() => {
            api.scrollNext();
        }, 4000); // Swipe every 4 seconds

        return () => clearInterval(intervalId);
    }, [api]);

    const handlePurchase = (id, tier, amount) => {
        setSelectedPackageId(id);
        setSelectedTier(tier);
        setSelectedAmount(amount);
        setPurchaseOpen(true);
    };

    // Images from Vision Expert
    const IMAGES = {
        hero: "/Ghana-Starting-Up.jpg",
        mockup: "https://images.pexels.com/photos/8533358/pexels-photo-8533358.jpeg",
        logistics: "https://images.unsplash.com/photo-1627634777217-c864268db30c"
    };

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Also store lead in Supabase for better tracking
            await supabase.from('leads').insert([{ email }]);
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

    const handlePaymentSuccess = useCallback(async (reference) => {
        const currentOrderId = orderRef.current;
        const currentData = dataRef.current;

        try {
            console.log("🔥 [STEP 1] handlePaymentSuccess TRIGGERED");
            console.log(">> Ref from Paystack:", reference);
            console.log(">> Order ID:", currentOrderId);

            const finalRef = reference.reference || reference.trans || reference.transaction || "UNKNOWN";

            if (!currentOrderId) {
                console.error("❌ [CRITICAL] preFlightOrderId is NULL. Minimal redirect.");
                navigate('/success', {
                    state: { reference: finalRef, businessType: currentData?.businessType }
                });
                return;
            }

            // 2. Update the order to 'paid'
            console.log("🔥 [STEP 2] Updating order to PAID...");
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    status: 'paid',
                    reference: finalRef
                })
                .eq('id', currentOrderId);

            if (updateError) {
                console.error("❌ [STEP 2 FAIL] Error updating order:", updateError);
            }

            console.log("✅ [STEP 2] Redirecting now...");
            navigate('/success', {
                state: {
                    orderId: currentOrderId,
                    reference: finalRef,
                    businessType: currentData?.businessType
                }
            });

        } catch (error) {
            console.error("💥 Redirect logic failed:", error);
            const fallbackRef = reference.reference || reference.trans || reference.transaction || "N/A";
            navigate('/success', { state: { reference: fallbackRef } });
        }
    }, [navigate]);

    const onPaystackClose = () => {
        console.log("PAYSTACK CLOSED CALLBACK");
        toast.info("Payment cancelled.");
        setTempPaymentData(null);
        setPreFlightOrderId(null);
    };

    const launchNativePaystack = (orderId, formData, amount) => {
        if (!window.PaystackPop) {
            console.error("❌ Paystack script not loaded");
            toast.error("Payment system failed to load. Please refresh.");
            return;
        }

        console.log("🚀 Launching Native Paystack for Order:", orderId);

        try {
            const handler = window.PaystackPop.setup({
                key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
                email: formData.email,
                amount: amount * 100,
                currency: 'GHS',
                ref: orderId,
                metadata: {
                    custom_fields: [
                        { display_name: "Name", variable_name: "name", value: formData.name },
                        { display_name: "Business Type", variable_name: "business_type", value: formData.businessType }
                    ]
                },
                callback: (response) => {
                    console.log("✅ Native Success Callback:", response);
                    handlePaymentSuccess(response);
                },
                onClose: () => {
                    onPaystackClose();
                }
            });
            handler.openIframe();
        } catch (err) {
            console.error("💥 Native Paystack Launch Failed:", err);
            toast.error("Couldn't open payment window.");
        }
    };

    const handleStartPayment = async (formData) => {
        console.log("🚀 PRE-FLIGHT: Creating pending order...");
        setIsCreatingOrder(true);

        try {
            const orderPayload = {
                user_email: formData.email,
                package_id: selectedPackageId,
                amount: selectedAmount,
                status: 'pending', // Starts as pending
                reference: 'PENDING_' + (new Date()).getTime() // Temp reference
            };

            const { data, error } = await supabase
                .from('orders')
                .insert([orderPayload])
                .select()
                .single();

            if (error) {
                console.error("❌ Pre-flight failed:", error);
                if (error.code === '42501') {
                    toast.error("Security Blocked: Your Supabase RLS policies are preventing order creation. Please run the Nuclear Fix SQL.");
                } else {
                    toast.error(`Order Creation Failed: ${error.message}`);
                }
                return;
            }

            console.log("✅ Pre-flight order created:", data.id);
            setPreFlightOrderId(data.id);
            setTempPaymentData(formData);

            // Launch Native Paystack Immediately
            launchNativePaystack(data.id, formData, selectedAmount);

            setPurchaseOpen(false);

        } catch (err) {
            console.error("Critical pre-flight error:", err);
            toast.error("Checkout failed to initialize.");
        } finally {
            setIsCreatingOrder(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans overflow-x-hidden">

            {/* Navigation - Premium Redesign */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-3 md:p-4 mx-2 md:mx-4 mt-4 md:mt-6 bg-white/95 backdrop-blur-lg border border-[var(--border-light)] rounded-full shadow-lg max-w-6xl lg:mx-auto"
            >
                {/* Logo */}
                <div className="flex items-center gap-2 font-bold text-base md:text-lg text-[var(--text-primary)] pl-2">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-strong)] rounded-full flex items-center justify-center text-[var(--text-primary)] shadow-md">
                        <TrendingUp size={20} strokeWidth={2.5} />
                    </div>
                    <span className="hidden sm:inline font-black tracking-tight">BUG Agency</span>
                    <span className="sm:hidden font-black">BUG</span>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden lg:flex gap-4 items-center">
                    {[
                        { label: 'Modules', href: '#features' },
                        { label: 'Pricing', href: '#pricing' },
                        { label: 'About', href: '#about' }
                    ].map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="relative px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                        >
                            {link.label}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent-primary)] group-hover:w-full transition-all duration-300" />
                        </a>
                    ))}
                </div>

                {/* CTA + Mobile Menu */}
                <div className="flex items-center gap-2">
                    {/* Get Started Button */}
                    <motion.button
                        onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                        className="hidden sm:flex items-center gap-2 rounded-full bg-[var(--text-primary)] text-white hover:bg-gradient-to-r hover:from-[var(--accent-primary)] hover:to-[var(--accent-strong)] hover:text-[var(--text-primary)] h-10 px-6 text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started
                        <ArrowRight size={16} />
                    </motion.button>

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden rounded-full hover:bg-[var(--accent-wash)]">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full bg-white">
                            <SheetHeader className="border-b border-[var(--border-light)] pb-6">
                                <SheetTitle className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[var(--text-primary)] rounded-xl flex items-center justify-center">
                                        <TrendingUp size={20} strokeWidth={2.5} className="text-[var(--accent-primary)]" />
                                    </div>
                                    <span className="text-2xl font-black text-[var(--text-primary)]">BUG Agency</span>
                                </SheetTitle>
                            </SheetHeader>

                            {/* Navigation Links */}
                            <nav className="flex flex-col gap-1 mt-8">
                                {[
                                    { label: 'Modules', href: '#features' },
                                    { label: 'Pricing', href: '#pricing' },
                                    { label: 'About', href: '#about' }
                                ].map((link, idx) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="group relative text-2xl font-bold text-[var(--text-primary)] hover:text-[var(--accent-text)] transition-colors py-4 px-2"
                                    >
                                        <span className="relative z-10">{link.label}</span>
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[var(--accent-primary)] group-hover:h-full transition-all duration-300 rounded-full" />
                                    </a>
                                ))}
                            </nav>

                            {/* CTA Button */}
                            <div className="absolute bottom-8 left-6 right-6">
                                <button
                                    onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                                    className="w-full rounded-full bg-[var(--text-primary)] text-white hover:bg-[var(--text-primary)]/90 py-4 text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Get Started
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </motion.nav>

            {/* Hero Section - Redesigned */}
            <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 md:px-6 overflow-hidden pt-20 md:pt-24 pb-12">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={IMAGES.hero}
                        alt="Ghanaian Business Startup"
                        className="w-full h-full object-cover brightness-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[var(--bg-page)]"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center h-full mt-12 space-y-12 md:space-y-16">
                    <motion.h1
                        className="w-full text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-tight tracking-tight pt-2 md:pt-8 px-2"
                    >
                        <TransformHeadline content={siteContent} />
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto px-4"
                    >
                        <motion.button
                            onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                            className="group relative w-full sm:min-w-[280px] bg-[var(--text-primary)] text-white px-8 py-5 rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--accent-primary)]/30"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Animated gradient background on hover */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-strong)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                            />

                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-xl bg-[var(--accent-primary)]/50 -z-10 transition-opacity duration-300" />

                            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-[var(--text-primary)] transition-colors duration-300">
                                {siteContent.hero_cta_text || "Get The Launchpad"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                        </motion.button>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 2.5 }}
                            className="flex flex-col sm:flex-row items-center gap-3 text-white"
                        >
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full bg-white border-4 border-black/20 flex items-center justify-center overflow-hidden shadow-lg">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="w-4 h-4 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-white drop-shadow-md">Trusted by 500+ GH Businesses</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Pain Points Section - The Problem */}
            <section className="py-20 px-4 md:px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="heading-2 mb-4">{siteContent.pain_title || "Does this sound familiar?"}</h2>
                        <p className="body-medium text-[var(--text-secondary)]">{siteContent.pain_desc || "You're working hard, but the sales just aren't matching the effort."}</p>
                    </div>

                    {/* Desktop: Grid Layout */}
                    <div className="hidden md:grid md:grid-cols-3 gap-8">
                        {(siteContent.pain_items && siteContent.pain_items.length > 0 ? siteContent.pain_items : [
                            { title: "Ghosted Inquiries", desc: "People ask 'How much?' and then disappear forever." },
                            { title: "Low Visibility", desc: "Your WhatsApp status views are stuck and not converting." },
                            { title: "Logistics Nightmares", desc: "Riders disappointing you and destroying your brand reputation." }
                        ]).map((item, idx) => (
                            <Card key={idx} className="border-none shadow-none bg-[var(--bg-section)] hover:bg-[var(--accent-wash)] transition-colors duration-300">
                                <CardHeader>
                                    <div className="mb-4 bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm">
                                        {idx === 0 ? <Users className="w-8 h-8 text-red-400" /> : idx === 1 ? <Smartphone className="w-8 h-8 text-orange-400" /> : <Truck className="w-8 h-8 text-yellow-500" />}
                                    </div>
                                    <CardTitle className="text-xl">{item.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-[var(--text-secondary)]">{item.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Mobile: Horizontal Scroll */}
                    <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                        <div className="flex gap-4 pb-4">
                            {(siteContent.pain_items && siteContent.pain_items.length > 0 ? siteContent.pain_items : [
                                { title: "Ghosted Inquiries", desc: "People ask 'How much?' and then disappear forever." },
                                { title: "Low Visibility", desc: "Your WhatsApp status views are stuck and not converting." },
                                { title: "Logistics Nightmares", desc: "Riders disappointing you and destroying your brand reputation." }
                            ]).map((item, idx) => (
                                <Card key={idx} className="flex-shrink-0 w-[85vw] max-w-[340px] border-2 border-[var(--border-light)] shadow-lg bg-white">
                                    <CardHeader>
                                        <div className="mb-4 bg-[var(--bg-section)] w-14 h-14 rounded-2xl flex items-center justify-center">
                                            {idx === 0 ? <Users className="w-8 h-8 text-red-400" /> : idx === 1 ? <Smartphone className="w-8 h-8 text-orange-400" /> : <Truck className="w-8 h-8 text-yellow-500" />}
                                        </div>
                                        <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-[var(--text-secondary)] text-base leading-relaxed">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-center gap-2 mt-4">
                            {(siteContent.pain_items?.length || 3) > 0 && [...Array(siteContent.pain_items?.length || 3)].map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-[var(--border-light)]" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* The Analogy - GPS Redesign */}
            {/* Strategic Framework Section */}
            <section className="py-24 px-4 md:px-6 bg-[var(--text-primary)] text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                </div>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-[var(--accent-primary)] rounded-full blur-[140px] pointer-events-none"
                ></motion.div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Badge className="bg-white/10 text-[var(--accent-primary)] border-white/20 mb-6 backdrop-blur-md px-5 py-2 ring-1 ring-white/10 shadow-lg">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="mr-2">
                                    <Radar className="w-4 h-4" />
                                </motion.div>
                                Strategic Framework
                            </Badge>
                            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.9] mb-8 tracking-tighter">
                                {siteContent.strat_title ? (
                                    <span dangerouslySetInnerHTML={{ __html: siteContent.strat_title.replace('GPS.', '<span class="text-[var(--accent-primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-strong)]">GPS.</span>') }}></span>
                                ) : (
                                    <>Stop following maps. <br /> <span className="text-[var(--accent-primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-strong)]">Start using GPS.</span></>
                                )}
                            </h2>
                            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-xl font-medium">
                                {siteContent.strat_desc || "A static map leaves you stuck in traffic. BUG Agency is your Live GPS. We provide real-time redirection, bypass the \"Ghosting\" jams, and calculate the fastest route to your next GH¢ 10k."}
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6 mt-12">
                                {[
                                    { icon: <Navigation className="w-6 h-6" />, title: "Live Guidance", desc: "Step-by-step scripts for every inquiry.", delay: 0.2, color: "bg-[var(--accent-wash)] text-[var(--accent-text)]" },
                                    { icon: <ShieldCheck className="w-6 h-6" />, title: "Traffic Bypass", desc: "Proven MoMo protocols for payments.", delay: 0.4, color: "bg-orange-500/10 text-orange-400" }
                                ].map((benefit, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: benefit.delay }}
                                        className="flex items-start gap-4 p-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-[var(--accent-primary)]/50 transition-colors"
                                    >
                                        <div className={`${benefit.color} p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-lg`}>
                                            {benefit.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">{benefit.title}</h4>
                                            <p className="text-sm text-gray-400 leading-snug">{benefit.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, type: "spring" }}
                            className="relative"
                        >
                            {/* Premium Cyber-Dashboard */}
                            <div className="bg-[#0f1115]/80 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[-20px_20px_60px_rgba(0,0,0,0.5)] p-8 sm:p-10 relative overflow-hidden group">
                                {/* Moving Scan Line */}
                                <motion.div
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-primary)]/30 to-transparent pointer-events-none z-20"
                                />

                                <div className="flex justify-between items-start mb-12">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2 mb-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                        </div>
                                        <div className="text-[10px] font-black font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Scale Core v4.0</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--accent-primary)] uppercase tracking-tighter">
                                            <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse shadow-[0_0_8px_var(--accent-primary)]"></span>
                                            Satellite Link: Active
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    {/* Old Strategy Comparison */}
                                    <div className="relative">
                                        <div className="flex justify-between text-[11px] mb-3 font-black uppercase tracking-widest text-gray-500">
                                            <span>Old Strategy</span>
                                            <span className="text-red-400">Inefficient / High Drop-off</span>
                                        </div>
                                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '33%' }}
                                                transition={{ duration: 1.5, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-red-500/40 to-red-500/60"
                                            ></motion.div>
                                        </div>
                                        <p className="text-[12px] text-gray-400 mt-4 italic font-medium">"Hoping for viral luck" — 70% customer ghosting rate.</p>
                                    </div>

                                    {/* BUG Launchpad Comparison */}
                                    <div className="relative">
                                        <div className="flex justify-between text-[11px] mb-3 font-black uppercase tracking-widest text-[var(--accent-primary)]">
                                            <span>The Launchpad GPS</span>
                                            <span className="animate-pulse shadow-sm">Real-time Optimization</span>
                                        </div>
                                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 ring-2 ring-[var(--accent-primary)]/20 shadow-lg">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '94%' }}
                                                transition={{ duration: 1.5, delay: 0.8 }}
                                                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-strong)] relative"
                                            >
                                                <motion.div
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                                />
                                            </motion.div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-5">
                                            <div className="flex items-center gap-2 text-[11px] font-black text-white bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                                                <Zap className="w-3.5 h-3.5 text-[var(--accent-primary)]" fill="currentColor" /> 5-Post Logic
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-black text-white bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                                                <Users className="w-3.5 h-3.5 text-[var(--accent-primary)]" fill="currentColor" /> Ghost-Proof
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic Navigation Box */}
                                <motion.div
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="mt-14 p-8 rounded-[2rem] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-strong)] text-[var(--text-primary)] shadow-[0_15px_40px_rgba(0,0,0,0.3)] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Radar size={80} strokeWidth={1} />
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <div className="text-[11px] uppercase font-black tracking-widest opacity-70 mb-1">Route Recalculation</div>
                                            <div className="text-3xl font-black tracking-tighter leading-none">Next Sale: 12m</div>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: 45, x: [0, 5, 0], y: [0, -5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center shadow-inner"
                                        >
                                            <Navigation className="w-8 h-8" fill="currentColor" />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Outer Glow Effects */}
                            <div className="absolute -z-10 -inset-10 bg-[var(--accent-primary)]/10 blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[var(--accent-strong)]/20 rounded-full blur-[60px] animate-pulse"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Results Section - Bento Redesign */}
            <section className="py-24 px-4 md:px-6 bg-white overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8"
                    >
                        <div className="max-w-2xl">
                            <Badge className="bg-[var(--accent-wash)] text-[var(--accent-text)] border-[var(--accent-strong)] mb-4 px-4 py-1.5 ring-1 ring-[var(--accent-strong)]/20 shadow-sm transition-all hover:shadow-md">
                                <Activity className="w-3.5 h-3.5 mr-2" />
                                Performance Metrics
                            </Badge>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] leading-tight tracking-tight">
                                {siteContent.metrics_title ? (
                                    <span dangerouslySetInnerHTML={{ __html: siteContent.metrics_title.replace('revenue.', '<span class="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">revenue.</span>') }}></span>
                                ) : (
                                    <>We don't sell hope. <br className="hidden sm:block" /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">We deliver revenue.</span></>
                                )}
                            </h2>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-[var(--bg-section)] p-4 rounded-2xl border border-[var(--border-light)] flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm ring-1 ring-black/5">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} className="w-full h-full" alt="client" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <div className="font-black text-[var(--text-primary)] tracking-tight">500+ Businesses</div>
                                <div className="text-[var(--text-secondary)] text-xs font-semibold">Verified Growth</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="grid md:grid-cols-12 gap-6">
                        {(siteContent.metrics_items && siteContent.metrics_items.length > 0 ? siteContent.metrics_items : [
                            { value: "340%", label: "Average Revenue Lift" },
                            { value: "12.5x", label: "Conversion Jump" },
                            { value: "50k+", label: "Market Reach" }
                        ]).map((metric, idx) => {
                            if (idx === 0) return (
                                <motion.div key={idx} className="md:col-span-8 p-6 sm:p-8 md:p-12 rounded-[2.5rem] bg-[var(--text-primary)] text-white relative overflow-hidden group border border-white/5 shadow-2xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/10 blur-[100px] -z-10 group-hover:bg-[var(--accent-primary)]/20 transition-colors duration-500"></div>
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-500 hidden sm:block">
                                        <TrendingUp size={160} strokeWidth={1} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[var(--accent-primary)] font-mono text-xs uppercase tracking-widest mb-6">
                                            <Sparkles size={12} /> Growth Multiplier
                                        </div>
                                        <div className="text-6xl sm:text-7xl md:text-9xl font-black mb-4 md:mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                                            {metric.value}
                                        </div>
                                        <h4 className="text-xl sm:text-2xl font-bold mb-4 tracking-tight">{metric.label}</h4>
                                        <p className="text-gray-400 max-w-md text-base sm:text-lg leading-relaxed font-medium">
                                            Our clients see an average 3.4x increase in monthly revenue within 90 days of implementing the full BUG blueprint.
                                        </p>
                                    </div>
                                </motion.div>
                            );
                            if (idx === 1) return (
                                <motion.div key={idx} className="md:col-span-4 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-strong)] text-[var(--text-primary)] flex flex-col justify-between group shadow-xl hover:shadow-2xl transition-all duration-500">
                                    <div>
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-sm">
                                            <Zap className="w-7 h-7" fill="currentColor" />
                                        </div>
                                        <div className="text-5xl sm:text-6xl font-black mb-2 tracking-tighter">{metric.value}</div>
                                        <h4 className="font-black text-xl uppercase tracking-tighter leading-none">{metric.label}</h4>
                                    </div>
                                    <div className="mt-8">
                                        <div className="h-1 w-12 bg-black/20 rounded-full mb-4"></div>
                                        <p className="text-base font-bold leading-tight opacity-90 tracking-tight">
                                            Moving from random status updates to our "5-Post Rule" leads to a massive leap in payment completions.
                                        </p>
                                    </div>
                                </motion.div>
                            );
                            return (
                                <motion.div key={idx} className="md:col-span-4 p-8 rounded-[2.5rem] border border-[var(--border-light)] bg-[var(--bg-section)] hover:bg-white transition-all duration-500 group shadow-sm hover:shadow-xl">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-[var(--border-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Users className="w-6 h-6 text-[var(--accent-text)]" />
                                        </div>
                                        <span className="font-black text-[var(--text-primary)] text-lg tracking-tight">{metric.label}</span>
                                    </div>
                                    <div className="text-5xl font-black text-[var(--text-primary)] mb-2 tracking-tighter">{metric.value}</div>
                                    <p className="text-sm text-[var(--text-secondary)] font-semibold leading-relaxed">Monthly organic impressions for even the smallest Ghanaian boutiques.</p>
                                </motion.div>
                            );
                        })}

                        {/* Fourth Metric - Call to Action Bento Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="md:col-span-8 p-8 sm:p-10 rounded-[2.5rem] bg-[var(--accent-wash)] border-2 border-[var(--accent-strong)] flex flex-col md:flex-row items-center justify-between gap-8 group shadow-lg hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Ready to be our next success story?</h4>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-[var(--text-secondary)] font-bold">
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent-strong)] animate-pulse"></div>
                                    Join 500+ businesses scaling the right way.
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                                className="group/btn relative w-full md:w-auto rounded-full bg-[var(--text-primary)] text-white px-10 h-16 flex items-center justify-center font-black transition-all shadow-xl hover:shadow-[var(--accent-primary)]/40 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Get Your Blueprint
                                    <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-strong)] opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></span>
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Modules/Accordion - Blueprint Roadmap Redesign */}
            <section className="py-24 px-4 md:px-6 bg-[var(--bg-page)] relative overflow-hidden" id="features">
                <div className="max-w-4xl mx-auto relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-20"
                    >
                        <Badge className="bg-[var(--accent-wash)] text-[var(--accent-text)] border-[var(--accent-strong)] mb-4 px-4 py-1.5 shadow-sm">
                            <Layers className="w-4 h-4 mr-2" />
                            Curriculum Roadmap
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tight">
                            {siteContent.blueprint_title ? (
                                <span dangerouslySetInnerHTML={{ __html: siteContent.blueprint_title.replace('Blueprint', '<span class="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-strong)]">Blueprint</span>') }}></span>
                            ) : (
                                <>Inside The <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-strong)]">Blueprint</span></>
                            )}
                        </h2>
                        <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium">{siteContent.blueprint_subtitle || "5 Pillars of Ghanaian Business Success"}</p>
                    </motion.div>

                    <div className="relative">
                        {/* Vertical Roadmap Line */}
                        <div className="absolute left-[21px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[var(--accent-strong)] via-[var(--accent-wash)] to-transparent hidden sm:block opacity-30"></div>

                        <Accordion type="single" collapsible className="w-full space-y-6">
                            {(siteContent.blueprint_items && siteContent.blueprint_items.length > 0 ? siteContent.blueprint_items : [
                                { step: "01", title: "Professionalism on a Budget", content: "Transitioning to WhatsApp Business, setting up catalogs properly, and maintaining consistent brand colors without spending millions." },
                                { step: "02", title: "The WhatsApp Sales Machine", content: "Implementing the '5-Post Rule' for status updates: Hook, Solution, Proof, Behind the Scenes, and Call to Action." },
                                { step: "03", title: "Saveable Content Strategies", content: "Focus on educational content and short-form video (15-second Reels/TikToks) using free tools like CapCut." },
                                { step: "04", title: "Logistics & Payment Mastery", content: "Managing riders, professional low-cost packaging (brown bags + stamps), and MoMo verification protocols." },
                                { step: "05", title: "7-Day Growth Challenge", content: "A step-by-step daily task list including status swaps, flash sales, and profit reinvestment." }
                            ]).map((mod, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                >
                                    <AccordionItem
                                        value={`m-${idx}`}
                                        className="border border-[var(--border-light)] rounded-[2rem] px-6 bg-white shadow-sm data-[state=open]:shadow-xl data-[state=open]:border-[var(--accent-strong)] transition-all duration-300 group overflow-hidden"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-6 text-left group-data-[state=open]:pb-4">
                                            <div className="flex items-center gap-5 w-full">
                                                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[var(--bg-section)] border border-[var(--border-light)] flex items-center justify-center text-[var(--accent-text)] group-data-[state=open]:bg-[var(--accent-primary)] group-data-[state=open]:text-[var(--text-primary)] group-data-[state=open]:border-[var(--accent-strong)] transition-all duration-500 shadow-sm">
                                                    {idx === 0 ? <Layers className="w-5 h-5" /> : idx === 1 ? <Smartphone className="w-5 h-5" /> : idx === 2 ? <PlayCircle className="w-5 h-5" /> : idx === 3 ? <Truck className="w-5 h-5" /> : <Flag className="w-5 h-5" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-text)] mb-0.5 opacity-60 group-data-[state=open]:opacity-100 transition-opacity">Module {mod.step || `0${idx + 1}`}</span>
                                                    <span className="text-lg md:text-xl font-bold text-[var(--text-primary)] tracking-tight">{mod.title}</span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-[var(--text-secondary)] pb-8 pt-2 pl-16 text-base md:text-lg leading-relaxed font-medium transition-all">
                                            <div className="max-w-2xl border-l-2 border-[var(--accent-wash)] pl-6 py-1">
                                                {mod.content}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 px-4 md:px-6 bg-white overflow-hidden">
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
                                <CarouselItem key={i} className="basis-full md:basis-1/2 lg:basis-1/3">
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
            </section >

            {/* Pricing Section */}
            < section className="py-24 px-4 md:px-6 bg-[var(--bg-section)]" id="pricing" >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="heading-2 mb-4">Choose Your Launchpad</h2>
                        <div className="flex flex-col items-center gap-2">
                            <p className="body-medium text-[var(--text-secondary)]">Investment tiers designed for every stage of business.</p>
                            <BusinessCategoriesDialog />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-stretch pt-12">
                        {loadingPackages ? (
                            <div className="col-span-3 py-20 text-center">
                                <Loader2 className="w-12 h-12 animate-spin mx-auto text-[var(--accent-strong)] mb-4" />
                                <p className="font-bold text-gray-400 italic">Syncing launchpads...</p>
                            </div>
                        ) : packages.length === 0 ? (
                            <div className="col-span-3 py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-[var(--border-light)]">
                                <PackageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="font-bold text-gray-500">No packages available at the moment.</p>
                                <p className="text-sm text-gray-400">Check back later or contact support.</p>
                            </div>
                        ) : (
                            packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className={`product-card group ${pkg.is_featured
                                        ? 'border-[var(--accent-primary)] ring-[12px] ring-[var(--accent-primary)]/5 z-10 scale-105 shadow-2xl'
                                        : 'border-[var(--border-light)]'
                                        }`}
                                >
                                    {pkg.badge && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-[var(--accent-primary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest shadow-xl">
                                            {pkg.badge}
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">
                                                {pkg.name}
                                            </h3>
                                        </div>

                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-5xl font-black text-[var(--text-primary)] leading-none italic">
                                                {pkg.price}
                                            </span>
                                            <span className="text-lg font-bold text-gray-400 uppercase">GHS</span>
                                        </div>

                                        <p className="text-base font-bold text-gray-500 leading-snug">
                                            {pkg.description}
                                        </p>

                                        <ul className="space-y-4 pt-2">
                                            {pkg.features?.map((feat, i) => (
                                                <li key={i} className="flex items-center gap-3 text-base text-[var(--text-primary)] font-black tracking-tight">
                                                    <div className="w-6 h-6 rounded-full bg-[var(--accent-wash)] flex items-center justify-center shrink-0 border border-[var(--accent-primary)]/30">
                                                        <Check className="w-3 h-3 text-[var(--accent-text)]" strokeWidth={3} />
                                                    </div>
                                                    <span className="leading-none">{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-auto pt-8">
                                        {pkg.cta_link ? (
                                            <button
                                                className="w-full h-16 rounded-[1rem] bg-[var(--accent-primary)] text-[var(--text-primary)] font-black text-lg flex items-center justify-center gap-2 transition-all hover:bg-[var(--accent-strong)] hover:scale-[1.02] shadow-[0_10px_20px_-5px_rgba(143,236,120,0.4)]"
                                                onClick={() => window.open(pkg.cta_link, '_blank')}
                                            >
                                                {pkg.cta_text || "Talk to an Expert"}
                                                <ArrowRight className="w-5 h-5" strokeWidth={3} />
                                            </button>
                                        ) : (
                                            <button
                                                className="w-full h-16 rounded-[1rem] bg-[var(--accent-primary)] text-[var(--text-primary)] font-black text-lg flex items-center justify-center gap-2 transition-all hover:bg-[var(--accent-strong)] hover:scale-[1.02] shadow-[0_10px_20px_-5px_rgba(143,236,120,0.4)]"
                                                onClick={() => handlePurchase(pkg.id, pkg.name, pkg.price)}
                                            >
                                                {pkg.cta_text || `Select ${pkg.name}`}
                                                <ArrowRight className="w-5 h-5" strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section >

            {/* Freebie Lead Magnet */}
            < section className="py-20 px-4 bg-white border-t border-[var(--border-light)]" >
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-[var(--bg-section)] rounded-3xl p-8 md:p-12 border border-[var(--border-light)]">
                        <h3 className="heading-3 mb-4">Not ready to buy yet?</h3>
                        <p className="body-medium mb-8 text-[var(--text-secondary)]">
                            Get our <span className="font-bold text-[var(--text-primary)]">Essential Business Checklist for free</span>.
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
            </section >

            {/* FAQ Section - Redesign */}
            <section className="py-24 px-4 bg-[var(--bg-page)] relative overflow-hidden" id="faq">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)] rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-3xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <Badge className="bg-white text-[var(--text-primary)] border-[var(--border-light)] mb-4 px-4 py-1.5 shadow-sm">
                            <HelpCircle className="w-4 h-4 mr-2 text-[var(--accent-strong)]" />
                            Help Center
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tight">
                            {siteContent.faq_title ? (
                                <span dangerouslySetInnerHTML={{ __html: siteContent.faq_title.replace('Questions', '<span class="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-strong)]">Questions</span>') }}></span>
                            ) : (
                                <>Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-strong)]">Questions</span></>
                            )}
                        </h2>
                        <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium">{siteContent.faq_desc || "Everything you need to know about the BUG Launchpad."}</p>
                    </motion.div>

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {(siteContent.faq_items && siteContent.faq_items.length > 0 ? siteContent.faq_items : [
                            { q: "How soon will I see results?", a: "Many of our clients see an increase in inquiries within the first 7 days of applying the '5-Post Rule' and optimizing their WhatsApp Business profile." },
                            { q: "Is this for new or existing businesses?", a: "Both! If you're just starting, it saves you months of trial and error. If you're already selling, it helps you scale and professionalize your operations." },
                            { q: "Do I need to pay for ads?", a: "No. The Launchpad focuses on organic growth and maximizing the tools you already have (WhatsApp, Instagram, TikTok) without spending a pesewa on ads." },
                            { q: "What happens after I purchase?", a: "You'll receive an instant download link for the PDF guide and templates. If you chose the Standard or Premium tiers, our team will reach out within 24 hours to set up your bonuses." },
                            { q: "Is there support if I get stuck?", a: "Yes! Premium members get access to our private community and 1-on-1 strategy audits. We're here to ensure you succeed." }
                        ]).map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            >
                                <AccordionItem
                                    value={`faq-${i}`}
                                    className="border border-[var(--border-light)] rounded-[1.5rem] px-6 bg-white shadow-sm data-[state=open]:shadow-md data-[state=open]:border-[var(--accent-strong)] transition-all overflow-hidden"
                                >
                                    <AccordionTrigger className="hover:no-underline py-6 text-left font-bold text-lg md:text-xl text-[var(--text-primary)] tracking-tight">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-[var(--text-secondary)] pb-8 text-base md:text-lg leading-relaxed font-medium">
                                        <div className="border-t border-[var(--border-light)] pt-6">
                                            {faq.a}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
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
                                <p className="text-sm font-bold text-[var(--text-primary)]">{siteContent.about_quote || "\"Our mission is to empower 10,000 Ghanaian businesses by 2030.\""}</p>
                            </div>
                        </div>
                        <div>
                            <Badge className="bg-[var(--accent-wash)] text-[var(--accent-text)] border-[var(--accent-strong)] mb-4 px-4 py-1.5 shadow-sm">
                                <Globe className="w-4 h-4 mr-2" />
                                {siteContent.about_badge || "Our Story"}
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tight leading-[0.9]">
                                {siteContent.about_title ? (
                                    <span dangerouslySetInnerHTML={{ __html: siteContent.about_title.replace('Entrepreneurs', '<span class="text-[var(--accent-strong)]">Entrepreneurs</span>') }}></span>
                                ) : (
                                    <>Built by Entrepreneurs, <br /> <span className="text-[var(--accent-strong)]">For Entrepreneurs</span></>
                                )}
                            </h2>
                            <p className="body-large text-[var(--text-secondary)] mb-6">
                                {siteContent.about_p1 || "BUG Social Media Agency started with a simple observation: Ghanaian business owners are incredibly hardworking, but many are struggling to translate that hard work into online sales."}
                            </p>
                            <p className="body-medium text-[var(--text-secondary)] mb-8">
                                {siteContent.about_p2 || "We spent 3 years testing strategies in the local market—figuring out exactly what makes a customer in Accra click \"Pay\" and why they ghost in the middle of a chat. The result is The Launchpad: a proven system tailored for the unique challenges of the Ghanaian digital landscape."}
                            </p>
                            <div className="flex gap-4">
                                <Button className="rounded-full bg-[var(--text-primary)] px-8">Read Our Full Story</Button>
                                <Button variant="outline" className="rounded-full px-8">Our Team</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Footer */}
            < footer className="bg-[var(--text-primary)] text-white py-12 md:py-16 px-4 md:px-6" >
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">
                    <div className="col-span-1 sm:col-span-2">
                        <div className="flex items-center gap-2 font-bold text-xl md:text-2xl mb-6">
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-[var(--text-primary)]">
                                <TrendingUp size={20} />
                            </div>
                            BUG Agency
                        </div>
                        <p className="text-gray-400 max-w-sm mb-6 text-sm md:text-base">
                            Helping Ghanaian businesses transition from "Ghosted" inquiries to consistent revenue using strategic social media blueprints.
                        </p>
                        <div className="flex gap-4">
                            {['Instagram', 'Twitter', 'LinkedIn', 'Facebook'].map((social) => (
                                <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[var(--accent-primary)] hover:text-[var(--text-primary)] transition-all">
                                    <span className="sr-only">{social}</span>
                                    <div className="w-5 h-5 bg-gray-400/50 rounded-sm"></div> {/* Placeholder icon */}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white uppercase tracking-wider text-xs md:text-sm">Quick Links</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><a href="#features" className="hover:text-white transition-colors">The Launchpad</a></li>
                            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Tiers</a></li>
                            <li><a href="#about" className="hover:text-white transition-colors">Our Story</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white uppercase tracking-wider text-xs md:text-sm">Contact Us</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li>Accra, Ghana</li>
                            <li>hello@bugagency.gh</li>
                            <li>+233 (0) 50 000 0000</li>
                            <li className="pt-4 font-bold text-white">Mon - Fri: 9am - 6pm</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs text-gray-500 text-center md:text-left">
                    <p>© 2025 BUG Social Media Agency. All rights reserved.</p>
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                        <a href="#" className="hover:text-white">Refund Policy</a>
                    </div>
                </div>
            </footer >

            <PurchaseDialog
                open={purchaseOpen}
                onOpenChange={setPurchaseOpen}
                tier={selectedTier}
                amount={selectedAmount}
                onStartPayment={handleStartPayment}
                categories={categories}
                isLoadingCategories={loadingCategories}
                isSubmitting={isCreatingOrder}
            />
        </div >
    );
};

export default LandingPage;
