import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    Download,
    CheckCircle2,
    ArrowLeft,
    Home,
    Smartphone,
    Globe,
    FileText,
    ExternalLink,
    Loader2,
    PartyPopper
} from 'lucide-react';
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from './lib/supabaseClient';
import { toast } from 'sonner';

const SuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, reference: stateReference, businessType } = location.state || {};

    const [order, setOrder] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!orderId && !stateReference) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log("🔍 [SuccessPage] Fetching data for:", { orderId, stateReference, businessType });

                // 1. Fetch Order
                const query = supabase.from('orders').select('*');
                if (orderId) query.eq('id', orderId);
                else query.eq('reference', stateReference);

                const { data: orderData, error: orderError } = await query.single();

                if (orderError || !orderData) {
                    console.error("❌ Order not found:", orderError);
                    setLoading(false);
                    return;
                }

                setOrder(orderData);

                // 2. Find Category (CASE-INSENSITIVE)
                let categoryId = null;
                if (businessType) {
                    console.log("🔥 [SuccessPage] Looking up category:", businessType);
                    const { data: categoryData } = await supabase
                        .from('categories')
                        .select('id')
                        .ilike('name', businessType)
                        .single();

                    if (categoryData) {
                        categoryId = categoryData.id;
                        console.log("✅ [SuccessPage] Category Matched:", categoryId);
                    }
                }

                // 3. Fetch Files
                let filesQuery = supabase
                    .from('package_business_files')
                    .select('*')
                    .eq('package_id', orderData.package_id);

                if (categoryId) {
                    filesQuery = filesQuery.eq('category_id', categoryId);
                }

                const { data: filesData, error: filesError } = await filesQuery;

                if (filesError) throw filesError;
                setFiles(filesData || []);

            } catch (err) {
                console.error("💥 SuccessPage Data Fetch Failed:", err);
                toast.error("Failed to load your files. Please refresh.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId, stateReference, businessType]);

    // If still loading core data
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-6 text-center">
                <div className="space-y-6">
                    <Loader2 className="w-12 h-12 text-[var(--accent-text)] animate-spin mx-auto" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Securing your Digital Blueprint...</h2>
                    <p className="text-gray-400">Verifying your payment and preparing your files.</p>
                </div>
            </div>
        );
    }

    // If no order found after loading
    if (!order && !loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6">
                    <div className="bg-red-50 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                        <FileText className="text-red-600" size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)]">Order Identification Failed</h1>
                    <p className="text-gray-500">
                        We confirmed your payment ({stateReference || "Pending"}), but couldn't sync your files immediately.
                        Don't worry! Check your email or refresh this page.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => window.location.reload()} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold h-12 rounded-xl">
                            Try Again
                        </Button>
                        <Button asChild className="flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-strong)] text-[var(--text-primary)] font-bold h-12 rounded-xl">
                            <Link to="/">Dashboard</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const handleManualDownload = async (file) => {
        setDownloading(file.id);
        try {
            const { data, error } = await supabase.storage
                .from('package-files')
                .createSignedUrl(file.file_url, 3600);

            if (error) throw error;

            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = file.file_name || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`Downloading ${file.file_name}...`);
        } catch (err) {
            console.error("Manual download failed:", err);
            toast.error("Download failed. Please try again.");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-body)] font-sans selection:bg-[var(--accent-primary)] overflow-x-hidden relative">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[var(--bg-page)]">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent-primary)]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[var(--accent-primary)]/5 blur-[150px] rounded-full" />
            </div>

            <main className="w-full max-w-full mx-auto px-4 md:px-6 py-8 md:py-20 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl space-y-10 md:space-y-16 flex flex-col items-center"
                >
                    {/* Hero Header */}
                    <div className="space-y-4 px-2 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-text)] border border-[var(--accent-primary)]/20 shadow-[0_0_50px_rgba(143,236,120,0.1)] mb-4 mx-auto"
                        >
                            <CheckCircle2 size={40} />
                        </motion.div>
                        <h1 className="text-3xl md:text-6xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
                            Success! Your Blueprint is <span className="text-[var(--accent-text)]">Ready</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm md:text-xl max-w-2xl mx-auto font-medium px-2">
                            Payment verified. You now have full access to your premium digital assets.
                        </p>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6 text-left w-full max-w-full px-2">
                        <Card className="bg-white border-[var(--border-light)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md w-full max-w-full">
                            <CardHeader className="bg-gray-50/50 border-b border-[var(--border-light)] py-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
                                    <FileText size={14} /> Transaction Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 md:p-6 space-y-4 overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 group/item w-full overflow-hidden">
                                    <span className="text-[var(--text-secondary)] text-sm font-medium shrink-0">Ref</span>
                                    <span className="text-[var(--text-primary)] font-mono text-[10px] md:text-sm bg-gray-50 px-2 py-1 rounded truncate max-w-full">
                                        {order?.reference || stateReference}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 group/item w-full overflow-hidden">
                                    <span className="text-[var(--text-secondary)] text-sm font-medium shrink-0">Email</span>
                                    <span className="text-[var(--text-primary)] font-bold text-sm md:text-base truncate max-w-full">{order?.customer_email || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center group/item pt-2 sm:pt-0 w-full">
                                    <span className="text-[var(--text-secondary)] text-sm font-medium">Status</span>
                                    <span className="bg-[var(--accent-wash)] text-[var(--accent-text)] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-[var(--accent-primary)]/20 shadow-sm">
                                        Verified
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-[var(--border-light)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md w-full max-w-full">
                            <CardHeader className="bg-gray-50/50 border-b border-[var(--border-light)] py-4">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
                                    <Smartphone size={14} /> Access Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4 overflow-hidden">
                                <p className="text-sm text-[var(--text-body)] leading-relaxed px-1">
                                    Direct downloads are active below. Links expire in 60 minutes for security.
                                </p>
                                <div className="p-4 bg-[var(--accent-wash)] rounded-xl border border-[var(--accent-primary)]/10 shadow-inner">
                                    <p className="text-[10px] text-[var(--accent-text)] font-black flex items-center gap-2 uppercase tracking-widest">
                                        <Globe size={12} /> Support Access
                                    </p>
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 font-medium leading-relaxed">Contact support if your files aren't appearing.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Download Section */}
                    <div className="w-full space-y-8 pt-8 text-left">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
                            <div className="space-y-2 px-1">
                                <h2 className="text-2xl md:text-4xl font-black text-[var(--text-primary)] flex items-center gap-3">
                                    <Download className="text-[var(--accent-text)] w-7 h-7 md:w-10 md:h-10" />
                                    Your Blueprint
                                </h2>
                                <p className="text-[var(--text-secondary)] font-medium text-xs md:text-base">
                                    Premium digital assets tailored to your business niche.
                                </p>
                            </div>
                            <span className="inline-flex items-center text-[9px] font-black text-[var(--text-secondary)] bg-white/50 backdrop-blur-sm border border-[var(--border-light)] px-3 py-1 rounded-full uppercase tracking-widest shadow-sm w-fit ml-1">
                                {files.length} Digital Assets
                            </span>
                        </div>

                        <div className="grid gap-4 w-full">
                            {files.length === 0 ? (
                                <div className="p-16 text-center bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-[var(--border-light)] space-y-4">
                                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                        <PackageIcon size={32} />
                                    </div>
                                    <p className="text-[var(--text-secondary)] font-bold italic max-w-sm mx-auto">Configuring your specific business files based on your niche. Please refresh in a moment.</p>
                                </div>
                            ) : (
                                files.map((file, idx) => (
                                    <motion.div
                                        key={file.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="w-full min-w-0"
                                    >
                                        <div className="bg-white/80 backdrop-blur-md hover:bg-white border border-[var(--border-light)] p-4 md:p-6 rounded-[1.2rem] md:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between transition-all duration-500 group shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] gap-4 md:gap-6 w-full max-w-full border-t-4 border-t-transparent hover:border-t-[var(--accent-primary)] overflow-hidden">
                                            <div className="flex items-center gap-3 md:gap-6 w-full sm:flex-1 min-w-0 overflow-hidden">
                                                <div className="bg-[var(--accent-wash)] w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.2rem] flex items-center justify-center text-[var(--accent-text)] shrink-0 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 shadow-inner">
                                                    <FileText size={24} className="md:size-32" />
                                                </div>
                                                <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-[8px] uppercase font-black py-0 px-1.5 rounded shrink-0">Verified</Badge>
                                                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none truncate overflow-hidden">Asset</span>
                                                    </div>
                                                    <h3 className="font-extrabold text-[var(--text-primary)] text-base md:text-xl truncate leading-tight w-full block whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {file.file_name || "Document"}
                                                    </h3>
                                                    <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1 opacity-70 truncate block overflow-hidden">
                                                        Agency Blueprint
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleManualDownload(file)}
                                                disabled={downloading === file.id}
                                                className="w-full sm:w-auto bg-[var(--accent-primary)] hover:bg-[var(--accent-strong)] text-[var(--text-primary)] border-none rounded-xl md:rounded-2xl px-5 md:px-8 font-black h-11 md:h-14 shadow-[0_4px_15px_rgba(143,236,120,0.3)] hover:shadow-[0_8px_25px_rgba(143,236,120,0.5)] transition-all active:scale-95 group/btn overflow-hidden relative shrink-0"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {downloading === file.id ? (
                                                        <Loader2 className="animate-spin" size={20} />
                                                    ) : (
                                                        <Download size={20} className="group-hover/btn:translate-y-0.5 transition-transform" />
                                                    )}
                                                    {downloading === file.id ? "Securing Link..." : "Download Now"}
                                                </span>
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-10 pb-12">
                        <Button
                            asChild
                            variant="outline"
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-light)] h-12 px-10 rounded-full font-bold bg-white/50 backdrop-blur-sm transition-all hover:bg-white hover:border-[var(--accent-primary)]/30 hover:shadow-sm"
                        >
                            <Link to="/">
                                <Home size={18} className="mr-2" /> Back to Dashboard
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default SuccessPage;
