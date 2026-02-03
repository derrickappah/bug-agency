import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    TrendingUp,
    LayoutDashboard,
    Package,
    Layers,
    Settings,
    LogOut,
    ChevronRight,
    Users,
    FileText,
    Menu,
    X,
    Bell
} from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/admin/login');
            } else {
                setUser(user);
            }
        };
        checkUser();

        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
            else setSidebarOpen(true);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Business Types', path: '/admin/categories', icon: <Layers size={20} /> },
        { name: 'Packages', path: '/admin/packages', icon: <Package size={20} /> },
        { name: 'Site Content', path: '/admin/content', icon: <Settings size={20} /> },
        { name: 'Orders', path: '/admin/orders', icon: <FileText size={20} /> },
        { name: 'Leads', path: '/admin/leads', icon: <Users size={20} /> },
    ];

    if (!user) return null;

    return (
        <div className="h-screen bg-[#F8FAF9] flex overflow-hidden">
            {/* Sidebar */}
            <AnimatePresence mode='wait'>
                {(sidebarOpen || !isMobile) && (
                    <motion.aside
                        initial={isMobile ? { x: -300 } : { width: sidebarOpen ? 280 : 80 }}
                        animate={isMobile ? { x: 0 } : { width: sidebarOpen ? 280 : 80 }}
                        exit={isMobile ? { x: -300 } : {}}
                        className={`fixed lg:sticky top-0 z-40 h-screen bg-[var(--text-primary)] text-white shadow-2xl transition-all duration-300 flex flex-col overflow-hidden`}
                    >
                        {/* Sidebar Logo */}
                        <div className="p-6 flex items-center gap-3">
                            <div className="min-w-[40px] h-10 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-strong)] rounded-xl flex items-center justify-center">
                                <TrendingUp size={20} className="text-[var(--text-primary)]" strokeWidth={2.5} />
                            </div>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-black text-xl tracking-tight"
                                >
                                    BUG Admin
                                </motion.span>
                            )}
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/dashboard');
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${isActive
                                            ? 'bg-[var(--accent-primary)] text-[var(--text-primary)] shadow-lg shadow-[var(--accent-primary)]/10'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <div className={isActive ? 'text-[var(--text-primary)]' : 'group-hover:text-[var(--accent-primary)] transition-colors'}>
                                            {item.icon}
                                        </div>
                                        {sidebarOpen && (
                                            <span className="font-bold">{item.name}</span>
                                        )}
                                        {isActive && sidebarOpen && (
                                            <ChevronRight className="ml-auto" size={16} />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User & Logout */}
                        <div className="p-4 border-t border-white/5 space-y-4">
                            {sidebarOpen && (
                                <div className="px-4 py-2">
                                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Logged in as</p>
                                    <p className="text-sm font-bold truncate opacity-80">{user.email}</p>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-4 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold`}
                            >
                                <LogOut size={20} />
                                {sidebarOpen && <span>Sign Out</span>}
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white border-b border-[var(--border-light)] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-[var(--text-primary)] hover:bg-[var(--accent-wash)]"
                        >
                            <Menu size={24} />
                        </Button>
                        <h2 className="text-xl font-black text-[var(--text-primary)] hidden md:block">
                            {navItems.find(n => n.path === location.pathname)?.name || 'Admin'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:bg-[var(--accent-wash)] h-10 w-10 rounded-full">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent-strong)] rounded-full border-2 border-white"></span>
                        </Button>
                        <div className="h-10 w-10 bg-[var(--bg-section)] rounded-full flex items-center justify-center border border-[var(--border-light)] overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="avatar" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
