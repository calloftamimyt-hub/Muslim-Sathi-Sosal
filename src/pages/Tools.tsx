import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Image,
  Download,
  Hash,
  Type,
  FileText,
  Calculator,
  Edit3,
  TrendingUp,
  Youtube,
  Facebook,
  Wrench,
  Play,
  Star,
  Video,
  Camera,
  Sparkles,
  Zap,
  PenTool,
  Calendar,
  Search,
  Brush,
  Mic,
  Volume2,
  AlignLeft,
  BarChart,
  Key,
  CalendarDays,
  Activity,
  Shield,
  Timer,
  Palette,
  QrCode,
  Braces,
  ArrowRightLeft,
  Receipt,
  Binary,
  AlignJustify,
  Percent,
  Coins,
  Clock,
  ListTodo,
  CalendarClock,
  Dices,
  Fingerprint,
  Code,
  Link,
  ShieldCheck,
  Terminal,
  FileCode,
  Smartphone,
  Banknote,
  RefreshCcw,
  Shuffle,
  LockKeyhole,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Settings,
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Share2,
  Flag,
  Trash2,
  Menu,
  X,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, getApiUrl } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, increment } from "firebase/firestore";
import { TagsGenTool } from "@/components/tools/TagsGenTool";
import { TitleGenTool } from "@/components/tools/TitleGenTool";
import { EarnCalcTool } from "@/components/tools/EarnCalcTool";
import { WordCountTool } from "@/components/tools/WordCountTool";
import { SEOTesterTool } from "@/components/tools/SEOTesterTool";
import { ChannelAuditTool } from "@/components/tools/ChannelAuditTool";
import { KeywordResTool } from "@/components/tools/KeywordResTool";
import { AgeCalcTool } from "@/components/tools/AgeCalcTool";
import { BMICalcTool } from "@/components/tools/BMICalcTool";
import { PassGenTool } from "@/components/tools/PassGenTool";
import { StopwatchTool } from "@/components/tools/StopwatchTool";
import { QRMakerTool } from "@/components/tools/QRMakerTool";
import { JSONFormatTool } from "@/components/tools/JSONFormatTool";
import { UnitConvTool } from "@/components/tools/UnitConvTool";
import { ExpenseTrackTool } from "@/components/tools/ExpenseTrackTool";
import { Base64EncodeTool } from "@/components/tools/Base64EncodeTool";
import { TipCalcTool } from "@/components/tools/TipCalcTool";
import { PomodoroTool } from "@/components/tools/PomodoroTool";
import { TodoListTool } from "@/components/tools/TodoListTool";
import { DateCalcTool } from "@/components/tools/DateCalcTool";
import { UrlEncodeTool } from "@/components/tools/UrlEncodeTool";
import { PassCheckerTool } from "@/components/tools/PassCheckerTool";
import { RegexTestTool } from "@/components/tools/RegexTestTool";
import { MDEditorTool } from "@/components/tools/MDEditorTool";
import { RandomNumTool } from "@/components/tools/RandomNumTool";
import { TextCaseTool } from "@/components/tools/TextCaseTool";
import { UUIDMakerTool } from "@/components/tools/UUIDMakerTool";
import { CodeFormatTool } from "@/components/tools/CodeFormatTool";
import { DeviceInfoTool } from "@/components/tools/DeviceInfoTool";
import { SalaryCalcTool } from "@/components/tools/SalaryCalcTool";
import { TextReverserTool } from "@/components/tools/TextReverserTool";
import { WordScramblerTool } from "@/components/tools/WordScramblerTool";
import { LoremGenTool } from "@/components/tools/LoremGenTool";
import { DiscountCalcTool } from "@/components/tools/DiscountCalcTool";
import { PercentageCalcTool } from "@/components/tools/PercentageCalcTool";
import { YTThumbnailTool } from "@/components/tools/YTThumbnailTool";
import { PostContentOverlay } from "@/components/tools/PostContentOverlay";
import { ReportModal } from "@/components/tools/ReportModal";
import { PlaySquare, Image as ImageIcon, Film, Send, CheckCircle2, UserPlus, UserMinus, Edit2 } from "lucide-react"; 
import { VerifiedBadge } from "@/components/VerifiedBadge";

