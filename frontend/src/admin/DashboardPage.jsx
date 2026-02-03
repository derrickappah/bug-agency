import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    TrendingUp,
    Users,
    Package,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Layers,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const StatCard = ({ title, value, icon, trend, trendValue, color }) => (
    <Card className="border-[var(--border-light)] shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color}`}>
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trendValue}
                </div>
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">{value}</h3>
            </div>
        </CardContent>
    </Card>
);

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalLeads: 0,
        activePackages: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Stats in parallel
            // Note: We filter for paid/completed status for revenue
            const [ordersCountRes, revenueRes, leadsRes, pkgsRes, recentRes] = await Promise.all([
                supabase.from('orders').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('amount').filter('status', 'in', '("paid","completed")'),
                supabase.from('leads').select('*', { count: 'exact', head: true }),
                supabase.from('packages').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('*, packages(name)').order('created_at', { ascending: false }).limit(5)
            ]);

            const revenue = revenueRes.data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

            setStats({
                totalRevenue: `GH¢ ${revenue.toLocaleString()}`,
                totalOrders: ordersCountRes.count || 0,
                totalLeads: leadsRes.count || 0,
                activePackages: pkgsRes.count || 0
            });

            setRecentOrders(recentRes.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 overflow-y-auto h-full pb-20 px-4 md:px-8 pt-8">
            {/* Header section with search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)]">Dashboard</h1>
                    <p className="text-gray-500 font-medium">Welcome back to your agency overview.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="rounded-xl font-bold border-[var(--border-light)] bg-white"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Refresh Data"}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={loading ? "..." : stats.totalRevenue}
                    icon={<DollarSign size={24} />}
                    trend="up"
                    trendValue="+0%"
                    color="text-green-600"
                />
                <StatCard
                    title="Total Orders"
                    value={loading ? "..." : stats.totalOrders}
                    icon={<Package size={24} />}
                    trend="up"
                    trendValue="+0%"
                    color="text-blue-600"
                />
                <StatCard
                    title="Total Leads"
                    value={loading ? "..." : stats.totalLeads}
                    icon={<Users size={24} />}
                    trend="up"
                    trendValue="+0%"
                    color="text-purple-600"
                />
                <StatCard
                    title="Active Packages"
                    value={loading ? "..." : stats.activePackages}
                    icon={<TrendingUp size={24} />}
                    trend="up"
                    trendValue="+0%"
                    color="text-orange-600"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-[var(--border-light)] shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border-light)] py-4">
                        <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
                        <Button variant="ghost" className="text-[var(--accent-text)] font-bold text-sm">View All</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-[var(--border-light)]">
                            {loading ? (
                                <div className="p-20 text-center text-gray-400 font-bold italic flex flex-col items-center gap-2">
                                    <Loader2 className="animate-spin text-[var(--accent-strong)]" />
                                    Syncing orders...
                                </div>
                            ) : recentOrders.length === 0 ? (
                                <div className="p-20 text-center text-gray-400 font-bold">No orders found yet.</div>
                            ) : (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-section)] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-[var(--border-light)]">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.user_email}`} alt="user" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--text-primary)]">{order.user_email}</p>
                                                <p className="text-xs text-gray-500">{order.packages?.name || 'Deleted Package'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-[var(--text-primary)]">GH¢ {order.amount}</p>
                                            <p className={`text-[10px] font-bold uppercase ${order.status === 'paid' || order.status === 'completed' ? 'text-green-600' : 'text-orange-500'}`}>
                                                {order.status}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-[var(--border-light)] shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border-light)] py-4">
                        <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <Button className="w-full justify-start gap-3 h-14 rounded-xl border border-[var(--border-light)] bg-white text-[var(--text-primary)] hover:bg-[var(--accent-wash)] hover:border-[var(--accent-strong)] shadow-none">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Package size={18} /></div>
                            <div className="text-left">
                                <p className="font-bold text-sm leading-none">Add Package</p>
                                <p className="text-[10px] text-gray-500">Create a new service tier</p>
                            </div>
                        </Button>
                        <Button className="w-full justify-start gap-3 h-14 rounded-xl border border-[var(--border-light)] bg-white text-[var(--text-primary)] hover:bg-[var(--accent-wash)] hover:border-[var(--accent-strong)] shadow-none">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Layers size={18} /></div>
                            <div className="text-left">
                                <p className="font-bold text-sm leading-none">Edit Content</p>
                                <p className="text-[10px] text-gray-500">Change website text/images</p>
                            </div>
                        </Button>
                        <Button className="w-full justify-start gap-3 h-14 rounded-xl border border-[var(--border-light)] bg-white text-[var(--text-primary)] hover:bg-[var(--accent-wash)] hover:border-[var(--accent-strong)] shadow-none">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><TrendingUp size={18} /></div>
                            <div className="text-left">
                                <p className="font-bold text-sm leading-none">Send Broadcast</p>
                                <p className="text-[10px] text-gray-500">Notify all existing leads</p>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
