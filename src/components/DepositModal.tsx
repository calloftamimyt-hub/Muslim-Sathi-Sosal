import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ArrowLeft, CheckCircle2, AlertTriangle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export const DepositModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { language } = useLanguage();
  const [amount, setAmount] = useState<number>(100);
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorObj, setErrorObj] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(screenshotPreview);
      }
    };
  }, [screenshotPreview]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorObj(language === 'bn' ? 'ফাইল সাইজ ১০ এমবির ছোট হতে হবে।' : 'File size must be under 10MB.');
        return;
      }
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setErrorObj(null);
    }
  };

  const handleValidation = () => {
    if (!screenshot) {
      setErrorObj(language === 'bn' ? 'স্ক্রিনশট আপলোড করা আবশ্যক!' : 'Screenshot upload is required!');
      return;
    }
    if (amount < 50) {
      setErrorObj(language === 'bn' ? 'নূন্যতম ডিপোজিট ৫০ টাকা।' : 'Minimum deposit is 50 Tk.');
      return;
    }
    if (!senderNumber || !trxId) {
      setErrorObj(language === 'bn' ? 'নাম্বার এবং TrxID প্রদান করুন।' : 'Please provide Number and TrxID.');
      return;
    }
    setErrorObj(null);
    setShowConfirm(true);
  };

  const handleDepositSubmit = async () => {
    if (!auth.currentUser) return;
    
    setIsLoading(true);
    setErrorObj(null);
    try {
      // 1. Fetch Telegram Setup from admin_settings
      const settingsDoc = await getDoc(doc(db, 'admin_settings', 'general'));
      const settings = settingsDoc.exists() ? settingsDoc.data() : null;
      const botToken = settings?.telegramBotToken || '8577168806:AAEvPksc7qHSYmr0wzE7DwHQeglzOUZZn5U';
      const chatId = settings?.telegramChatId || '-1002647379129';

      // 2. Upload to Telegram
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', screenshot);
      
      const caption = `🚨 <b>New Deposit Request</b>\n\n👤 User: <code>${auth.currentUser.uid}</code>\n📧 Email: ${auth.currentUser.email}\n💰 Amount: <b>${amount} Tk</b>\n📞 Sender: <code>${senderNumber}</code>\n🆔 TrxID: <code>${trxId}</code>\n\n📌 <i>Please review and approve from Admin Panel.</i>`;
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');

      const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        body: formData
      });

      if (!tgResponse.ok) {
        throw new Error('Telegram API failure');
      }

      const tgData = await tgResponse.json();
      let uploadedFileUrl = '';
      if (tgData.ok && tgData.result.photo) {
         const photoArray = tgData.result.photo;
         const fileId = photoArray[photoArray.length - 1].file_id;
         const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
         const fileData = await fileRes.json();
         if (fileData.ok) {
            uploadedFileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
         }
      }

      // 3. Save to Firestore deposit_requests collection
      await addDoc(collection(db, 'deposit_requests'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        amount,
        senderNumber,
        trxId,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setShowConfirm(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (e) {
       console.error("Failed to deposit", e);
       setErrorObj(language === 'bn' ? 'সার্ভার সমস্যা, একটু পরে চেষ্টা করুন।' : 'Server error, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
       <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl my-8">
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
             <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" /></button>
             <h3 className="font-bold text-lg text-slate-800 dark:text-white">{language === 'bn' ? 'ডিপোজিট করুন' : 'Deposit Funds'}</h3>
          </div>
          
          <div className="p-6">
             {success ? (
               <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-500 py-12">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="font-bold text-xl text-center">
                    {language === 'bn' ? 'ডিপোজিট রিকুয়েস্ট সফল!' : 'Deposit Request Successful!'}
                  </p>
                  <p className="text-slate-500 text-sm mt-2 text-center px-4">
                    {language === 'bn' ? 'এডমিন রিভিউ করার পর ব্যালেন্স এড করা হবে।' : 'Balance will be added after admin review.'}
                  </p>
               </div>
             ) : (
               <>
                 <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6">
                   <div className="flex gap-3">
                     <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                     <div>
                       <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm">
                         {language === 'bn' ? 'সতর্কতা ও নিয়মাবলী' : 'Warning & Rules'}
                       </h4>
                       <ul className="mt-2 space-y-1 text-xs text-rose-600 dark:text-rose-300/80 list-disc list-inside">
                          <li>{language === 'bn' ? 'ভুল বা ফেইক ডিপোজিট রিকুয়েস্ট দিলে অ্যাকাউন্ট সাথে সাথে সাসপেন্ড করা হবে।' : 'Fake deposit requests will result in instant account suspension.'}</li>
                          <li>{language === 'bn' ? 'ডিপোজিট সেন্ড মানি (Send Money) করে স্ক্রিনশট দিতে হবে।' : 'Send money and upload the valid screenshot.'}</li>
                          <li>{language === 'bn' ? 'মিনিমাম ডিপোজিট ৫০ টাকা।' : 'Minimum deposit is 50 Tk.'}</li>
                       </ul>
                     </div>
                   </div>
                 </div>

                 {errorObj && (
                    <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-200 mb-4 font-medium text-center">
                       {errorObj}
                    </div>
                 )}

                 <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                         {language === 'bn' ? 'ডিপোজিট অ্যামাউন্ট (৳)' : 'Deposit Amount (৳)'}
                      </label>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(Number(e.target.value))} 
                        className="w-full text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 py-2.5 px-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-violet-500 outline-none transition-colors" 
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                           {language === 'bn' ? 'যে নাম্বার থেকে পাঠিয়েছেন' : 'Sent From (Number)'}
                        </label>
                        <input 
                          type="text" 
                          placeholder="017........"
                          value={senderNumber} 
                          onChange={e => setSenderNumber(e.target.value)} 
                          className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 py-2.5 px-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-violet-500 outline-none transition-colors" 
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                           {language === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID'}
                        </label>
                        <input 
                          type="text" 
                          placeholder="ABC123XYZ"
                          value={trxId} 
                          onChange={e => setTrxId(e.target.value)} 
                          className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 py-2.5 px-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-violet-500 outline-none transition-colors" 
                        />
                     </div>
                   </div>

                   <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                         {language === 'bn' ? 'পেমেন্ট স্ক্রিনশট' : 'Payment Screenshot'}
                      </label>
                      
                      {!screenshotPreview ? (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-3">
                             <Upload className="w-6 h-6 text-violet-500" />
                          </div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                             {language === 'bn' ? 'স্ক্রিনশট আপলোড করতে ক্লিক করুন' : 'Click to upload screenshot'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG, max 10MB</p>
                        </div>
                      ) : (
                        <div className="relative rounded-xl border-2 border-slate-200 dark:border-slate-700 p-2">
                           <img src={screenshotPreview} alt="Screenshot" className="w-full h-40 object-cover rounded-lg" />
                           <button 
                             onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                             className="absolute top-4 right-4 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                           >
                             <X className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                   </div>
                 </div>

                 <button 
                    onClick={handleValidation} 
                    className="w-full mt-6 py-4 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
                  >
                     {language === 'bn' ? 'ডিপোজিট রিকুয়েস্ট পাঠান' : 'Send Deposit Request'}
                  </button>
               </>
             )}
          </div>
       </motion.div>

       {/* Confirmation Bottom Sheet/Modal */}
       <AnimatePresence>
         {showConfirm && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[700] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
           >
             <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{ type: "spring", bounce: 0, duration: 0.4 }}
               className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
             >
               <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 sticky top-0 shrink-0 z-10">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                   <AlertTriangle className="w-5 h-5 text-rose-500" />
                   {language === 'bn' ? 'সতর্কতা ও নিশ্চিতকরণ' : 'Warning & Confirmation'}
                 </h3>
                 <button 
                   onClick={() => !isLoading && setShowConfirm(false)}
                   disabled={isLoading}
                   className="p-2 -mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                 >
                   <X className="w-5 h-5 text-slate-500" />
                 </button>
               </div>

               <div className="p-4 sm:p-6 overflow-y-auto">
                 <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6">
                   <ul className="space-y-3 text-sm text-rose-700 dark:text-rose-300 list-disc list-outside ml-4 font-medium">
                      <li>{language === 'bn' ? 'ভুল বা ফেইক ডিপোজিট রিকুয়েস্ট দিলে আপনার একাউন্ট চিরতরে সাসপেন্ড করা হবে।' : 'Fake deposit requests will result in permanent account suspension.'}</li>
                      <li>{language === 'bn' ? 'সঠিক সেন্ডার নাম্বার, TrxID এবং সঠিক স্ক্রিনশট দিতে হবে।' : 'Correct Sender Number, TrxID, and Screenshot are mandatory.'}</li>
                      <li>{language === 'bn' ? 'এডমিন ম্যানুয়ালি চেক করার পর আপনার ব্যালেন্স এড হবে, দয়া করে অপেক্ষা করুন।' : 'Wait until admin reviews your transaction manually.'}</li>
                   </ul>
                 </div>

                 <p className="text-center font-bold text-slate-700 dark:text-slate-300 mb-6">
                   {language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনার দেওয়া তথ্য সঠিক?' : 'Are you sure your provided information is correct?'}
                 </p>

                 <div className="flex gap-3">
                   <button 
                     onClick={() => setShowConfirm(false)}
                     disabled={isLoading}
                     className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                   >
                     {language === 'bn' ? 'বাতিল' : 'Cancel'}
                   </button>
                   <button 
                     onClick={() => {
                        handleDepositSubmit();
                     }}
                     disabled={isLoading}
                     className="flex-1 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                   >
                     {isLoading ? (
                       <>
                         <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                       </>
                     ) : (
                       language === 'bn' ? 'হ্যাঁ, আমি নিশ্চিত' : 'Yes, Confirm'
                     )}
                   </button>
                 </div>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

