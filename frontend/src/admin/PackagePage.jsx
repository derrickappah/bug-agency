import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    Plus,
    Trash2,
    Edit,
    Search,
    Loader2,
    Package as PackageIcon,
    Upload,
    FileText,
    DollarSign,
    ExternalLink,
    Star,
    ArrowUp,
    ArrowDown,
    Link as LinkIcon,
    ListPlus,
    X
} from "lucide-react";
import { Switch } from "../components/ui/switch";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

const PackagePage = () => {
    const [packages, setPackages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category_id: null,
        features: [],
        badge: '',
        cta_text: '',
        cta_link: '',
        is_featured: false,
        order_index: 0,
        file: null,
        business_files: {} // { [categoryId]: { file: File | null, url: string, name: string } }
    });

    const [currentFeature, setCurrentFeature] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pkgRes, catRes] = await Promise.all([
                supabase.from('packages').select('*, categories(name)').order('price', { ascending: true }),
                supabase.from('categories').select('*').order('name', { ascending: true })
            ]);

            if (pkgRes.error) throw pkgRes.error;
            if (catRes.error) throw catRes.error;

            setPackages(pkgRes.data || []);
            setCategories(catRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addFeature = () => {
        if (!currentFeature.trim()) return;
        setFormData({
            ...formData,
            features: [...formData.features, currentFeature.trim()]
        });
        setCurrentFeature("");
    };

    const removeFeature = (idx) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== idx)
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            category_id: null,
            features: [],
            badge: '',
            cta_text: '',
            cta_link: '',
            is_featured: false,
            order_index: 0,
            file: null,
            business_files: {}
        });
        setEditId(null);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let file_url = '';

            // 1. Upload file if exists
            if (formData.file) {
                const fileExt = formData.file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `packages/${fileName}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('package-files')
                    .upload(filePath, formData.file);

                if (uploadError) throw uploadError;

                // Get public URL or just store the path
                file_url = filePath;
            }

            // 2. Insert package data
            const { data: newPackage, error: insertError } = await supabase
                .from('packages')
                .insert([{
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description,
                    category_id: formData.category_id,
                    features: formData.features,
                    badge: formData.badge,
                    cta_text: formData.cta_text,
                    cta_link: formData.cta_link,
                    is_featured: formData.is_featured,
                    order_index: parseInt(formData.order_index),
                    file_url: file_url
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            // 3. Handle Business Files
            if (newPackage && formData.business_files) {
                await syncBusinessFiles(newPackage.id, formData.business_files);
            }

            toast.success("Package created successfully");
            setIsAddOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const syncBusinessFiles = async (packageId, businessFiles) => {
        // 1. Gather all current IDs that should be kept
        const keepIds = [];
        const filesToUpsert = [];

        for (const [catId, fileList] of Object.entries(businessFiles)) {
            if (!Array.isArray(fileList)) continue;

            for (const fileData of fileList) {
                if (fileData.existing_id) {
                    keepIds.push(fileData.existing_id);
                }
                filesToUpsert.push({ ...fileData, category_id: catId });
            }
        }

        // 2. Delete files that are no longer in the state
        if (keepIds.length > 0) {
            await supabase
                .from('package_business_files')
                .delete()
                .eq('package_id', packageId)
                .not('id', 'in', `(${keepIds.join(',')})`);
        } else {
            // If no files kept, delete all for this package (but be careful not to delete if we just didn't load them - though we always load on edit)
            // For safety, let's only delete if we are sure we are updating.
            // Actually, if keepIds is empty, it means user removed all files.
            await supabase
                .from('package_business_files')
                .delete()
                .eq('package_id', packageId);
        }

        // 3. Upload and Insert new files
        for (const fileData of filesToUpsert) {
            // If it's an existing file, we already kept it. Nothing to update in DB usually unless we want to update name? 
            // Let's assume immutable for now unless it's a new upload.

            if (fileData.file) {
                const fileExt = fileData.file.name.split('.').pop();
                // Use unique path per file
                const fileName = `${packageId}/${fileData.category_id}/${Math.random()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('package-files')
                    .upload(fileName, fileData.file);

                if (uploadError) throw uploadError;

                // Insert new record
                const { error: insertError } = await supabase
                    .from('package_business_files')
                    .insert({
                        package_id: packageId,
                        category_id: fileData.category_id,
                        file_url: fileName,
                        file_name: fileData.file.name
                    });

                if (insertError) throw insertError;
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let file_url = formData.file_url;

            // 1. Upload new file if exists
            if (formData.file instanceof File) {
                const fileExt = formData.file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `packages/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('package-files')
                    .upload(filePath, formData.file);

                if (uploadError) throw uploadError;
                file_url = filePath;
            }

            // 2. Update package data
            const { error: updateError } = await supabase
                .from('packages')
                .update({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    description: formData.description,
                    category_id: formData.category_id,
                    features: formData.features,
                    badge: formData.badge,
                    cta_text: formData.cta_text,
                    cta_link: formData.cta_link,
                    is_featured: formData.is_featured,
                    order_index: parseInt(formData.order_index),
                    file_url: file_url
                })
                .eq('id', editId);

            if (updateError) throw updateError;

            // 3. Sync business files
            if (formData.business_files) {
                await syncBusinessFiles(editId, formData.business_files);
            }

            toast.success("Package updated successfully");
            setIsEditOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = async (pkg) => {
        setEditId(pkg.id);

        let initialBusinessFiles = {};
        try {
            const { data } = await supabase
                .from('package_business_files')
                .select('*')
                .eq('package_id', pkg.id);

            if (data) {
                data.forEach(f => {
                    if (!initialBusinessFiles[f.category_id]) {
                        initialBusinessFiles[f.category_id] = [];
                    }
                    initialBusinessFiles[f.category_id].push({
                        url: f.file_url,
                        name: f.file_name,
                        existing_id: f.id
                    });
                });
            }
        } catch (e) {
            console.error("Error fetching business files", e);
        }

        setFormData({
            ...pkg,
            file: null, // Don't try to set file object
            business_files: initialBusinessFiles
        });
        setIsEditOpen(true);
    };

    const addBusinessFile = (categoryId, file) => {
        if (!file) return;
        setFormData(prev => {
            const currentFiles = prev.business_files[categoryId] || [];
            return {
                ...prev,
                business_files: {
                    ...prev.business_files,
                    [categoryId]: [...currentFiles, { file: file, name: file.name }]
                }
            };
        });
    };

    const removeBusinessFile = (categoryId, index) => {
        setFormData(prev => {
            const currentFiles = [...(prev.business_files[categoryId] || [])];
            currentFiles.splice(index, 1);
            return {
                ...prev,
                business_files: {
                    ...prev.business_files,
                    [categoryId]: currentFiles
                }
            };
        });
    };

    const handleDelete = async (id, fileUrl) => {
        if (!confirm("Are you sure you want to delete this package?")) return;

        try {
            // Delete file from storage if exists
            if (fileUrl) {
                await supabase.storage.from('package-files').remove([fileUrl]);
            }

            const { error } = await supabase.from('packages').delete().eq('id', id);
            if (error) throw error;

            toast.success("Package deleted");
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredPackages = packages.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)]">Packages</h1>
                    <p className="text-gray-500 font-medium">Manage tiers, pricing, and delivered files.</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            resetForm();
                            setIsAddOpen(true);
                        }}
                        className="bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)] font-bold rounded-xl h-12 px-6"
                    >
                        <Plus size={20} className="mr-2" /> New Package
                    </Button>
                </div>
            </div>

            {/* Main Package Form - Reusable in Add/Edit */}
            <PackageDialog
                open={isAddOpen || isEditOpen}
                setOpen={(val) => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                    if (!val) resetForm();
                }}
                title={editId ? "Edit Package" : "Create Package"}
                formData={formData}
                setFormData={setFormData}
                onSubmit={editId ? handleUpdate : handleAdd}
                submitting={submitting}
                categories={categories}
                currentFeature={currentFeature}
                setCurrentFeature={setCurrentFeature}
                addFeature={addFeature}
                removeFeature={removeFeature}
                handleFileChange={handleFileChange}
                addBusinessFile={addBusinessFile}
                removeBusinessFile={removeBusinessFile}
            />

            <Card className="border-[var(--border-light)] shadow-sm">
                <CardHeader className="border-b border-[var(--border-light)] py-4 flex flex-row items-center justify-between">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search packages..."
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
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Features</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-light)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-bold italic">
                                            Loading packages...
                                        </td>
                                    </tr>
                                ) : filteredPackages.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <PackageIcon size={48} strokeWidth={1} />
                                                <p className="font-bold">No packages created yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPackages.sort((a, b) => a.order_index - b.order_index).map((p) => (
                                        <tr key={p.id} className="hover:bg-[var(--bg-section)] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.is_featured ? 'bg-[var(--accent-primary)] text-[var(--text-primary)]' : 'bg-gray-100 text-gray-400'}`}>
                                                        <PackageIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                                            {p.name}
                                                            {p.is_featured && <Star size={12} className="fill-[var(--accent-strong)] text-[var(--accent-strong)]" />}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono">#{p.id.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="font-black text-lg">GH¢ {p.price}</div>
                                                    <div className="flex items-center gap-2">
                                                        {p.badge && (
                                                            <span className="px-2 py-0.5 bg-[var(--accent-wash)] text-[var(--accent-text)] rounded-md text-[10px] font-black uppercase tracking-tighter">
                                                                {p.badge}
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                            Order: {p.order_index}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-xs font-bold text-[var(--text-primary)]">{p.features?.length || 0} Features</div>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                        {p.file_url ? (
                                                            <span className="flex items-center gap-1 text-blue-600 font-bold"><FileText size={10} /> File Attached</span>
                                                        ) : (
                                                            <span className="italic">No file</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-blue-500 hover:bg-blue-50 h-9 w-9 rounded-lg"
                                                        onClick={() => openEdit(p)}
                                                    >
                                                        <Edit size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:bg-red-50 h-9 w-9 rounded-lg"
                                                        onClick={() => handleDelete(p.id, p.file_url)}
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
        </div>
    );
};

// Internal Dialog Component for Reusability
const PackageDialog = ({
    open,
    setOpen,
    title,
    formData,
    setFormData,
    onSubmit,
    submitting,
    categories,
    currentFeature,
    setCurrentFeature,
    addFeature,
    removeFeature,
    handleFileChange,
    addBusinessFile,
    removeBusinessFile
}) => (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
            <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter">{title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-8 pt-4">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-400">Plan Name</label>
                        <Input
                            placeholder="e.g. Starter (VIP)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="h-14 rounded-2xl border-2 focus:border-[var(--accent-strong)] text-lg font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-400">Price (GH¢)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                type="number"
                                placeholder="150"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                                className="h-14 pl-12 rounded-2xl border-2 focus:border-[var(--accent-strong)] text-lg font-black"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-black uppercase tracking-widest text-gray-400">Category</label>
                            <span className="text-[10px] font-bold text-[var(--accent-text)] bg-[var(--accent-wash)] px-2 py-0.5 rounded-full">Optional</span>
                        </div>
                        <Select
                            value={formData.category_id || "none"}
                            onValueChange={(val) => setFormData({ ...formData, category_id: val === "none" ? null : val })}
                        >
                            <SelectTrigger className="h-14 rounded-2xl border-2 text-lg font-bold">
                                <SelectValue placeholder="General" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">General / Uncategorized</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-400">Badge / Tag</label>
                        <Input
                            placeholder="e.g. POPULAR, BEST VALUE"
                            value={formData.badge}
                            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                            className="h-14 rounded-2xl border-2 text-lg font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-gray-400">Short Description</label>
                    <Textarea
                        placeholder="Most successful businesses start here."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="rounded-2xl border-2 text-lg font-medium resize-none shadow-sm"
                    />
                </div>

                {/* Features Management */}
                <div className="space-y-4 p-6 bg-[var(--bg-section)] rounded-[2rem] border-2 border-dashed border-[var(--border-light)]">
                    <label className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">What's Included</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a feature..."
                            value={currentFeature}
                            onChange={(e) => setCurrentFeature(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            className="h-12 rounded-xl bg-white border-none shadow-sm font-bold"
                        />
                        <Button type="button" onClick={addFeature} size="icon" className="h-12 w-12 rounded-xl shrink-0 bg-[var(--text-primary)]">
                            <Plus size={24} />
                        </Button>
                    </div>
                    <div className="space-y-2 mt-4">
                        {formData.features?.map((feat, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/80 p-3 pl-4 rounded-xl border border-[var(--border-light)] group">
                                <span className="text-sm font-bold text-[var(--text-primary)]">{feat}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFeature(i)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                        {(!formData.features || formData.features.length === 0) && (
                            <p className="text-xs text-gray-400 italic text-center py-4">No features added yet.</p>
                        )}
                    </div>
                </div>

                {/* Business Type Specific Files */}
                <div className="space-y-4 p-6 bg-[var(--bg-section)] rounded-[2rem] border-2 border-dashed border-[var(--border-light)]">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Business Type Specific Files</label>
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">Multiple Files Allowed</span>
                    </div>

                    <div className="grid gap-4 max-h-80 overflow-y-auto pr-2">
                        {categories.map(cat => {
                            const fileList = formData.business_files?.[cat.id] || [];

                            return (
                                <div key={cat.id} className="bg-white p-4 rounded-xl border border-[var(--border-light)] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-[var(--text-primary)]">{cat.name}</span>
                                        <div className="relative overflow-hidden">
                                            <Button type="button" variant="outline" size="sm" className="relative h-8 text-xs font-bold gap-2">
                                                <Upload size={14} />
                                                Add File
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            addBusinessFile(cat.id, e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* File List */}
                                    {fileList.length > 0 ? (
                                        <div className="space-y-2">
                                            {fileList.map((fileData, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-[var(--bg-section)] rounded-lg text-xs">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FileText size={14} className="text-blue-500 shrink-0" />
                                                        <span className="font-mono truncate">{fileData.name}</span>
                                                        {fileData.file && <span className="text-[10px] text-green-600 bg-green-50 px-1 rounded">New</span>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBusinessFile(cat.id, idx)}
                                                        className="text-red-400 hover:text-red-600 p-1"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-gray-400 italic">No specific files added.</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Call to Action Controls */}
                <div className="grid md:grid-cols-2 gap-6 p-6 bg-white border-2 border-[var(--border-light)] rounded-[2rem]">
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-500">CTA Button Text</label>
                        <Input
                            placeholder="Get Standard VIP"
                            value={formData.cta_text}
                            onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                            className="h-12 rounded-xl font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-500">CTA Link (External)</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="https://wa.me/..."
                                value={formData.cta_link}
                                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                                className="h-12 pl-10 rounded-xl font-mono text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Advanced Controls */}
                <div className="flex flex-wrap items-center gap-8 px-4">
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={formData.is_featured}
                            onCheckedChange={(val) => setFormData({ ...formData, is_featured: val })}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-tighter">Featured Plan</span>
                            <span className="text-[10px] font-bold text-gray-400">Highlights card on landing page</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Display Order</label>
                        <Input
                            type="number"
                            value={formData.order_index}
                            onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                            className="w-20 h-10 rounded-lg text-center font-black"
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-black uppercase tracking-widest text-gray-400">Digital Product Delivery</label>
                        {formData.file_url && (
                            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">File Linked</span>
                        )}
                    </div>
                    <div className="border-2 border-dashed border-[var(--border-light)] rounded-[2rem] p-10 text-center hover:border-[var(--accent-strong)] transition-all cursor-pointer relative group bg-[var(--bg-section)]/50">
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[var(--accent-text)] group-hover:scale-110 transition-all shadow-sm">
                                <Upload size={32} />
                            </div>
                            <p className="font-black text-[var(--text-primary)] text-lg">
                                {formData.file ? formData.file.name : formData.file_url ? "Click to replace current file" : "Upload Digital Product"}
                            </p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">PDF, ZIP, or DOCX (Max 50MB)</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-6">
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[var(--text-primary)] text-white hover:bg-[var(--text-primary)]/90 h-16 rounded-[1.5rem] font-black text-xl shadow-2xl transition-all"
                    >
                        {submitting ? <Loader2 className="animate-spin mr-2" /> : title}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
);

export default PackagePage;
