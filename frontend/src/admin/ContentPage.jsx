import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    Save,
    RefreshCw,
    Loader2,
    Type,
    Image as ImageIcon,
    Layout,
    Check,
    Plus,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";

const ContentPage = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [localContent, setLocalContent] = useState({});

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_content')
                .select('*');

            if (error) throw error;

            setContent(data || []);
            const contentMap = {};
            data?.forEach(item => {
                // Try to parse JSON if it's a list key
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
            setLocalContent(contentMap);
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAll = async () => {
        setSaving('all');
        try {
            const updates = Object.keys(localContent).map(key => {
                let val = localContent[key];
                if (key.includes('_items')) {
                    val = JSON.stringify(val);
                }
                return { key, value: val };
            });

            const { error } = await supabase
                .from('site_content')
                .upsert(updates);

            if (error) throw error;
            toast.success("All changes saved successfully");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const updateItem = (key, index, field, value) => {
        const items = [...(localContent[key] || [])];
        items[index] = { ...items[index], [field]: value };
        setLocalContent({ ...localContent, [key]: items });
    };

    const addItem = (key, defaultObj) => {
        const items = [...(localContent[key] || []), defaultObj];
        setLocalContent({ ...localContent, [key]: items });
    };

    const removeItem = (key, index) => {
        const items = (localContent[key] || []).filter((_, i) => i !== index);
        setLocalContent({ ...localContent, [key]: items });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-strong)]" />
                <p className="font-bold text-gray-400">Loading Site Content...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 overflow-y-auto h-full px-4 md:px-8 pt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)]">Site Content</h1>
                    <p className="text-gray-500 font-medium">Edit text and headlines across the website.</p>
                </div>
                <Button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="bg-[var(--text-primary)] text-white hover:bg-[var(--text-primary)]/90 font-bold rounded-xl h-12 px-8 shadow-xl"
                >
                    {saving === 'all' ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" size={20} />}
                    Save All Changes
                </Button>
            </div>

            <Tabs defaultValue="hero" className="w-full">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="bg-white border border-[var(--border-light)] p-1 h-auto rounded-2xl mb-8 flex-nowrap min-w-max">
                        <TabsTrigger value="hero" className="rounded-xl px-6 py-3 data-[state=active]:bg-[var(--accent-wash)] data-[state=active]:text-[var(--text-primary)] font-bold">Hero</TabsTrigger>
                        <TabsTrigger value="pain" className="rounded-xl px-6 py-3 data-[state=active]:bg-[var(--accent-wash)] data-[state=active]:text-[var(--text-primary)] font-bold">Pain Points</TabsTrigger>
                        <TabsTrigger value="metrics" className="rounded-xl px-6 py-3 data-[state=active]:bg-[var(--accent-wash)] data-[state=active]:text-[var(--text-primary)] font-bold">Metrics</TabsTrigger>
                        <TabsTrigger value="blueprint" className="rounded-xl px-6 py-3 data-[state=active]:bg-[var(--accent-wash)] data-[state=active]:text-[var(--text-primary)] font-bold">Blueprint</TabsTrigger>
                        <TabsTrigger value="faq" className="rounded-xl px-6 py-3 data-[state=active]:bg-[var(--accent-wash)] data-[state=active]:text-[var(--text-primary)] font-bold">FAQ</TabsTrigger>
                        <TabsTrigger value="story" className="rounded-xl px-6 py-3 data-[state=active]:bg-[var(--accent-wash)] data-[state=active]:text-[var(--text-primary)] font-bold">Story</TabsTrigger>
                        <TabsTrigger value="categories" className="rounded-xl px-6 py-3 data-[state=active]:bg-[var(--accent-wash)] data-[state=active]:text-[var(--text-primary)] font-bold">Business Categories</TabsTrigger>
                    </TabsList>
                </div>

                {/* Hero Section */}
                <TabsContent value="hero" className="space-y-6">
                    <Card className="border-[var(--border-light)] shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-bold"><Type size={20} /> Main Hero Headlines</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ContentField
                                label="Top Small Text"
                                value={localContent['hero_small_text']}
                                onChange={(val) => setLocalContent({ ...localContent, hero_small_text: val })}
                                placeholder="Stop Posting for 'Likes'"
                            />
                            <ContentField
                                label="Main Headline First Row"
                                value={localContent['hero_title_row1']}
                                onChange={(val) => setLocalContent({ ...localContent, hero_title_row1: val })}
                                placeholder="Start Posting for"
                            />
                            <ContentField
                                label="Main Headline Accent Row"
                                value={localContent['hero_title_accent']}
                                onChange={(val) => setLocalContent({ ...localContent, hero_title_accent: val })}
                                placeholder="Sales."
                                className="font-black text-[var(--accent-text)]"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pain Points */}
                <TabsContent value="pain" className="space-y-6">
                    <Card className="border-[var(--border-light)] shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-bold">Pain Points Section</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ContentField
                                label="Section Title"
                                value={localContent['pain_title']}
                                onChange={(val) => setLocalContent({ ...localContent, pain_title: val })}
                                placeholder="Does this sound familiar?"
                            />
                            <ContentField
                                label="Section Subtitle"
                                value={localContent['pain_desc']}
                                onChange={(val) => setLocalContent({ ...localContent, pain_desc: val })}
                                placeholder="You're working hard, but the sales just aren't matching the effort."
                            />
                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Pain Items</label>
                                {(localContent['pain_items'] || []).map((item, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-red-500 h-8 w-8"
                                            onClick={() => removeItem('pain_items', idx)}
                                        >
                                            <RefreshCw size={14} className="rotate-45" />
                                        </Button>
                                        <Input
                                            value={item.title}
                                            onChange={(e) => updateItem('pain_items', idx, 'title', e.target.value)}
                                            placeholder="Item Title (e.g. Ghosted Inquiries)"
                                            className="bg-white font-bold"
                                        />
                                        <Textarea
                                            value={item.desc}
                                            onChange={(e) => updateItem('pain_items', idx, 'desc', e.target.value)}
                                            placeholder="Item Description"
                                            className="bg-white"
                                        />
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed rounded-2xl h-12"
                                    onClick={() => addItem('pain_items', { title: '', desc: '', icon: 'Users' })}
                                >
                                    + Add Pain Point
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Metrics */}
                <TabsContent value="metrics" className="space-y-6">
                    <Card className="border-[var(--border-light)] shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-bold">Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ContentField
                                label="Main Title"
                                value={localContent['metrics_title']}
                                onChange={(val) => setLocalContent({ ...localContent, metrics_title: val })}
                            />
                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Metric Blocks</label>
                                {(localContent['metrics_items'] || []).map((item, idx) => (
                                    <div key={idx} className="p-4 bg-[var(--accent-wash)] rounded-2xl border border-[var(--accent-strong)]/20 space-y-4 relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-red-500 h-8 w-8"
                                            onClick={() => removeItem('metrics_items', idx)}
                                        >
                                            <RefreshCw size={14} className="rotate-45" />
                                        </Button>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                value={item.value}
                                                onChange={(e) => updateItem('metrics_items', idx, 'value', e.target.value)}
                                                placeholder="Value (e.g. 340%)"
                                                className="bg-white font-black text-2xl"
                                            />
                                            <Input
                                                value={item.label}
                                                onChange={(e) => updateItem('metrics_items', idx, 'label', e.target.value)}
                                                placeholder="Label (e.g. Revenue Lift)"
                                                className="bg-white font-bold"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed rounded-2xl h-12"
                                    onClick={() => addItem('metrics_items', { label: '', value: '' })}
                                >
                                    + Add Metric
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Blueprint */}
                <TabsContent value="blueprint" className="space-y-6">
                    <Card className="border-[var(--border-light)] shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-bold">Inside The Blueprint (Roadmap)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ContentField
                                label="Title"
                                value={localContent['blueprint_title']}
                                onChange={(val) => setLocalContent({ ...localContent, blueprint_title: val })}
                            />
                            <ContentField
                                label="Subtitle"
                                value={localContent['blueprint_subtitle']}
                                onChange={(val) => setLocalContent({ ...localContent, blueprint_subtitle: val })}
                            />
                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Modules</label>
                                {(localContent['blueprint_items'] || []).map((item, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                        <div className="flex gap-4">
                                            <Input
                                                value={item.step || idx + 1}
                                                onChange={(e) => updateItem('blueprint_items', idx, 'step', e.target.value)}
                                                className="w-16 h-12 bg-white font-black text-center rounded-xl"
                                            />
                                            <Input
                                                value={item.title}
                                                onChange={(e) => updateItem('blueprint_items', idx, 'title', e.target.value)}
                                                placeholder="Module Title"
                                                className="flex-1 h-12 bg-white font-bold rounded-xl"
                                            />
                                        </div>
                                        <Textarea
                                            value={item.content}
                                            onChange={(e) => updateItem('blueprint_items', idx, 'content', e.target.value)}
                                            placeholder="Module Content Description"
                                            className="bg-white rounded-xl"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FAQ */}
                <TabsContent value="faq" className="space-y-6">
                    <Card className="border-[var(--border-light)] shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-bold">Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {(localContent['faq_items'] || []).map((item, idx) => (
                                    <div key={idx} className="p-6 bg-white rounded-2xl border border-gray-100 space-y-4 shadow-sm relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-red-500 h-8 w-8"
                                            onClick={() => removeItem('faq_items', idx)}
                                        >
                                            <RefreshCw size={14} className="rotate-45" />
                                        </Button>
                                        <Input
                                            value={item.q}
                                            onChange={(e) => updateItem('faq_items', idx, 'q', e.target.value)}
                                            placeholder="Question"
                                            className="font-black text-lg border-none p-0 focus-visible:ring-0"
                                        />
                                        <div className="border-t border-gray-100 pt-4">
                                            <Textarea
                                                value={item.a}
                                                onChange={(e) => updateItem('faq_items', idx, 'a', e.target.value)}
                                                placeholder="Answer"
                                                className="border-none p-0 focus-visible:ring-0 resize-none min-h-[80px]"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed rounded-2xl h-14 font-bold"
                                    onClick={() => addItem('faq_items', { q: '', a: '' })}
                                >
                                    + Add New FAQ
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Our Story */}
                <TabsContent value="story" className="space-y-6">
                    <Card className="border-[var(--border-light)] shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-bold">Our Story / About Section</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <ContentField label="Badge Text" value={localContent['story_badge']} onChange={(v) => setLocalContent({ ...localContent, story_badge: v })} />
                                <ContentField label="Section Title" value={localContent['story_title']} onChange={(v) => setLocalContent({ ...localContent, story_title: v })} />
                            </div>
                            <ContentField label="Paragraph 1" textarea value={localContent['story_p1']} onChange={(v) => setLocalContent({ ...localContent, story_p1: v })} />
                            <ContentField label="Paragraph 2" textarea value={localContent['story_p2']} onChange={(v) => setLocalContent({ ...localContent, story_p2: v })} />
                            <ContentField label="Quote Text" textarea value={localContent['story_quote']} onChange={(v) => setLocalContent({ ...localContent, story_quote: v })} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Business Categories */}
                <TabsContent value="categories" className="space-y-6">
                    <Card className="border-[var(--border-light)] shadow-sm">
                        <CardHeader>
                            <CardTitle className="font-bold flex items-center justify-between">
                                Eligible Business Categories
                                <Button
                                    onClick={() => addItem('business_categories_items', { title: 'New Category', items: ['New Item'] })}
                                    className="bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)] font-bold rounded-xl"
                                >
                                    <Plus size={18} className="mr-2" /> Add Category
                                </Button>
                            </CardTitle>
                            <CardDescription>Manage the businesses supported by the BUG Launchpad.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {(localContent['business_categories_items'] || []).map((cat, catIdx) => (
                                <div key={catIdx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative group">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 text-red-500 hover:bg-red-50"
                                        onClick={() => removeItem('business_categories_items', catIdx)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>

                                    <div className="max-w-md">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Category Title</label>
                                        <Input
                                            value={cat.title}
                                            onChange={(e) => updateItem('business_categories_items', catIdx, 'title', e.target.value)}
                                            className="font-bold text-xl bg-white h-12"
                                        />
                                    </div>

                                    <div className="space-y-3 pl-4 border-l-2 border-gray-200 mt-6">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Sub-Items / Services</label>
                                        {(cat.items || []).map((item, itemIdx) => (
                                            <div key={itemIdx} className="flex gap-2">
                                                <Input
                                                    value={item}
                                                    onChange={(e) => {
                                                        const newItems = [...cat.items];
                                                        newItems[itemIdx] = e.target.value;
                                                        updateItem('business_categories_items', catIdx, 'items', newItems);
                                                    }}
                                                    className="bg-white"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-500 shrink-0"
                                                    onClick={() => {
                                                        const newItems = cat.items.filter((_, i) => i !== itemIdx);
                                                        updateItem('business_categories_items', catIdx, 'items', newItems);
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newItems = [...(cat.items || []), ""];
                                                updateItem('business_categories_items', catIdx, 'items', newItems);
                                            }}
                                            className="mt-2 text-xs font-bold border-dashed rounded-lg"
                                        >
                                            + Add Item
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Helper Components
const ContentField = ({ label, value, onChange, placeholder, textarea, className = "" }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
        {textarea ? (
            <Textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className={`rounded-xl bg-white border-gray-200 focus:border-[var(--accent-strong)] transition-colors ${className}`}
                placeholder={placeholder}
            />
        ) : (
            <Input
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={`h-12 rounded-xl bg-white border-gray-200 focus:border-[var(--accent-strong)] transition-colors ${className}`}
                placeholder={placeholder}
            />
        )}
    </div>
);

export default ContentPage;
