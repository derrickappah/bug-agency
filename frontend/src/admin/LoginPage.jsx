import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { TrendingUp, Lock, Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success("Welcome back, Admin!");
            navigate('/admin');
        } catch (error) {
            toast.error(error.message || "Invalid login credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--text-primary)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--accent-primary)]/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--accent-strong)]/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-strong)] rounded-2xl flex items-center justify-center shadow-xl mb-4">
                        <TrendingUp size={32} className="text-[var(--text-primary)]" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">BUG Admin</h1>
                    <p className="text-gray-400 font-medium">Agency Control Center</p>
                </div>

                <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <CardHeader className="space-y-1 pb-8">
                        <CardTitle className="text-2xl font-bold text-white">Login</CardTitle>
                        <CardDescription className="text-gray-400">
                            Enter your credentials to access the dashboard
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        type="email"
                                        placeholder="Admin Email"
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[var(--accent-primary)]"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[var(--accent-primary)]"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-[var(--accent-primary)] text-[var(--text-primary)] hover:bg-[var(--accent-strong)] font-bold py-6 rounded-xl transition-all shadow-lg hover:shadow-[var(--accent-primary)]/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    "Secure Login"
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center mt-8 text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} BUG Agency. Authorized Personnel Only.
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
