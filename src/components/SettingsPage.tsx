import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Moon, Sun, Monitor, Palette, Type, Languages, 
  Bell, Shield, LogOut, ChevronRight, Check, Trash2, ShieldAlert
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

type ThemeMode = 'Light' | 'Dark' | 'System';
type ColorTheme = 'Green' | 'Blue' | 'Gold' | 'Dark Green';
type FontSize = 'Small' | 'Medium' | 'Large';

export function SettingsPage({ onClose }: { onClose: () => void }) {
    const { language, setLanguage } = useLanguage();
    const { 
        themeMode, setThemeMode, 
        colorTheme, setColorTheme, 
        fontSize, setFontSize,
        normalFont, setNormalFont
    } = useTheme();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        window.history.pushState({ modal: 'settings' }, '');
        const handlePopState = (e: PopStateEvent) => {
            onClose();
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [onClose]);

    const handleLogout = async () => {
        if (window.confirm(language === 'bn' ? 'আপনি কি লগআউট করতে চান?' : 'Are you sure you want to logout?')) {
            try {
                await signOut(auth);
                onClose();
            } catch (error) {
                console.error("Logout failed", error);
            }
        }
    };

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-4 px-2">
                {title}
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                {children}
            </div>
        </div>
    );

    const ToggleRow = ({ icon: Icon, title, description, isActive, onClick, colorClass }: any) => (
        <button 
            onClick={onClick}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
        >
            <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">{title}</h4>
                    {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
                </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isActive ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <motion.div 
                    layout
                    className={`w-4 h-4 rounded-full bg-white shadow-sm ${isActive ? 'ml-auto' : ''}`}
                />
            </div>
        </button>
    );

    const OptionRow = ({ icon: Icon, title, description, value, options, onSelect, colorClass }: any) => {
        const [isOpen, setIsOpen] = useState(false);
        
        return (
            <div className="flex flex-col border-b last:border-b-0 border-slate-100 dark:border-slate-700/50">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                >
                    <div className="flex items-center gap-4 flex-1 text-left">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">{title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{value}</p>
                        </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {isOpen && (
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {options.map((opt: any) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onSelect(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                    value === opt.label 
                                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400' 
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                                }`}
                            >
                                <span className="font-medium text-sm">{opt.label}</span>
                                {value === opt.label && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
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
                <h1 className="text-xl font-bold text-slate-800 dark:text-white absolute left-1/2 -translate-x-1/2">
                    {language === 'bn' ? 'সেটিংস' : 'Settings'}
                </h1>
                <div className="w-10"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 py-6 pb-24">
                
                {/* Visual Settings */}
                <Section title={language === 'bn' ? "অ্যাপিয়ারেন্স" : "Appearance"}>
                    <OptionRow 
                        icon={Monitor}
                        title={language === 'bn' ? "থিম মোড" : "Theme Mode"}
                        value={themeMode === 'Dark' ? (language === 'bn' ? 'ডার্ক' : 'Dark') : themeMode === 'Light' ? (language === 'bn' ? 'লাইট' : 'Light') : (language === 'bn' ? 'সিস্টেম' : 'System')}
                        options={[
                            { label: language === 'bn' ? 'সিস্টেম' : 'System', value: 'System' },
                            { label: language === 'bn' ? 'লাইট' : 'Light', value: 'Light' },
                            { label: language === 'bn' ? 'ডার্ক' : 'Dark', value: 'Dark' },
                        ]}
                        onSelect={(v: ThemeMode) => setThemeMode(v)}
                        colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                    />
                    
                    <OptionRow 
                        icon={Palette}
                        title={language === 'bn' ? "কালার থিম" : "Color Theme"}
                        value={colorTheme}
                        options={[
                            { label: 'Green', value: 'Green' },
                            { label: 'Blue', value: 'Blue' },
                            { label: 'Gold', value: 'Gold' },
                            { label: 'Dark Green', value: 'Dark Green' },
                        ]}
                        onSelect={(v: ColorTheme) => setColorTheme(v)}
                        colorClass="bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400"
                    />
                </Section>

                {/* Typography & Language */}
                <Section title={language === 'bn' ? "ভাষা ও ফন্ট" : "Language & Typography"}>
                    <OptionRow 
                        icon={Languages}
                        title={language === 'bn' ? "অ্যাপের ভাষা" : "App Language"}
                        value={language === 'bn' ? 'বাংলা' : 'English'}
                        options={[
                            { label: 'বাংলা', value: 'bn' },
                            { label: 'English', value: 'en' },
                        ]}
                        onSelect={(v: 'bn'|'en') => setLanguage(v)}
                        colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                    />
                    
                    <OptionRow 
                        icon={Type}
                        title={language === 'bn' ? "ফন্টের সাইজ" : "Font Size"}
                        value={fontSize}
                        options={[
                            { label: 'Small', value: 'Small' },
                            { label: 'Medium', value: 'Medium' },
                            { label: 'Large', value: 'Large' },
                        ]}
                        onSelect={(v: FontSize) => setFontSize(v)}
                        colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                    />
                </Section>

                {/* Notifications */}
                <Section title={language === 'bn' ? "নোটিফিকেশন" : "Notifications"}>
                    <ToggleRow 
                        icon={Bell}
                        title={language === 'bn' ? "পুশ নোটিফিকেশন" : "Push Notifications"}
                        description={language === 'bn' ? "গুরুত্বপূর্ণ আপডেট এবং মেসেজ" : "Important updates and messages"}
                        isActive={notificationsEnabled}
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                    />
                </Section>

                {/* Account Actions */}
                <div className="mt-12 space-y-3">
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-red-600 dark:text-red-500 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        {language === 'bn' ? 'লগআউট করুন' : 'Log Out'}
                    </button>
                </div>
                
            </div>
        </motion.div>
    );
}
