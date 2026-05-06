import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Calendar, Star, Info, TrendingUp, Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Sat', score: 300 },
  { name: 'Sun', score: 450 },
  { name: 'Mon', score: 400 },
  { name: 'Tue', score: 600 },
  { name: 'Wed', score: 800 },
  { name: 'Thu', score: 750 },
  { name: 'Fri', score: 950 },
];

export function ProfileStatusModal({ isOpen, onClose, userProfile }: any) {
    const { language } = useLanguage();

    useEffect(() => {
        if (isOpen) {
            window.history.pushState({ modal: 'profile-status' }, '');
            const handlePopState = (e: PopStateEvent) => {
                onClose();
            };
            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-900 flex flex-col pt-safe-top"
            >
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
                    <button
                        onClick={() => {
                            window.history.back();
                            onClose();
                        }}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                    </button>
                    <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            {language === 'bn' ? 'প্রোফাইল স্ট্যাটাস' : 'Profile Status'}
                        </h1>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {language === 'bn' ? 'অ্যাকাউন্ট পারফরম্যান্স' : 'Account Performance'}
                        </p>
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 py-8 pb-24 space-y-5">
                    
                    {/* Header Score/Badge card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mt-4">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black mb-0.5">
                                        {language === 'bn' ? 'চমৎকার পারফরম্যান্স' : 'Excellent Status'}
                                    </h2>
                                    <p className="text-blue-100 text-sm font-medium">
                                        {language === 'bn' ? 'আপনার অ্যাকাউন্ট খুব ভালো অবস্থানে আছে' : 'Your account is in great standing'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">
                                        {language === 'bn' ? 'কমিউনিটি ট্রাস্ট লেভেল' : 'Community Trust Level'}
                                    </p>
                                    <p className="text-xl font-black">98%</p>
                                </div>
                                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-inner">
                                    <CheckCircle2 className="w-6 h-6 text-green-900" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                {language === 'bn' ? 'সাপ্তাহিক এঙ্গেজমেন্ট' : 'Weekly Engagement'}
                            </h3>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorScore)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Account Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col items-center justify-center text-center">
                            <Star className="w-8 h-8 text-amber-500 mb-3" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {language === 'bn' ? 'অ্যাকাউন্ট টাইপ' : 'Account Type'}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-white text-lg">
                                {userProfile?.isVerified || userProfile?.blueBadge 
                                    ? (language === 'bn' ? 'ভেরিফাইড ইউজার' : 'Verified User')
                                    : (language === 'bn' ? 'সাধারণ ইউজার' : 'Standard User')}
                            </span>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col items-center justify-center text-center">
                            <Calendar className="w-8 h-8 text-blue-500 mb-3" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {language === 'bn' ? 'যোগদানের তারিখ' : 'Joined Date'}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-white text-lg">
                                {userProfile?.createdAt 
                                    ? (typeof userProfile.createdAt.toDate === 'function' ? userProfile.createdAt.toDate().toLocaleDateString() : new Date(userProfile.createdAt).toLocaleDateString())
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Violations / Strikes (Zero state) */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-slate-400" />
                                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                    {language === 'bn' ? 'কমিউনিটি স্ট্রাইক' : 'Community Strikes'}
                                </h3>
                            </div>
                            <span className="px-3 py-1 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-sm font-bold rounded-xl border border-green-200 dark:border-green-500/20">
                                0 / 3
                            </span>
                        </div>
                        <div className="flex items-start gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                {language === 'bn' 
                                    ? 'বর্তমানে কোনো কমিউনিটি গাইডলাইন স্ট্রাইক নেই। প্ল্যাটফর্মে সুন্দর ও নিরাপদ পরিবেশ বজায় রাখার জন্য ধন্যবাদ।' 
                                    : 'There are currently no community guideline strikes on your account. Thank you for keeping the platform safe and positive.'}
                            </p>
                        </div>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
}
