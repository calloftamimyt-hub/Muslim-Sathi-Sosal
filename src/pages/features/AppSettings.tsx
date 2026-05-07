import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Globe, Palette, Shield, ChevronRight, Trash2, Loader2, Check,
  Lock, Smartphone, UserX, Eye, LogOut, Bell, PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PrivacySecurityView } from './PrivacySecurity';
import { DataPermissionView } from './DataPermissionView';
import { DeleteAccountView } from './DeleteAccountView';
import { LanguageSelectionView } from './LanguageSelectionView';
import { TwoStepVerificationView } from './TwoStepVerificationView';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface AppSettingsProps {
  onBack: () => void;
}

const STORAGE_KEY = 'islamic_app_settings';

export function AppSettings({ onBack }: AppSettingsProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { language, preference, setLanguage, t } = useLanguage();
  const { 
    themeMode, colorTheme, fontSize, arabicFont, normalFont, 
    setThemeMode, setColorTheme, setFontSize, setArabicFont, setNormalFont 
  } = useTheme();

  const [settings, setSettings] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      'auto-location': true,
      'profile-visibility': 'Public',
      'theme': 'System',
      'offline-mode': false,
      'auto-play-video': true,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setSettings(prev => ({
              ...prev,
              ...(data.profileVisibility && { 'profile-visibility': data.profileVisibility }),
              ...(data.commentPermission && { 'comment-permission': data.commentPermission })
            }));
          }
        } catch (error) {
          console.error("Error fetching user settings:", error);
        }
      }
    };
    fetchUserSettings();
    
    const handlePopState = () => {
      if (activeModal) {
        setActiveModal(null);
      } else {
        onBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeModal, onBack]);

  const updateSelectSetting = async (id: string, value: string) => {
    if (id === 'theme-mode') setThemeMode(value as any);
    else if (id === 'app-color-theme') setColorTheme(value as any);
    else if (id === 'arabic-font') setArabicFont(value as any);
    else if (id === 'normal-font') setNormalFont(value as any);
    else if (id === 'font-size') setFontSize(value as any);
    else if (id === 'madhab-selection') {
      localStorage.setItem('islamic_app_madhab', value);
      window.dispatchEvent(new Event('madhab-changed'));
      setSettings(prev => ({ ...prev, [id]: value }));
    } else {
      setSettings(prev => ({ ...prev, [id]: value }));
    }
    
    if ((id === 'profile-visibility' || id === 'comment-permission') && auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
          [id === 'profile-visibility' ? 'profileVisibility' : 'commentPermission']: value
        });
      } catch (error) {
        console.error(`Error updating ${id} in Firestore:`, error);
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি লগআউট করতে চান?' : 'Are you sure you want to logout?')) {
        try {
            await signOut(auth);
            onBack();
        } catch (error) {
            console.error("Logout failed", error);
        }
    }
  };

  const OptionRow = ({ title, value, options, onSelect, icon: Icon, colorClass, isLanguage }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="flex flex-col border-b last:border-b-0 border-slate-100 dark:border-slate-800/50">
        <button 
          onClick={() => {
            if (isLanguage) {
               window.history.pushState({ modal: 'language-selection' }, '');
               setActiveModal('language-selection-view');
            } else {
               setIsOpen(!isOpen);
            }
          }}
          className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-4 flex-1">
            {Icon && (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">{title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isLanguage ? value : (value || 'Select option')}
              </p>
            </div>
          </div>
          <ChevronRight className={cn("w-5 h-5 text-slate-400 transition-transform", isOpen && !isLanguage && "rotate-90")} />
        </button>
        
        {isOpen && !isLanguage && (
          <div className="bg-slate-50 dark:bg-slate-800/30 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800/50">
            {options.map((opt: any) => {
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const isSelected = value === optValue;
              
              return (
                <button
                  key={optValue}
                  onClick={() => {
                    onSelect(optValue);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
                    isSelected 
                      ? "bg-primary/5 border-primary/20 text-primary dark:bg-primary-dark/10 dark:border-primary-dark/30 dark:text-primary-light" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  )}
                >
                  <span className="font-medium text-sm">{optLabel}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary dark:text-primary-light" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const ActionRow = ({ title, onClick, icon: Icon, colorClass, customIcon }: any) => (
    <button 
      onClick={onClick}
      className="w-full px-4 py-4 border-b last:border-b-0 border-slate-100 dark:border-slate-800/50 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
    >
      <div className="flex items-center gap-4 flex-1">
        {Icon && (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">{title}</h4>
      </div>
      {customIcon || <ChevronRight className="w-5 h-5 text-slate-400" />}
    </button>
  );

  const ToggleRow = ({ icon: Icon, title, description, isActive, onClick, colorClass }: any) => (
    <button 
      onClick={onClick}
      className="w-full px-4 py-4 border-b last:border-b-0 border-slate-100 dark:border-slate-800/50 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
    >
      <div className="flex items-center gap-4 flex-1">
        {Icon && (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-[15px]">{title}</h4>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isActive ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <motion.div 
          layout
          className={`w-4 h-4 rounded-full bg-white shadow-sm ${isActive ? 'ml-auto' : ''}`}
        />
      </div>
    </button>
  );

  const Section = ({ title, icon: TitleIcon, children }: any) => (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 pt-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50">
        <TitleIcon className="w-4 h-4 text-primary dark:text-primary-light" />
        <h3 className="text-[14px] font-bold text-primary dark:text-primary-light uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="bg-white dark:bg-slate-900">
        {children}
      </div>
    </div>
  );

  const translateTheme = (v: string) => {
    if (v === 'Light') return t('light-mode' as any) || 'Light';
    if (v === 'Dark') return t('dark-mode' as any) || 'Dark';
    if (v === 'System') return t('system-mode' as any) || 'System';
    return v;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans relative">
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 px-4 pt-safe pb-4 flex items-center border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {language === 'bn' ? 'অ্যাপ সেটিংস' : 'App Settings'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto w-full pb-24 bg-white dark:bg-slate-900">
        
        <Section title={t('language-settings' as any) || 'ভাষা ও মাযহাব'} icon={Globe}>
          <OptionRow 
            title={t('select-language' as any) || 'ভাষা নির্বাচন'}
            value={preference === 'auto' ? (t('auto-language' as any) || 'Auto (Device Language)') : preference === 'bn' ? 'বাংলা' : 'English'}
            isLanguage={true}
          />
          <OptionRow 
            title="মাযহাব (Madhab)"
            value={localStorage.getItem('islamic_app_madhab') || 'Shafi'}
            options={['Hanafi', 'Maliki', 'Shafi', 'Hanbali']}
            onSelect={(v: string) => updateSelectSetting('madhab-selection', v)}
          />
        </Section>

        <Section title={t('theme-settings' as any) || 'থিম / ডিজাইন'} icon={Palette}>
          <OptionRow 
            title={t('dark-light-mode')}
            value={themeMode}
            options={[
              { label: translateTheme('Light'), value: 'Light' },
              { label: translateTheme('Dark'), value: 'Dark' },
              { label: translateTheme('System'), value: 'System' }
            ]}
            onSelect={(v: string) => updateSelectSetting('theme-mode', v)}
          />
          <OptionRow 
            title={t('app-color-theme')}
            value={colorTheme}
            options={['Green', 'Blue', 'Gold', 'Dark Green']}
            onSelect={(v: string) => updateSelectSetting('app-color-theme', v)}
          />
          <OptionRow 
            title="সাধারণ ফন্ট (বাংলা/ইংরেজি)"
            value={normalFont}
            options={['Bengali', 'Inter', 'Roboto']}
            onSelect={(v: string) => updateSelectSetting('normal-font', v)}
          />
          <OptionRow 
            title="আরবি ফন্ট (কুরআনের জন্য)"
            value={arabicFont}
            options={['Amiri', 'Scheherazade', 'Traditional']}
            onSelect={(v: string) => updateSelectSetting('arabic-font', v)}
          />
          <OptionRow 
            title={t('font-size')}
            value={fontSize}
            options={['Small', 'Medium', 'Large']}
            onSelect={(v: string) => updateSelectSetting('font-size', v)}
          />
        </Section>

        <Section title={language === 'bn' ? "মিডিয়া" : "Media"} icon={PlayCircle}>
            <ToggleRow 
                icon={PlayCircle}
                title={language === 'bn' ? "অটো-প্লে ভিডিও" : "Auto-Play Video"}
                description={language === 'bn' ? "ভিডিওগুলি সয়ংক্রিয়ভাবে চালু হবে" : "Videos will play automatically"}
                isActive={settings['auto-play-video'] !== false}
                onClick={() => {
                   const newValue = settings['auto-play-video'] === false ? true : false;
                   setSettings(prev => ({ ...prev, 'auto-play-video': newValue }));
                }}
                colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            />
        </Section>

        <Section title={language === 'bn' ? "নোটিফিকেশন" : "Notifications"} icon={Bell}>
            <ToggleRow 
                icon={Bell}
                title={language === 'bn' ? "পুশ নোটিফিকেশন" : "Push Notifications"}
                description={language === 'bn' ? "গুরুত্বপূর্ণ আপডেট এবং মেসেজ" : "Important updates and messages"}
                isActive={notificationsEnabled}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
            />
        </Section>

        <Section title={t('privacy-settings' as any) || 'প্রাইভেসি ও সিকিউরিটি'} icon={Shield}>
            <ActionRow 
              title={language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
              onClick={() => {}}
              icon={Lock}
              colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />
            <ActionRow 
              title={language === 'bn' ? 'টু-স্টেপ ভেরিফিকেশন' : 'Two-Step Verification'}
              onClick={() => {
                window.history.pushState({ modal: 'two-step' }, '');
                setActiveModal('two-step-view');
              }}
              icon={Smartphone}
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            />
            <ActionRow 
              title={language === 'bn' ? 'ব্লকড ইউজার্স' : 'Blocked Users'}
              onClick={() => {}}
              icon={UserX}
              colorClass="bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            />
            <ActionRow 
              title={language === 'bn' ? 'প্রোফাইল ভিজিবিলিটি' : 'Profile Visibility'}
              onClick={() => {}}
              icon={Eye}
              colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
            />
            <ActionRow 
              title={t('privacy-policy')}
              onClick={() => {
                window.history.pushState({ modal: 'privacy' }, '');
                setActiveModal('privacy-security-view');
              }}
              icon={Shield}
              colorClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            />
            <ActionRow 
              title={t('terms-conditions')}
              onClick={() => {
                 window.history.pushState({ modal: 'terms' }, '');
                 setActiveModal('terms-view');
              }}
              icon={Shield}
              colorClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            />
            <ActionRow 
              title={t('data-permission-control')}
              onClick={() => {
                 window.history.pushState({ modal: 'data' }, '');
                 setActiveModal('data-permission-view');
              }}
              icon={Shield}
              colorClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            />
            <ActionRow 
              title={t('account-delete')}
              onClick={() => {
                 window.history.pushState({ modal: 'delete' }, '');
                 setActiveModal('delete-account-view');
              }}
              icon={Trash2}
              colorClass="bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            />
        </Section>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-4 pt-6 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50">
            <h3 className="text-[14px] font-bold text-primary dark:text-primary-light uppercase tracking-wider">
              {language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}
            </h3>
          </div>
          <button 
              onClick={handleLogout}
              className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/50 text-red-600 dark:text-red-500 font-bold py-4 px-6 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
              <LogOut className="w-5 h-5" />
              {language === 'bn' ? 'লগআউট করুন' : 'Log Out'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col pt-safe-top"
          >
            {activeModal === 'privacy-security-view' && <PrivacySecurityView type="privacy" onBack={() => window.history.back()} />}
            {activeModal === 'terms-view' && <PrivacySecurityView type="terms" onBack={() => window.history.back()} />}
            {activeModal === 'data-permission-view' && <DataPermissionView settings={settings} onToggle={() => {}} onBack={() => window.history.back()} />}
            {activeModal === 'delete-account-view' && <DeleteAccountView onBack={() => window.history.back()} />}
            {activeModal === 'language-selection-view' && <LanguageSelectionView onBack={() => window.history.back()} />}
            {activeModal === 'two-step-view' && <TwoStepVerificationView onBack={() => window.history.back()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
