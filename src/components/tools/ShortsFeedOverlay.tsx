import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Share2, Flag, Plus, ArrowLeft } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { auth, db } from "@/lib/firebase";
import { cn, formatCount, getApiUrl } from "@/lib/utils";
import { ReportModal } from "@/components/tools/ReportModal";

export const isPostVideo = (p: any): boolean => {
  const hasVideoType = p.type === "video" || p.content?.type === "video";
  const isJSONVideo = typeof p.content === "string" && p.content.includes("\"type\":\"video\"");
  return hasVideoType || isJSONVideo;
};

export const ShortsFeedOverlay = ({ 
  posts, 
  initialPost, 
  onClose,
  isOverlayOpen 
}: { 
  posts: any[]; 
  initialPost: any; 
  onClose: () => void;
  isOverlayOpen: boolean;
}) => {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [hasScrolledToInitial, setHasScrolledToInitial] = useState(false);
  
  useEffect(() => {
    if (containerRef.current && initialPost && !hasScrolledToInitial) {
      const index = posts.findIndex(p => p.id === initialPost.id);
      if (index !== -1) {
        const itemHeight = containerRef.current.clientHeight;
        containerRef.current.scrollTop = index * itemHeight;
        setHasScrolledToInitial(true);
      }
    }
  }, [initialPost, posts, hasScrolledToInitial]);

  // Handle hardware back
  useEffect(() => {
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[500] bg-black"
    >
      <div className="absolute top-safe left-4 z-10 p-2">
        <button
          onClick={() => window.history.back()}
          className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
      >
        {posts.map((post) => (
          <ShortVideoPlayer 
            key={post.id} 
            post={post} 
            isOverlayOpen={isOverlayOpen}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const ShortVideoPlayer = ({ post, isOverlayOpen }: { post: any; isOverlayOpen: boolean }) => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlaying = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.reactionsCount || post.likes || 0);
  const [isVerified, setIsVerified] = useState(false);
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [hasBeenNearScreen, setHasBeenNearScreen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
           setHasBeenNearScreen(true);
        }
      });
    }, { rootMargin: "400px 0px" });
    
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch author data
  useEffect(() => {
    let isMounted = true;
    const fetchAuthorData = async () => {
      try {
        const { doc, getDoc, collection, query, where, getCountFromServer } = await import("firebase/firestore");
        const userDoc = await getDoc(doc(db, "users", post.authorUid));
        if (isMounted && userDoc.exists()) {
          setIsVerified(userDoc.data().isVerified === true);
          setAuthorAvatar(userDoc.data().photoUrl || userDoc.data().photoURL || "");
        }
        const followersQuery = query(collection(db, "follows"), where("following_id", "==", post.authorUid));
        const followersSnapshot = await getCountFromServer(followersQuery);
        if (isMounted) setFollowerCount(followersSnapshot.data().count);
      } catch (e) {}
    };
    fetchAuthorData();
    return () => { isMounted = false; };
  }, [post.authorUid]);

  // Check if liked
  useEffect(() => {
    if (auth.currentUser && post.id) {
       let unsubscribe: any;
       const checkLike = async () => {
         const { doc, onSnapshot } = await import("firebase/firestore");
         const userLikeRef = doc(db, `posts/${post.id}/likes`, auth.currentUser!.uid);
         unsubscribe = onSnapshot(userLikeRef, (docSnap) => {
           setIsLiked(docSnap.exists());
         });
       };
       checkLike();
       return () => {
           if(unsubscribe) unsubscribe();
       };
    }
  }, [post.id]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isOverlayOpen && !showReportModal) {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
            isPlaying.current = true;
            // Record view
            import("firebase/firestore").then(({ doc, increment, updateDoc }) => {
               const postRef = doc(db, "posts", post.id);
               updateDoc(postRef, { views: increment(1) }).catch(() => {});
            });
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
            }
            isPlaying.current = false;
          }
        });
      },
      { threshold: 0.6 }
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [isOverlayOpen, showReportModal, post.id, hasBeenNearScreen]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(l => newIsLiked ? l + 1 : Math.max(0, l - 1));
    try {
      const { doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } = await import("firebase/firestore");
      const userLikeRef = doc(db, `posts/${post.id}/likes`, auth.currentUser.uid);
      const postRef = doc(db, "posts", post.id);
      if (newIsLiked) {
        await setDoc(userLikeRef, { uid: auth.currentUser.uid, createdAt: serverTimestamp() });
        await updateDoc(postRef, { reactionsCount: increment(1) });
      } else {
        await deleteDoc(userLikeRef);
        await updateDoc(postRef, { reactionsCount: increment(-1) });
      }
    } catch (e) {
      setIsLiked(!newIsLiked);
      setLikes(l => newIsLiked ? Math.max(0, l - 1) : l + 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MuslimFeed Short",
          text: post.content?.text || post.content || "",
          url: window.location.href,
        });
        const { doc, updateDoc, increment } = await import("firebase/firestore");
        await updateDoc(doc(db, "posts", post.id), { sharesCount: increment(1) });
      } catch (e) {}
    }
  };

  let displayContent = "";
  if (typeof post.content === "object" && post.content !== null) {
    displayContent = post.content.text || "";
  } else if (typeof post.content === "string") {
    displayContent = post.content;
    if (displayContent.startsWith("{")) {
       try { displayContent = JSON.parse(displayContent).text || displayContent; } catch(e) {}
    }
  }

  let finalFileId = post.fileId;
  if (typeof post.content === "object" && post.content?.fileId) finalFileId = post.content.fileId;

  return (
    <div ref={wrapperRef} className="h-full w-full snap-start snap-always relative flex flex-col items-center justify-center bg-black overflow-hidden">
      {!isMediaLoaded && finalFileId && hasBeenNearScreen && (
        <div className="absolute inset-0 bg-slate-900 z-30 flex flex-col justify-end p-4">
          <div className="absolute right-3 bottom-6 flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse" />
          </div>
          <div className="space-y-3 mb-10 w-[70%]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse" />
              <div className="w-32 h-4 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="w-full h-3 bg-slate-800 rounded animate-pulse" />
            <div className="w-2/3 h-3 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      )}
      {finalFileId && hasBeenNearScreen && (
        <video
          ref={videoRef}
          src={getApiUrl(`/api/telegram/file/${finalFileId}`)}
          className={`h-full w-full object-contain transition-opacity duration-300 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
          preload="metadata"
          loop
          playsInline
          muted={isMuted}
          onLoadedData={() => setIsMediaLoaded(true)}
          onClick={() => {
            if (videoRef.current?.paused) {
              videoRef.current.play();
            } else {
              videoRef.current?.pause();
            }
          }}
        />
      )}

      {/* Right Actions */}
      <div className="absolute right-3 bottom-6 flex flex-col items-center gap-5 z-20">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleLike}
            className={cn(
              "p-3 rounded-full backdrop-blur-xl transition-all active:scale-90",
              isLiked ? "text-rose-500 bg-rose-500/10" : "text-white bg-white/10"
            )}
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
          </button>
          <span className="text-[11px] font-black text-white shadow-sm">{formatCount(likes)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-white/10 backdrop-blur-xl text-white active:scale-90"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <span className="text-[11px] font-black text-white shadow-sm">{formatCount(post.sharesCount || 0)}</span>
        </div>

        <button 
           onClick={() => setShowReportModal(true)}
           className="p-3 rounded-full bg-white/10 backdrop-blur-xl text-white active:scale-90"
        >
          <Flag className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
             {authorAvatar ? (
               <img src={getApiUrl(authorAvatar)} className="w-11 h-11 rounded-full border-2 border-white shadow-lg" crossOrigin="anonymous" />
             ) : (
                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl border-2 border-white">
                  {post.authorName?.charAt(0)}
                </div>
             )}
             <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 rounded-full p-0.5 text-white border-2 border-black">
                <Plus className="w-3 h-3" />
             </button>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-black text-[15px] shadow-sm">{post.authorName}</span>
              <VerifiedBadge isVerified={isVerified} isOwner={false} size={14} className="text-blue-400" />
            </div>
            <p className="text-[11px] font-bold text-slate-300">
               {followerCount} {language === "bn" ? "ফলোয়ার" : "followers"}
            </p>
          </div>
        </div>
        <p className="text-sm text-white font-medium line-clamp-3 leading-relaxed shadow-sm pr-12">
          {displayContent}
        </p>
      </div>

      <AnimatePresence>
        {showReportModal && (
          <ReportModal post={post} onClose={() => setShowReportModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
