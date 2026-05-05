import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Send, 
  Image as ImageIcon, 
  Film, 
  Type, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, getApiUrl } from "@/lib/utils";
import axios from "axios";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface PostContentOverlayProps {
  onClose: () => void;
}

export const PostContentOverlay: React.FC<PostContentOverlayProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"video" | "photo" | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "video" | "photo") => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(type);
      setStatus("idle");
      setError(null);
    }
  };

  const handlePost = async () => {
    if (!file || !fileType) return;
    
    setIsPosting(true);
    setStatus("idle");
    setError(null);
    setUploadProgress(0);

    try {
      const user = auth.currentUser;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("type", fileType);
      formData.append("authorName", user?.displayName || user?.email || (language === 'bn' ? 'ইউজার' : 'User'));
      formData.append("authorUid", user?.uid || "guest-uid");
      
      const appUrl = window.location.origin;
      formData.append("appUrl", appUrl);

      // Create document FIRST to get the ID without fileId yet
      const postsCollection = collection(db, "posts");
      const postRef = await addDoc(postsCollection, {
          content: title,
          type: fileType,
          fileId: "", // Update after upload
          authorName: user?.displayName || user?.email || (language === 'bn' ? 'ইউজার' : 'User'),
          authorUid: user?.uid || "guest-uid",
          authorAvatarUrl: user?.photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",
          likes: 0,
          shares: 0,
          views: 0,
          reactionsCount: 0,
          reportsCount: 0,
          hasMedia: true,
          mediaType: fileType,
          createdAt: serverTimestamp(),
          status: 'pending' // will be approved by admin
      });
      formData.append("postId", postRef.id);

      const response = await axios.post(getApiUrl("/api/telegram/upload"), formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        const fileId = response.data.fileId;
        
        // Update document with actual fileId
        const { updateDoc, doc } = await import("firebase/firestore");
        await updateDoc(doc(db, "posts", postRef.id), {
            fileId: fileId
        });

        setStatus("success");
        setTitle("");
        setFile(null);
        setFileType(null);
        // Do not auto-close as requested
      }
    } catch (err: any) {
      console.error("Post Error:", err);
      setStatus("error");
      const errorMsg = err.response?.data?.details 
        ? (typeof err.response.data.details === 'object' ? JSON.stringify(err.response.data.details) : err.response.data.details)
        : (err.response?.data?.error || (language === 'bn' ? 'পোস্ট করা সম্ভব হয়নি' : "Something went wrong. Please try again."));
      setError(errorMsg);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col"
    >
      {/* Header - White variant */}
      <header className="px-6 pt-safe pb-4 flex items-center gap-4 relative z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <button 
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-900 dark:text-white"
        >
            <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {language === 'bn' ? 'পোস্ট তৈরি করুন' : 'Create Post'}
        </h1>
      </header>

      {/* Main Content Area - Cards attached together */}
      <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto relative z-10 flex flex-col">
        <div className="bg-white dark:bg-slate-900 p-6 flex flex-col border-b border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex-1 relative">
                <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 20))}
                    maxLength={20}
                    placeholder={language === 'bn' ? 'আপনার মনে কি আছে? (সর্বোচ্চ ২০ অক্ষর)' : "What's on your mind? (Max 20 chars)"}
                    className="w-full min-h-[100px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent border-none focus:ring-0 focus:outline-none resize-none font-medium text-lg p-0"
                    autoFocus
                />
                <div className="absolute bottom-2 right-2 text-xs font-bold text-slate-400">
                    {title.length}/20
                </div>
            </div>

            {/* Media Preview Area attached */}
            {file && (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative rounded-[24px] overflow-hidden mt-4 bg-black/5 dark:bg-white/5 border border-slate-100 dark:border-slate-800"
                >
                    {fileType === "photo" ? (
                        <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview" 
                            className="w-full max-h-[400px] object-contain bg-black/5 dark:bg-black/20"
                        />
                    ) : (
                        <video 
                            src={URL.createObjectURL(file)} 
                            className="w-full max-h-[400px] bg-black"
                            controls
                            playsInline
                        />
                    )}
                    
                    <button 
                        onClick={() => {
                            setFile(null);
                            setFileType(null);
                        }}
                        className="absolute flex items-center justify-center top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full shadow-lg active:scale-95 transition-all outline-none"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>

        {/* Posting Progress & Status Popups */}
        <AnimatePresence>
            {isPosting && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-[300px] shadow-2xl flex flex-col items-center gap-4 border border-slate-100 dark:border-slate-800"
                    >
                        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-500 animate-spin" />
                        <div className="text-center">
                             <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                                {fileType === "video" ? (language === 'bn' ? 'ভিডিও আপলোড হচ্ছে...' : 'Uploading Video...') : (language === 'bn' ? 'পোস্ট আপলোড হচ্ছে...' : 'Uploading Post...')}
                             </h4>
                             <p className="text-3xl font-black text-indigo-600 dark:text-indigo-500">{uploadProgress}%</p>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {status === "success" && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-[320px] shadow-2xl flex flex-col items-center gap-4 text-center border border-slate-100 dark:border-slate-800"
                    >
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-black text-2xl text-slate-800 dark:text-white mb-2">
                                {language === 'bn' ? 'অভিনন্দন!' : 'Congratulations!'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                {language === 'bn' 
                                    ? 'আপনার আপলোড সফলভাবে সম্পূর্ণ হয়েছে। অ্যাডমিন অ্যাপ্রুভ করার পর পোস্টটি সবার জন্য উন্মুক্ত করা হবে।' 
                                    : 'Your upload is complete. The post will be public after admin approval.'}
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                setStatus("idle");
                                onClose();
                            }}
                            className="mt-4 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white font-bold transition-colors w-full active:scale-95"
                        >
                            {language === 'bn' ? 'ঠিক আছে' : 'OK'}
                        </button>
                    </motion.div>
                </motion.div>
            )}

            {status === "error" && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-[320px] shadow-2xl flex flex-col items-center gap-4 text-center border border-slate-100 dark:border-slate-800"
                    >
                        <AlertCircle className="w-16 h-16 text-rose-500" />
                        <div>
                            <h3 className="font-black text-2xl text-slate-800 dark:text-white mb-2">
                                {language === 'bn' ? 'ভুল হয়েছে' : 'Error'}
                            </h3>
                            <p className="text-sm font-bold text-rose-500 leading-relaxed opacity-90">
                                {error}
                            </p>
                        </div>
                        <button 
                            onClick={() => setStatus("idle")}
                            className="mt-4 px-8 py-3 bg-rose-500 hover:bg-rose-600 rounded-2xl text-white font-bold transition-colors w-full active:scale-95"
                        >
                            Try Again
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Footer - No white box under icons */}
      <div className="bg-white dark:bg-slate-900 p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
           <div className="flex items-center gap-5 px-3">
                <button 
                    onClick={() => {
                        if (photoInputRef.current) {
                            photoInputRef.current.click();
                        }
                    }}
                    className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 active:scale-95 transition-transform"
                >
                    <ImageIcon className="w-7 h-7" />
                </button>

                <button 
                    onClick={() => {
                        if (videoInputRef.current) {
                            videoInputRef.current.click();
                        }
                    }}
                    className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 active:scale-95 transition-transform"
                >
                    <Film className="w-7 h-7" />
                </button>
           </div>

           <button 
                onClick={handlePost}
                disabled={!file || isPosting}
                className={cn(
                    "px-8 py-3 rounded-full font-bold text-sm transition-all active:scale-95",
                    file && !isPosting 
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                )}
            >
                {language === 'bn' ? 'পোস্ট তৈরি করুন' : 'Create Post'}
           </button>
      </div>

      <input 
        type="file" 
        accept="image/*"
        ref={photoInputRef} 
        className="hidden" 
        onChange={(e) => {
            handleFileChange(e, "photo");
            e.target.value = "";
        }}
      />
      <input 
        type="file" 
        accept="video/*"
        ref={videoInputRef} 
        className="hidden" 
        onChange={(e) => {
            handleFileChange(e, "video");
            e.target.value = "";
        }}
      />
    </motion.div>
  );
};
