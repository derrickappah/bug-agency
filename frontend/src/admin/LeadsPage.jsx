import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    Users,
    Search,
    Loader2,
    Mail,
    Calendar,
    Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const LeadsPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        const headers = ["ID", "Email", "Date"];
        const rows = leads.map(l => [l.id, l.email, new Date(l.created_at).toLocaleString()]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `BUG_Agency_Leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeads = leads.filter(l =>
        l.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)]">Leads</h1>
                    <p className="text-gray-500 font-medium">Potential customers who joined the waitlist.</p>
                </div>
                <Button
                    onClick={downloadCSV}
                    disabled={leads.length === 0}
                    className="bg-white border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--accent-wash)] font-bold rounded-xl h-12 px-6"
                >
                    <Download size={20} className="mr-2" /> Export CSV
                </Button>
            </div>

            <Card className="border-[var(--border-light)] shadow-sm">
                <CardHeader className="border-b border-[var(--border-light)] py-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by email..."
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
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Email Address</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Date Joined</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-light)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-20 text-center text-gray-400 font-bold italic">
                                            Loading leads...
                                        </td>
                                    </tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Users size={48} strokeWidth={1} />
                                                <p className="font-bold">No leads found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-[var(--bg-section)] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-[var(--accent-wash)] text-[var(--accent-text)] rounded-lg">
                                                        <Mail size={16} />
                                                    </div>
                                                    <span className="font-bold text-[var(--text-primary)]">{lead.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(lead.created_at).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    New
                                                </span>
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

export default LeadsPage;
