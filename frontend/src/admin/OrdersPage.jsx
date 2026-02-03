import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    FileText,
    Search,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Copy,
    ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, packages(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Reference copied");
    };

    const filteredOrders = orders.filter(o =>
        (o.user_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.reference?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-[var(--text-primary)]">Orders</h1>
                <p className="text-gray-500 font-medium">Track sales and payment completions.</p>
            </div>

            <Card className="border-[var(--border-light)] shadow-sm">
                <CardHeader className="border-b border-[var(--border-light)] py-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by email or reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 rounded-xl"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[var(--bg-section)] text-left border-b border-[var(--border-light)]">
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Date</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Customer</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Package</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Amount</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Status</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Reference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-light)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-bold italic">
                                            Loading orders...
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <FileText size={48} strokeWidth={1} />
                                                <p className="font-bold">No orders found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-[var(--bg-section)] transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[var(--text-primary)]">{order.user_email}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{order.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-[var(--text-primary)]">
                                                    {order.packages?.name || 'Package Deleted'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-black">GH¢ {order.amount}</td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider ${order.status === 'completed' || order.status === 'paid' ? 'text-green-600' : 'text-orange-500'
                                                    }`}>
                                                    {order.status === 'completed' || order.status === 'paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                    {order.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 group">
                                                    {order.reference?.slice(0, 10)}...
                                                    <button onClick={() => copyToClipboard(order.reference)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Copy size={12} className="hover:text-[var(--accent-text)]" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrdersPage;
