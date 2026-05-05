import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Send, 
  Image as ImageIcon, 
  Film, 
  Camera,
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
  initialFile?: File | null;
  initialFileType?: "video" | "photo" | null;
}

export const PostContentOverlay: React.FC<PostContentOverlayProps> = ({ 
  onClose, 
  initialFile, 
  initialFileType 
}) => {
  const { language } = useLanguage();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [fileType, setFileType] = useState<"video" | "photo" | null>(initialFileType || null);
  const [category, setCategory] = useState("turkey");
  const [isPosting, setIsPosting] = useState(false);

  const categories = [
    { id: 'turkey', label: { bn: 'তুরস্ক', en: 'Turkey' } },
    { id: 'news', label: { bn: 'খবর', en: 'News' } },
    { id: 'islamic', label: { bn: 'ইসলামিক', en: 'Islamic' } },
    { id: 'shorts', label: { bn: 'শর্টস', en: 'Shorts' } },
    { id: 'movies', label: { bn: 'মুভি', en: 'Movies' } },
    { id: 'mix', label: { bn: 'মিক্স', en: 'Mix' } }
  ];

  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Hide global navigation when posting overlay is open
    window.dispatchEvent(new CustomEvent('set-nav-visibility', { detail: false }));
    return () => {
      // Show global navigation when posting overlay is closed
      window.dispatchEvent(new CustomEvent('set-nav-visibility', { detail: true }));
    };
  }, []);

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
      formData.append("category", category);
      formData.append("authorName", user?.displayName || user?.email || (language === 'bn' ? 'ইউজার' : 'User'));
      formData.append("authorUid", user?.uid || "guest-uid");
      
      const appUrl = window.location.origin;
      formData.append("appUrl", appUrl);

      // Create document FIRST to get the ID without fileId yet
      const postsCollection = collection(db, "posts");
      const postRef = await addDoc(postsCollection, {
          content: title,
          type: fileType,
          category: category,
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

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto relative z-10 flex flex-col bg-slate-50 dark:bg-slate-950">
        
        {/* 1. Media Preview Card (16:9) */}
        <div className="bg-black w-full aspect-square md:aspect-video relative group flex items-center justify-center">
            {file ? (
                <>
                    {fileType === "photo" ? (
                        <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <video 
                            src={URL.createObjectURL(file)} 
                            className="w-full h-full max-h-[60vh] object-contain"
                            controls
                            playsInline
                        />
                    )}
                    <button 
                        onClick={() => {
                            setFile(null);
                            setFileType(null);
                        }}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors shadow-lg z-20"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex gap-6">
                        <button 
                            onClick={async () => {
                                try {
                                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
                                    stream.getTracks().forEach(track => track.stop());
                                    cameraInputRef.current?.click();
                                } catch (err) {
                                    console.error(err);
                                    cameraInputRef.current?.click();
                                }
                            }}
                            className="w-16 h-16 bg-white dark:bg-slate-800 text-blue-500 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700"
                        >
                            <Camera className="w-8 h-8" />
                        </button>
                        <button 
                            onClick={() => photoInputRef.current?.click()}
                            className="w-16 h-16 bg-white dark:bg-slate-800 text-emerald-500 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700"
                        >
                            <ImageIcon className="w-8 h-8" />
                        </button>
                        <button 
                            onClick={() => videoInputRef.current?.click()}
                            className="w-16 h-16 bg-white dark:bg-slate-800 text-rose-500 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700"
                        >
                            <Film className="w-8 h-8" />
                        </button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-wide">
                        {language === 'bn' ? 'ফটো বা ভিডিও সিলেক্ট করুন' : 'Select Photo or Video'}
                    </p>
                </div>
            )}
        </div>

        {/* 2. Title Card (20 chars max) */}
        <div className="bg-white dark:bg-slate-900 w-full p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                    {language === 'bn' ? 'পোস্ট টাইটেল' : 'Post Title'}
                </label>
                <span className={cn(
                    "text-[11px] font-bold px-2 py-0.5 rounded-full",
                    title.length >= 20 ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                )}>
                    {title.length}/20
                </span>
            </div>
            <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 20))}
                placeholder={language === 'bn' ? 'টাইটেল লিখুন...' : 'Enter title...'}
                className="w-full bg-transparent text-slate-900 dark:text-white font-bold text-lg focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
        </div>

        {/* 3. Category Card */}
        <div className="bg-white dark:bg-slate-900 w-full p-5 border-b border-slate-200 dark:border-slate-800">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-4">
                {language === 'bn' ? 'ক্যাটাগরি সিলেক্ট করুন' : 'Select Category'}
            </label>
            <div className="flex flex-wrap gap-2.5">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-bold transition-all border",
                            category === cat.id
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                    >
                        {cat.label[language]}
                    </button>
                ))}
            </div>
        </div>

        {/* 4. Post Button Card */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 mt-auto">
            <button 
                onClick={handlePost}
                disabled={!file || !title || isPosting}
                className={cn(
                    "w-full h-14 rounded-full font-black text-lg transition-all flex items-center justify-center gap-3",
                    file && title && !isPosting 
                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-95" 
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                )}
            >
                {isPosting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        {language === 'bn' ? 'পোস্ট করুন' : 'Post Now'}
                    </>
                )}
            </button>
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
                            className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-white font-bold transition-colors w-full active:scale-95 shadow-lg shadow-indigo-600/20"
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
      <input 
        type="file" 
        accept="video/*"
        capture="environment"
        ref={cameraInputRef} 
        className="hidden" 
        onChange={(e) => {
            handleFileChange(e, "video");
            e.target.value = "";
        }}
      />
    </motion.div>
  );
};
