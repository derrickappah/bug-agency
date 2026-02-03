import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    Plus,
    Trash2,
    Edit,
    Search,
    Loader2,
    Layers,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "../components/ui/dialog";
import { toast } from "sonner";

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: '', name: '' });
    const [newName, setNewName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // If table doesn't exist, we might get an error.
            // In a real app, we'd handle this gracefully.
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('categories')
                .insert([{ name: newName }]);

            if (error) throw error;

            toast.success("Category added successfully");
            setNewName('');
            setIsAddOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('categories')
                .update({ name: currentCategory.name })
                .eq('id', currentCategory.id);

            if (error) throw error;

            toast.success("Category updated successfully");
            setIsEditOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this business type? Packages in this type might become unassigned.")) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success("Category deleted");
            fetchCategories();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)]">Business Types</h1>
                    <p className="text-gray-500 font-medium">Manage business types for filtering.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)] font-bold rounded-xl h-12 px-6">
                            <Plus size={20} className="mr-2" /> Add Business Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Add New Business Type</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Business Type Name</label>
                                <Input
                                    placeholder="e.g. Fashion, Electronics, Food"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                    className="h-12 rounded-xl"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[var(--text-primary)] text-white hover:bg-[var(--text-primary)]/90 h-12 rounded-xl font-bold"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : "Create Business Type"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-[var(--border-light)] shadow-sm">
                <CardHeader className="border-b border-[var(--border-light)] py-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search business types..."
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
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">ID</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)]">Business Type Name</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-light)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-strong)]" />
                                                <p className="font-bold text-gray-400 italic">Syncing with database...</p>
                                                {/* Informational help if it stays loading */}
                                                <p className="text-xs text-red-400 mt-4 max-w-sm">
                                                    Note: If this stays loading, ensure the `categories` table exists in your Supabase database.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <Layers size={48} strokeWidth={1} />
                                                <p className="font-bold">No business types found.</p>
                                                <p className="text-sm">Create your first business type to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((c) => (
                                        <tr key={c.id} className="hover:bg-[var(--bg-section)] transition-colors group">
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{c.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4 font-bold text-[var(--text-primary)]">{c.name}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-blue-500 hover:bg-blue-50 h-9 w-9 rounded-lg"
                                                        onClick={() => {
                                                            setCurrentCategory(c);
                                                            setIsEditOpen(true);
                                                        }}
                                                    >
                                                        <Edit size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:bg-red-50 h-9 w-9 rounded-lg"
                                                        onClick={() => handleDelete(c.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
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

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Edit Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Category Name</label>
                            <Input
                                placeholder="Category Name"
                                value={currentCategory.name}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                required
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[var(--text-primary)] text-white hover:bg-[var(--text-primary)]/90 h-12 rounded-xl font-bold"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Notice for the user */}
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-orange-500 mt-1" size={20} />
                <div className="text-sm text-orange-800">
                    <p className="font-bold mb-1">Database Setup Required</p>
                    <p>Make sure you have created the <code>categories</code> table in Supabase with at least <code>id (uuid, primary key)</code>, <code>name (text)</code>, and <code>created_at (timestamp)</code> columns.</p>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
