import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from '../lib/supabaseClient';

export function PurchaseDialog({ open, onOpenChange, tier, amount, onStartPayment, categories, isLoadingCategories, isSubmitting }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        businessType: ""
    });

    useEffect(() => {
        if (open) {
            setStep(1);
        }
    }, [open]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value) => {
        setFormData(prev => ({ ...prev, businessType: value }));
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone || !formData.businessType) {
            toast.error("Please fill in all fields.");
            return;
        }
        setStep(2);
    };

    const handlePayment = () => {
        onStartPayment(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Get {tier}</DialogTitle>
                    <DialogDescription>
                        {step === 1 ? "Tell us about your business to get the right guide." : "Review and complete your purchase."}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <form onSubmit={handleNext} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Kofi Mensah" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="kofi@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number (MoMo)</Label>
                            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="024 XXX XXXX" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="businessType">Business Type</Label>
                            <Select onValueChange={handleSelectChange} value={formData.businessType} required disabled={isLoadingCategories}>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingCategories ? "Loading business types..." : "Select your industry"} />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {isLoadingCategories ? (
                                        <SelectItem value="loading" disabled>
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Loading...
                                            </div>
                                        </SelectItem>
                                    ) : categories.length === 0 ? (
                                        <SelectItem value="none" disabled>
                                            No business types available
                                        </SelectItem>
                                    ) : (
                                        categories.map((category) => (
                                            <SelectItem key={category.id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">Next</Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Package:</span>
                                <span className="font-semibold">{tier}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Business:</span>
                                <span className="font-semibold capitalize">{formData.businessType}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Email:</span>
                                <span className="font-medium">{formData.email}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                                <span className="font-bold">Total:</span>
                                <span className="text-xl font-bold text-green-600">GHS {amount}</span>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 text-center">
                            By clicking Pay, you agree to our Terms of Service.
                            <br />Secure payment via Paystack.
                        </div>

                        <DialogFooter className="flex-col sm:flex-col gap-2">
                            <Button
                                onClick={handlePayment}
                                disabled={isSubmitting}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    `Pay GHS ${amount}`
                                )}
                            </Button>
                            <Button variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting} className="w-full">
                                Back
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