const SOCIAL_TOOLS = [
  {
    id: "yt-thumbnail",
    title: { bn: "থাম্বনেইল ডাউনলোড", en: "YT Thumbnail" },
    icon: Youtube,
    color: "text-white",
    bg: "bg-gradient-to-br from-red-500 to-rose-600",
    comingSoon: false,
  },
  {
    id: "tags-gen",
    title: { bn: "ট্যাগ জেনারেটর", en: "Tags Gen" },
    icon: Hash,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    comingSoon: false,
  },

  {
    id: "title-gen",
    title: { bn: "টাইটেল জেনারেটর", en: "Title Gen" },
    icon: Type,
    color: "text-white",
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
    comingSoon: false,
  },
  {
    id: "earn-calc",
    title: { bn: "আর্নিং হিসাব", en: "Earn Calc" },
    icon: Calculator,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-400 to-blue-500",
    comingSoon: false,
  },
  {
    id: "char-count",
    title: { bn: "ওয়ার্ড কাউন্ট", en: "Word Count" },
    icon: Edit3,
    color: "text-white",
    bg: "bg-gradient-to-br from-pink-400 to-rose-500",
    comingSoon: false,
  },
  {
    id: "seo-check",
    title: { bn: "এসইও টেস্টার", en: "SEO Test" },
    icon: Zap,
    color: "text-white",
    bg: "bg-gradient-to-br from-slate-600 to-slate-800",
    comingSoon: false,
  },
  {
    id: "channel-audit",
    title: { bn: "চ্যানেল অডিট", en: "Channel Audit" },
    icon: BarChart,
    color: "text-white",
    bg: "bg-gradient-to-br from-fuchsia-400 to-pink-500",
    comingSoon: false,
  },
  {
    id: "keyword-res",
    title: { bn: "কিওয়ার্ড রিসার্চ", en: "Keyword Res" },
    icon: Key,
    color: "text-white",
    bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    comingSoon: false,
  },
  {
    id: "age-calc",
    title: { bn: "বয়স ক্যালকুলেটর", en: "Age Calc" },
    icon: CalendarDays,
    color: "text-white",
    bg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    comingSoon: false,
  },
  {
    id: "bmi-calc",
    title: { bn: "বিএমআই হিসাব", en: "BMI Calc" },
    icon: Activity,
    color: "text-white",
    bg: "bg-gradient-to-br from-rose-400 to-red-500",
    comingSoon: false,
  },
  {
    id: "pass-gen",
    title: { bn: "পাসওয়ার্ড জেনারেটর", en: "Pass Gen" },
    icon: Shield,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    comingSoon: false,
  },
  {
    id: "stopwatch",
    title: { bn: "স্টপওয়াচ", en: "Stopwatch" },
    icon: Timer,
    color: "text-white",
    bg: "bg-gradient-to-br from-slate-700 to-slate-900",
    comingSoon: false,
  },
  {
    id: "qr-gen",
    title: { bn: "কিউআর মেকার", en: "QR Maker" },
    icon: QrCode,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    comingSoon: false,
  },
  {
    id: "json-format",
    title: { bn: "জেসন ফরম্যাট", en: "JSON Format" },
    icon: Braces,
    color: "text-white",
    bg: "bg-gradient-to-br from-amber-500 to-yellow-600",
    comingSoon: false,
  },
  {
    id: "unit-conv",
    title: { bn: "ইউনিট কনভার্টার", en: "Unit Convert" },
    icon: ArrowRightLeft,
    color: "text-white",
    bg: "bg-gradient-to-br from-violet-500 to-purple-600",
    comingSoon: false,
  },
  {
    id: "expense-track",
    title: { bn: "খরচ ট্র্যাকার", en: "Expenses" },
    icon: Receipt,
    color: "text-white",
    bg: "bg-gradient-to-br from-teal-400 to-emerald-600",
    comingSoon: false,
  },
  {
    id: "base64-encode",
    title: { bn: "বেস৬৪ এনকোড", en: "Base64 Enc" },
    icon: Binary,
    color: "text-white",
    bg: "bg-gradient-to-br from-slate-500 to-slate-700",
    comingSoon: false,
  },
  {
    id: "lorem-gen",
    title: { bn: "লোরেম ইপসাম", en: "Lorem Gen" },
    icon: AlignJustify,
    color: "text-white",
    bg: "bg-gradient-to-br from-stone-400 to-stone-600",
    comingSoon: false,
  },
  {
    id: "discount-calc",
    title: { bn: "ডিসকাউন্ট হিসাব", en: "Discount Calc" },
    icon: Percent,
    color: "text-white",
    bg: "bg-gradient-to-br from-red-500 to-orange-500",
    comingSoon: false,
  },
  {
    id: "tip-calc",
    title: { bn: "টিপ ক্যালকুলেটর", en: "Tip Calc" },
    icon: Coins,
    color: "text-white",
    bg: "bg-gradient-to-br from-yellow-500 to-amber-600",
    comingSoon: false,
  },
  {
    id: "pomodoro",
    title: { bn: "পোমোডোরো ক্লক", en: "Pomodoro" },
    icon: Clock,
    color: "text-white",
    bg: "bg-gradient-to-br from-rose-500 to-pink-600",
    comingSoon: false,
  },
  {
    id: "todo-list",
    title: { bn: "টু-ডু লিস্ট", en: "To-Do List" },
    icon: ListTodo,
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-400 to-indigo-500",
    comingSoon: false,
  },
  {
    id: "date-calc",
    title: { bn: "দিন গণনা", en: "Date Calc" },
    icon: CalendarClock,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    comingSoon: false,
  },
  {
    id: "random-num",
    title: { bn: "র‍্যান্ডম নাম্বার", en: "Random Num" },
    icon: Dices,
    color: "text-white",
    bg: "bg-gradient-to-br from-violet-500 to-purple-600",
    comingSoon: false,
  },
  {
    id: "text-case",
    title: { bn: "টেক্সট কেস", en: "Text Case" },
    icon: Type,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    comingSoon: false,
  },
  {
    id: "uuid-gen",
    title: { bn: "ইউইউআইডি মেকার", en: "UUID Maker" },
    icon: Fingerprint,
    color: "text-white",
    bg: "bg-gradient-to-br from-gray-600 to-gray-800",
    comingSoon: false,
  },
  {
    id: "code-format",
    title: { bn: "কোড ফরম্যাটার", en: "HTML/JS Formatter" },
    icon: Code,
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    comingSoon: false,
  },
  {
    id: "url-encode",
    title: { bn: "ইউআরএল এনকোডার", en: "URL Encoder" },
    icon: Link,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-400 to-blue-500",
    comingSoon: false,
  },
  {
    id: "pass-checker",
    title: { bn: "পাসওয়ার্ড চেকার", en: "Pass Checker" },
    icon: ShieldCheck,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-500 to-green-600",
    comingSoon: false,
  },
  {
    id: "regex-test",
    title: { bn: "রেজেক্স টেস্টার", en: "Regex Tester" },
    icon: Terminal,
    color: "text-white",
    bg: "bg-gradient-to-br from-slate-600 to-slate-800",
    comingSoon: false,
  },
  {
    id: "md-editor",
    title: { bn: "মার্কডাউন এডিটর", en: "MD Editor" },
    icon: FileCode,
    color: "text-white",
    bg: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
    comingSoon: false,
  },
  {
    id: "device-info",
    title: { bn: "ডিভাইস ইনফো", en: "Device Info" },
    icon: Smartphone,
    color: "text-white",
    bg: "bg-gradient-to-br from-gray-500 to-slate-600",
    comingSoon: false,
  },
];

// --- Components ---

const formatCount = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

const PostCard = ({ post }: { post: any }) => {
    const { language } = useLanguage();
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(post.reactionsCount || post.likes || 0);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    
    // Author states
    const [isVerified, setIsVerified] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [authorAvatar, setAuthorAvatar] = useState("");
    const [showReportModal, setShowReportModal] = useState(false);
    
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Fetch author details
    useEffect(() => {
        let isMounted = true;
        const fetchAuthorData = async () => {
            try {
                const { doc, getDoc, collection, query, where, getCountFromServer, getDocs } = await import("firebase/firestore");
                
                // Fetch verification status & avatar
                const userDoc = await getDoc(doc(db, "users", post.authorUid));
                if (isMounted && userDoc.exists()) {
                    setIsVerified(userDoc.data().isVerified === true);
                    if (userDoc.data().photoUrl || userDoc.data().photoURL) {
                        setAuthorAvatar(userDoc.data().photoUrl || userDoc.data().photoURL);
                    }
                }

                // Fetch follower count
                const followersQuery = query(collection(db, 'follows'), where('following_id', '==', post.authorUid));
                const followersSnapshot = await getCountFromServer(followersQuery);
                if (isMounted) setFollowerCount(followersSnapshot.data().count);

                // Fetch if current user is following
                if (auth.currentUser && auth.currentUser.uid !== post.authorUid) {
                    const followingQuery = query(
                        collection(db, 'follows'), 
                        where('follower_id', '==', auth.currentUser.uid), 
                        where('following_id', '==', post.authorUid)
                    );
                    const isFollowingSnapshot = await getDocs(followingQuery);
                    if (isMounted) setIsFollowing(!isFollowingSnapshot.empty);
                }
            } catch (e) {
                console.error("Error fetching author details:", e);
            }
        };
        fetchAuthorData();
        return () => { isMounted = false; };
    }, [post.authorUid, auth.currentUser]);

    // Play/Pause video based on intersection and count views
    const [hasCountedView, setHasCountedView] = useState(false);
    useEffect(() => {
        if (!videoRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && videoRef.current) {
                    videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
                    
                    if (!hasCountedView) {
                        setHasCountedView(true);
                        import("firebase/firestore").then(({ doc, increment, updateDoc }) => {
                            if (post.id) {
                                const postRef = doc(db, 'posts', post.id);
                                updateDoc(postRef, { views: increment(1) }).catch(console.error);
                            }
                        });
                    }
                } else if (!entry.isIntersecting && videoRef.current) {
                    videoRef.current.pause();
                }
            });
        }, { threshold: 0.5 });
        observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, [post.fileId, post.id, hasCountedView]);

    // Check if current user has already liked
    useEffect(() => {
        let unsubscribe = () => {};
        if (auth.currentUser) {
            const checkLike = async () => {
                try {
                    const { doc, onSnapshot } = await import("firebase/firestore");
                    const userLikeRef = doc(db, `posts/${post.id}/likes`, auth.currentUser!.uid);
                    unsubscribe = onSnapshot(userLikeRef, (docSnap) => {
                        setIsLiked(docSnap.exists());
                    });
                } catch(e) {
                    console.error(e);
                }
            };
            checkLike();
        }
        return () => unsubscribe();
    }, [post.id]);

    // Try to parse content if it's JSON or an object (to fix existing broken posts)
    let displayContent = '';
    let fallbackFileId = post.fileId;
    let fallbackType = post.type;

    if (typeof post.content === 'object' && post.content !== null) {
        // If it's already an object (Firestore sometimes does this)
        displayContent = post.content.text || '';
        if (post.content.fileId) fallbackFileId = post.content.fileId;
        if (post.content.type) fallbackType = post.content.type;
    } else if (typeof post.content === 'string') {
        displayContent = post.content;
        if (displayContent.startsWith('{')) {
            try {
                const parsed = JSON.parse(displayContent);
                displayContent = parsed.text || displayContent;
                if (parsed.fileId && !fallbackFileId) fallbackFileId = parsed.fileId;
                if (parsed.type && !fallbackType) fallbackType = parsed.type;
            } catch (e) {
                // Not JSON or parse failed, use as is
            }
        }
    }

    const handleLike = async () => {
        if (!auth.currentUser) {
            alert(language === 'bn' ? 'লগইন করুন' : 'Please login');
            return;
        }

        const newIsLiked = !isLiked;
        // Optimistic UI update
        setIsLiked(newIsLiked);
        setLikes(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

        try {
            const { doc, setDoc, deleteDoc } = await import("firebase/firestore");
            const userLikeRef = doc(db, `posts/${post.id}/likes`, auth.currentUser.uid);
            const postRef = doc(db, "posts", post.id);
            if (newIsLiked) {
                await setDoc(userLikeRef, { uid: auth.currentUser.uid, createdAt: new Date() });
                await updateDoc(postRef, {
                    reactionsCount: increment(1)
                });
            } else {
                await deleteDoc(userLikeRef);
                await updateDoc(postRef, {
                    reactionsCount: increment(-1)
                });
            }
        } catch (err) {
            console.error(err);
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikes(prev => newIsLiked ? Math.max(0, prev - 1) : prev + 1);
        }
    };

    const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");

    const handleFollowToggle = async () => {
        if (!auth.currentUser) {
            alert(language === 'bn' ? 'লগইন করুন' : 'Please login');
            return;
        }
        
        // Optimistic UI updates
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);
        setFollowerCount(prev => newIsFollowing ? prev + 1 : Math.max(0, prev - 1));

        try {
            const { collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp } = await import("firebase/firestore");
            const followsRef = collection(db, 'follows');
            
            if (!newIsFollowing) {
                // Was following, now unfollowing
                const q = query(followsRef, where('follower_id', '==', auth.currentUser.uid), where('following_id', '==', post.authorUid));
                const snap = await getDocs(q);
                snap.forEach(async (docSnap) => {
                    await deleteDoc(docSnap.ref);
                });
            } else {
                // Follow
                await addDoc(followsRef, {
                    follower_id: auth.currentUser.uid,
                    following_id: post.authorUid,
                    created_at: serverTimestamp()
                });
            }
        } catch (err) {
            console.error("Follow toggling error:", err);
            // Revert state on failure
            setIsFollowing(!newIsFollowing);
            setFollowerCount(prev => newIsFollowing ? Math.max(0, prev - 1) : prev + 1);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeletingModalOpen(false);
        try {
            const { deleteDoc } = await import("firebase/firestore");
            await deleteDoc(doc(db, "posts", post.id));
        } catch (err) {
            console.error(err);
            alert(language === 'bn' ? 'মোছা সম্ভব হয়নি' : 'Failed to delete');
        }
    };

    const handleEditSave = async () => {
        if (!editContent.trim()) return;
        try {
            const { updateDoc } = await import("firebase/firestore");
            await updateDoc(doc(db, "posts", post.id), {
                content: editContent.trim()
            });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert(language === 'bn' ? 'এডিট করা সম্ভব হয়নি' : 'Failed to edit');
        }
    };

    const canDelete = auth.currentUser && (
        auth.currentUser.uid === post.authorUid || 
        auth.currentUser.email === "its.me.calloftamim@gmail.com"
    );

    const avatarSrc = authorAvatar 
        ? authorAvatar
        : ((auth.currentUser?.uid === post.authorUid && auth.currentUser?.photoURL) 
            ? auth.currentUser.photoURL 
            : (post.authorAvatarUrl && !post.authorAvatarUrl.includes('dicebear') ? post.authorAvatarUrl : null));

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 overflow-hidden border-t border-slate-100 dark:border-slate-800"
        >
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {avatarSrc ? (
                        <img 
                            src={avatarSrc} 
                            alt="Avatar" 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-light/20 dark:bg-primary-dark/30 flex items-center justify-center text-primary dark:text-primary-light font-bold text-lg shrink-0">
                            {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-1">
                            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{post.authorName}</h4>
                            <VerifiedBadge isVerified={isVerified} isOwner={false} size={14} />
                            {auth.currentUser && auth.currentUser.uid !== post.authorUid && (
                                <button 
                                    onClick={handleFollowToggle}
                                    className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserMinus className="w-3 h-3" />
                                            {language === 'bn' ? 'আনফলো' : 'Unfollow'}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-3 h-3" />
                                            {language === 'bn' ? 'ফলো' : 'Follow'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                             <span>{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                             <span>•</span>
                             <span>{followerCount > 0 ? `${followerCount} ${language === 'bn' ? 'ফলোয়ার' : 'followers'}` : (language === 'bn' ? 'পাবলিক' : 'Public')}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 relative">
                    {canDelete && (
                        <>
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 top-10 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20"
                                    >
                                        <button 
                                            onClick={() => {
                                                setShowMenu(false);
                                                setIsEditing(true);
                                                setEditContent(post.content);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            {language === 'bn' ? 'এডিট' : 'Edit'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setShowMenu(false);
                                                setIsDeletingModalOpen(true);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {language === 'bn' ? 'ডিলিট' : 'Delete'}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-3">
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                            placeholder={language === 'bn' ? 'আপনার পোস্ট লিখুন...' : 'Write your post...'}
                        />
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
                            >
                                {language === 'bn' ? 'বাতিল' : 'Cancel'}
                            </button>
                            <button 
                                onClick={handleEditSave}
                                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                {language === 'bn' ? 'সেভ' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {displayContent}
                    </p>
                )}
            </div>

            {/* Media Area */}
            {fallbackFileId && (
                <div className="bg-white dark:bg-slate-900 border-y border-slate-50 dark:border-slate-800 relative group flex items-center justify-center overflow-hidden min-h-[200px]">
                    {fallbackType === 'video' ? (
                        <>
                            {isVideoLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
                                    <div className="w-8 h-8 relative">
                                        <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-800"></div>
                                        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                                    </div>
                                </div>
                            )}
                            <video 
                                ref={videoRef}
                                controls 
                                preload="metadata"
                                playsInline
                                onCanPlay={() => setIsVideoLoading(false)}
                                className={cn(
                                    "w-full object-contain transition-opacity duration-300",
                                    isVideoLoading ? "opacity-0" : "opacity-100"
                                )}
                            >
                                <source src={getApiUrl(`/api/telegram/file/${fallbackFileId}`)} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </>
                    ) : (
                        <div className="w-full h-full">
                            <img 
                                src={getApiUrl(`/api/telegram/file/${fallbackFileId}`)} 
                                alt="Post media" 
                                className="w-full h-auto object-contain"
                                loading="lazy"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Post Stats */}
            <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border border-white dark:border-slate-900 flex items-center justify-center">
                            <ThumbsUp className="w-2 h-2 text-white fill-current" />
                        </div>
                        <div className="w-4 h-4 rounded-full bg-red-500 border border-white dark:border-slate-900 flex items-center justify-center">
                            <Star className="w-2 h-2 text-white fill-current" />
                        </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 ml-1">{likes}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-slate-500">{post.shares || 0} {language === 'bn' ? 'শেয়ার' : 'shares'}</span>
                    {fallbackType === 'video' && (
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            {formatCount(post.views || 0)} {language === 'bn' ? 'ভিউ' : 'views'}
                        </span>
                    )}
                </div>
            </div>

            {/* Post Actions */}
            <div className="px-4 py-2 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50">
                <button 
                    onClick={handleLike}
                    className={cn(
                        "w-24 py-2 flex items-center justify-start gap-2 rounded-xl transition-all active:scale-95",
                        isLiked ? "text-blue-600 font-bold" : "text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                >
                    <ThumbsUp className={cn("w-5 h-5", isLiked && "fill-current animate-bounce")} />
                    <span className="text-xs">{language === 'bn' ? 'লাইক' : 'Like'}</span>
                </button>
                <button 
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({ title: post.authorName, text: post.content, url: window.location.href });
                        } else {
                            alert(language === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Link copied!');
                        }
                    }}
                    className="w-24 py-2 flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition-all active:scale-95"
                >
                    <Share2 className="w-5 h-5" />
                    <span className="text-xs">{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
                </button>
                <button 
                    onClick={() => setShowReportModal(true)}
                    className="w-24 py-2 flex items-center justify-end gap-2 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition-all active:scale-95"
                >
                    <Flag className="w-5 h-5" />
                    <span className="text-xs">{language === 'bn' ? 'রিপোর্ট' : 'Report'}</span>
                </button>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <ReportModal post={post} onClose={() => setShowReportModal(false)} />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeletingModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                                    <Trash2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                                    {language === 'bn' ? 'মুছে ফেলতে চান?' : 'Delete Post?'}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                                    {language === 'bn' 
                                        ? 'এই পোস্টটি চিরতরে মুছে ফেলা হবে। আপনি কি নিশ্চিত?' 
                                        : 'This post will be permanently deleted. Are you sure?'}
                                </p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsDeletingModalOpen(false)}
                                        className="flex-1 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        {language === 'bn' ? 'বাতিল' : 'Cancel'}
                                    </button>
                                    <button 
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
                                    >
                                        {language === 'bn' ? 'মুছুন' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const ToolsView = () => {
    const { language } = useLanguage();
    const [activeToolId, setActiveToolId] = useState<string | null>(null);
    const [showAllTools, setShowAllTools] = useState(false);
    const [isPostingOpen, setIsPostingOpen] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (auth.currentUser) {
            // First set to auth provider photo
            setCurrentUserAvatar(auth.currentUser.photoURL);
            
            // Then fetch latest from Firestore if exists
            const fetchUserDoc = async () => {
                try {
                    const { doc, getDoc } = await import("firebase/firestore");
                    const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        if (data.photoUrl || data.photoURL) {
                            setCurrentUserAvatar(data.photoUrl || data.photoURL);
                        }
                    }
                } catch (e) {
                    console.error("Error fetching user data:", e);
                }
            };
            fetchUserDoc();
        }
    }, [auth.currentUser]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch Posts
    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((p: any) => p.status === 'approved' || !p.status); // Fallback for older posts without status
            setPosts(postsData);
        }, (error) => {
            console.error("Firestore Error Fetching Posts:", error);
            // Optionally could handle the UI error feedback here
        });
        return () => unsubscribe();
    }, []);

    // Handle visibility of App Navigation
    useEffect(() => {
        if (isPostingOpen || showAllTools || activeToolId || isSidebarOpen) {
            window.dispatchEvent(new CustomEvent("hide-nav", { detail: true }));
        } else {
            window.dispatchEvent(new CustomEvent("hide-nav", { detail: false }));
        }
        
        return () => {
            window.dispatchEvent(new CustomEvent("hide-nav", { detail: false }));
        };
    }, [isPostingOpen, showAllTools, activeToolId, isSidebarOpen]);

    // Handle hardware back button
  useEffect(() => {
    const handlePopState = () => {
      if (activeToolId !== null) {
        setActiveToolId(null);
      } else if (showAllTools) {
        setShowAllTools(false);
      } else if (isPostingOpen) {
        setIsPostingOpen(false);
      } else if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeToolId, showAllTools, isPostingOpen, isSidebarOpen]);

  const handleOpenSidebar = () => {
    window.history.pushState({ view: 'sidebar' }, "");
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    if (isSidebarOpen) {
      window.history.back(); // Triggers popstate which sets isSidebarOpen to false
    }
  };

  const handleOpenTool = (id: string) => {
    window.history.pushState({ toolOpen: id }, "");
    setActiveToolId(id);
  };

  const handleCloseTool = () => {
    if (activeToolId) {
      window.history.back(); // Pops the state, triggering handlePopState to set activeToolId to null
    }
  };

  const handleSeeAll = () => {
    window.history.pushState({ view: "all-tools" }, "");
    setShowAllTools(true);
  };

  const handleShowAllBack = () => {
    window.history.back();
  };

  const previewTools = SOCIAL_TOOLS.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      {/* 2. Scroll Header (Appears on scroll) */}
      <div 
        className={cn(
            "fixed top-0 pt-safe inset-x-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm z-[150] transition-transform duration-300",
            (isScrolled && !activeToolId && !showAllTools) ? "translate-y-0" : "-translate-y-[150%]"
        )}
      >
        <div className="w-full px-6 pb-3 pt-2 flex items-center gap-4">
            <button 
            onClick={handleOpenSidebar}
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-900 dark:text-white"
            >
            <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate flex-1">
            {language === 'bn' ? 'মুসলিম সোশ্যাল' : 'Muslim Social'}
            </h1>
        </div>
      </div>

      {/* 3. Main Header - Fixed if tool is open, otherwise scrolls with content */}
      <header className={cn(
        "w-full bg-white dark:bg-slate-900 px-6 pt-safe flex items-center gap-4 transition-all z-[140]",
        (activeToolId || showAllTools)
          ? "fixed top-0 inset-x-0 pb-3 pt-safe shadow-sm border-b border-slate-100 dark:border-slate-800 z-[170]"
          : "relative pb-6 border-b border-slate-100 dark:border-slate-800"
      )}>
        <button 
          onClick={() => {
            if (activeToolId) {
              handleCloseTool();
            } else if (showAllTools) {
              handleShowAllBack();
            } else {
              handleOpenSidebar();
            }
          }}
          className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-900 dark:text-white"
        >
          {activeToolId || showAllTools ? <ArrowLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate flex-1">
          {activeToolId 
            ? SOCIAL_TOOLS.find(t => t.id === activeToolId)?.title[language === 'bn' ? 'bn' : 'en'] 
            : showAllTools
              ? (language === 'bn' ? 'সকল টুলস' : 'All Tools')
              : (language === 'bn' ? 'মুসলিম সোশ্যাল' : 'Muslim Social')}
        </h1>
      </header>

      <AnimatePresence mode="wait">
        {activeToolId === "yt-thumbnail" ? (
          <motion.div
            key="yt-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[145] pt-28 bg-slate-50 dark:bg-slate-950"
          >
            <YTThumbnailTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "tags-gen" ? (
          <motion.div
            key="tags-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <TagsGenTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "title-gen" ? (
          <motion.div
            key="title-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <TitleGenTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "earn-calc" ? (
          <motion.div
            key="earn-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <EarnCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "char-count" ? (
          <motion.div
            key="word-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <WordCountTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "seo-check" ? (
          <motion.div
            key="seo-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <SEOTesterTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "channel-audit" ? (
          <motion.div
            key="channel-audit-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <ChannelAuditTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "keyword-res" ? (
          <motion.div
            key="keyword-res-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <KeywordResTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "age-calc" ? (
          <motion.div
            key="age-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <AgeCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "bmi-calc" ? (
          <motion.div
            key="bmi-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <BMICalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "pass-gen" ? (
          <motion.div
            key="pass-gen-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <PassGenTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "stopwatch" ? (
          <motion.div
            key="stopwatch-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <StopwatchTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "qr-gen" ? (
          <motion.div
            key="qr-gen-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <QRMakerTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "json-format" ? (
          <motion.div
            key="json-format-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <JSONFormatTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "unit-conv" ? (
          <motion.div
            key="unit-conv-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <UnitConvTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "expense-track" ? (
          <motion.div
            key="expense-track-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <ExpenseTrackTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "base64-encode" ? (
          <motion.div
            key="base64-encode-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <Base64EncodeTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "tip-calc" ? (
          <motion.div
            key="tip-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <TipCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "pomodoro" ? (
          <motion.div
            key="pomodoro-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <PomodoroTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "todo-list" ? (
          <motion.div
            key="todo-list-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <TodoListTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "date-calc" ? (
          <motion.div
            key="date-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <DateCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "url-encode" ? (
          <motion.div
            key="url-encode-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <UrlEncodeTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "pass-checker" ? (
          <motion.div
            key="pass-checker-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <PassCheckerTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "regex-test" ? (
          <motion.div
            key="regex-test-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <RegexTestTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "md-editor" ? (
          <motion.div
            key="md-editor-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <MDEditorTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "random-num" ? (
          <motion.div
            key="random-num-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <RandomNumTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "text-case" ? (
          <motion.div
            key="text-case-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <TextCaseTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "uuid-gen" ? (
          <motion.div
            key="uuid-gen-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <UUIDMakerTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "code-format" ? (
          <motion.div
            key="code-format-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <CodeFormatTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "device-info" ? (
          <motion.div
            key="device-info-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <DeviceInfoTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "salary-calc" ? (
          <motion.div
            key="salary-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <SalaryCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "text-reverse" ? (
          <motion.div
            key="text-reverse-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <TextReverserTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "word-scramble" ? (
          <motion.div
            key="word-scramble-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <WordScramblerTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "lorem-gen" ? (
          <motion.div
            key="lorem-gen-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <LoremGenTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "discount-calc" ? (
          <motion.div
            key="discount-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <DiscountCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "percent-calc" ? (
          <motion.div
            key="percent-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[145] pt-24 bg-slate-50 dark:bg-slate-950"
          >
            <PercentageCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : (
          <motion.div
            key="tools-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-slate-50 dark:bg-slate-950"
          >
            <div className="min-h-screen flex flex-col w-full mx-auto max-w-2xl">
                {/* Tools Grid Area - Tightened */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5 mt-0">
                    <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                        {previewTools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleOpenTool(tool.id)}
                                className="flex flex-col items-center gap-1.5 group"
                            >
                                <div className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                                    "shadow-sm group-hover:scale-110 active:scale-95",
                                    tool.bg
                                )}>
                                    <tool.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight truncate w-full px-0.5">
                                    {language === "bn" ? tool.title.bn : tool.title.en}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Attached "What's on your mind?" - Attached directly with border-t */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4">
                    <button 
                        onClick={() => {
                            window.history.pushState({ view: 'posting' }, "");
                            setIsPostingOpen(true);
                        }}
                        className="w-full flex items-center gap-3 active:scale-95 transition-transform text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                            {currentUserAvatar ? (
                                <img 
                                    src={currentUserAvatar} 
                                    alt="Avatar" 
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary-light/20 dark:bg-primary-dark/30 text-primary dark:text-primary-light font-bold text-lg">
                                    {auth.currentUser?.displayName ? auth.currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-full py-2.5 px-4 text-slate-400 dark:text-slate-500 text-base font-medium border border-slate-100 dark:border-slate-800">
                            {language === 'bn' ? 'আপনার মনে কি আছে?' : "What's on your mind?"}
                        </div>
                        <div className="flex items-center justify-center w-10 h-10 shrink-0">
                            <ImageIcon className="w-6 h-6 text-emerald-500" />
                        </div>
                    </button>
                </div>

                {/* Posts Feed Section - Attached Directly without top-margin */}
                <div className="pb-0 flex flex-col">
                    <AnimatePresence>
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.id} className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                                    <PostCard post={post} />
                                </div>
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-slate-900 p-12 text-center border-b border-slate-100 dark:border-slate-800"
                            >
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1">
                                    {language === 'bn' ? 'কোন পোস্ট নেই' : 'No posts yet'}
                                </h3>
                                <p className="text-xs font-medium text-slate-400">
                                    {language === 'bn' ? 'প্রথম পোস্টটি আপনিই করুন!' : 'Be the first to post something!'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
          {isPostingOpen && (
              <PostContentOverlay onClose={() => {
                  window.history.back();
                  setIsPostingOpen(false);
              }} />
          )}
      </AnimatePresence>

      {/* Full Tools Grid Overlay (The "See All" Page) */}
      <AnimatePresence>
          {showAllTools && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-0 z-[80] bg-slate-50 dark:bg-slate-950 flex flex-col h-full pt-24"
              >
                  <div className="flex-1 overflow-y-auto p-4 pb-32">
                    <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                        {SOCIAL_TOOLS.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleOpenTool(tool.id)}
                                className="relative flex flex-col items-center gap-1.5 group"
                            >
                                <div className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                                    tool.bg,
                                    "group-hover:scale-110 active:scale-95"
                                )}>
                                    <tool.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight truncate w-full px-0.5">
                                    {language === "bn" ? tool.title.bn : tool.title.en}
                                </span>
                                {tool.comingSoon && (
                                    <span className="absolute top-0 right-0 bg-amber-500 text-white text-[7px] font-black px-1 py-0.5 rounded-full uppercase scale-75">
                                        Soon
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseSidebar}
              className="fixed inset-0 bg-black/50 z-[190]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-[200] shadow-2xl flex flex-col pt-safe"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                    <span className="text-white font-black text-xl">Y</span>
                </div>
                <div className="flex-1">
                    <h2 className="font-black text-lg leading-tight text-slate-900 dark:text-white">YTool</h2>
                    <p className="text-xs font-medium text-slate-500">Muslim Social</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-2">
                <button
                  onClick={() => {
                    handleCloseSidebar();
                    // Need a small timeout to allow sidebar to close before opening All Tools, or just call it directly.
                    // Doing it sequentially
                    setTimeout(() => {
                        handleSeeAll();
                    }, 50);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                      <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300 flex-1">
                    {language === 'bn' ? 'সকল টুলস' : 'All Tools'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
