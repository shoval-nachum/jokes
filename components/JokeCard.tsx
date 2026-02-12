import React, { useRef, useState, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Joke } from '../types';
import { AUTHOR_COLORS, AVATARS } from '../constants';
import { Share2, Calendar, Star, Sparkles, Image as ImageIcon, Loader2, Check } from 'lucide-react';

interface JokeCardProps {
  joke: Joke;
  onSwipe?: (direction: 'left' | 'right') => void;
  styleType: 'card' | 'grid' | 'cartoon';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  imageUrl?: string;
  isLoadingImage?: boolean;
}

export const JokeCard: React.FC<JokeCardProps> = ({ 
  joke, 
  onSwipe, 
  styleType, 
  isFavorite = false, 
  onToggleFavorite,
  imageUrl,
  isLoadingImage
}) => {
  const colors = AUTHOR_COLORS[joke.author];
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(AVATARS[joke.author]);

  useEffect(() => {
    setAvatarSrc(AVATARS[joke.author]);
  }, [joke.author]);

  const handleAvatarError = () => {
    // Fallback to DiceBear if local image fails
    const seed = joke.author.split(' ')[0];
    const bgColors: Record<string, string> = {
        'Amiram': 'b6e3f4',
        'David': 'd1fae5',
        'Shoval': 'e9d5ff'
    };
    const bg = bgColors[seed] || 'e2e8f0';
    setAvatarSrc(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bg}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing || !cardRef.current) return;
    
    setIsSharing(true);
    setIsCopied(false);

    try {
      // Capture the card element as a canvas
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        backgroundColor: null, // Preserve transparency/background of the element
        scale: 3, // Higher resolution for better quality
        logging: false,
        onclone: (clonedDoc) => {
            // Hide the action buttons in the generated image for a cleaner layout
            const actionsDiv = clonedDoc.querySelector('.card-actions');
            if (actionsDiv instanceof HTMLElement) {
                actionsDiv.style.display = 'none';
            }

            // Center the header content (author info)
            const headerDiv = clonedDoc.querySelector('.card-header');
            if (headerDiv instanceof HTMLElement) {
                headerDiv.style.justifyContent = 'center';
            }
        }
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
            setIsSharing(false);
            return;
        }

        try {
            // Try using the Clipboard API (works on Desktop and some Mobile browsers)
            if (typeof navigator.clipboard !== 'undefined' && typeof ClipboardItem !== 'undefined') {
                 await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2500);
            } else {
                 throw new Error('Clipboard API unavailable');
            }
        } catch (clipboardErr) {
            console.error('Clipboard write failed', clipboardErr);
            
            // Fallback to Web Share API (Mobile) if available and supports files
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'joke.png', { type: 'image/png' })] })) {
                 const file = new File([blob], 'joke.png', { type: 'image/png' });
                 try {
                    await navigator.share({
                        files: [file],
                        title: 'Hebrew Wordplay Joke',
                        text: `${joke.content} - ${joke.author}`
                     });
                     setIsCopied(true);
                     setTimeout(() => setIsCopied(false), 2500);
                 } catch (shareErr) {
                     console.error('Share failed', shareErr);
                 }
            } else {
                alert('Could not copy image to clipboard. Browser support missing.');
            }
        } finally {
            setIsSharing(false);
        }
      }, 'image/png');

    } catch (err) {
      console.error('Error generating image:', err);
      setIsSharing(false);
      alert('Failed to generate image.');
    }
  };

  const CardContent = () => (
    <div 
      ref={cardRef}
      className={`h-full bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white transition-shadow duration-300 flex flex-col justify-between relative overflow-hidden ${styleType === 'grid' ? 'min-h-[240px] md:min-h-[280px]' : ''}`}
    >
      {/* Decorative Background Blobs */}
      {styleType !== 'cartoon' && (
        <>
            <div className={`absolute -top-12 -left-12 w-32 h-32 md:w-40 md:h-40 rounded-full opacity-10 mix-blend-multiply filter blur-xl ${colors.bg.replace('bg-', 'bg-')}`}></div>
            <div className={`absolute top-20 -right-12 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-10 mix-blend-multiply filter blur-xl bg-yellow-200`}></div>
        </>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start relative z-10 mb-4 card-header">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
             <img 
               src={avatarSrc} 
               alt={joke.author}
               onError={handleAvatarError}
               className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white shadow-sm bg-gray-50 object-cover`}
             />
             <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white ${colors.badge}`}></div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-extrabold text-slate-800 leading-tight">{joke.author}</p>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-0.5">
              <Calendar size={10} strokeWidth={2.5} />
              <span>{joke.date}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 card-actions">
            <button 
              onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.();
              }}
              className={`p-1.5 md:p-2 rounded-full transition-all duration-300 ${isFavorite ? 'bg-yellow-50 text-yellow-400 scale-110' : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-50'}`}
            >
              <Star 
                size={18} 
                className={isFavorite ? "fill-yellow-400" : ""} 
                strokeWidth={2.5}
              />
            </button>
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className={`p-1.5 md:p-2 rounded-full transition-all duration-300 ${isCopied ? 'bg-green-50 text-green-500' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50 disabled:opacity-50'}`}
            >
              {isSharing ? (
                  <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
              ) : isCopied ? (
                  <Check size={18} strokeWidth={2.5} />
              ) : (
                  <Share2 size={18} strokeWidth={2.5} />
              )}
            </button>
        </div>
      </div>

      {/* Cartoon Image Area */}
      {styleType === 'cartoon' && (
        <div className="w-full aspect-square rounded-xl md:rounded-2xl mb-4 overflow-hidden relative bg-slate-50 border border-slate-100 flex items-center justify-center group">
            {isLoadingImage ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 animate-pulse">
                    <Sparkles className="animate-spin text-purple-400" size={32} />
                    <span className="text-sm font-bold text-purple-400">Drawing...</span>
                </div>
            ) : imageUrl ? (
                <motion.img 
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src={imageUrl} 
                    alt="AI Cartoon" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
            ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                    <ImageIcon size={40} strokeWidth={1.5} />
                    <span className="text-xs font-medium">Image unavailable</span>
                </div>
            )}
        </div>
      )}

      {/* Content */}
      <div className={`flex-grow flex items-center justify-center z-10 ${styleType === 'cartoon' ? 'py-2' : 'py-6'}`}>
        <p className={`text-center font-bold text-slate-800 leading-relaxed tracking-wide ${joke.content.length > 50 ? 'text-base md:text-lg' : 'text-xl md:text-2xl'}`} dir="rtl">
          {joke.content}
        </p>
      </div>
      
      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 w-full h-1 md:h-1.5 opacity-50 ${colors.badge}`}></div>
    </div>
  );

  if (styleType === 'card' || styleType === 'cartoon') {
    return (
      <motion.div
        className={`absolute w-full ${styleType === 'cartoon' ? 'max-w-md h-auto min-h-[400px]' : 'h-[50vh] min-h-[350px] max-h-[500px] max-w-[95vw] md:max-w-sm'} cursor-grab active:cursor-grabbing`}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e: any, info: PanInfo) => {
          if (Math.abs(info.offset.x) > 100 && onSwipe) {
            onSwipe(info.offset.x > 0 ? 'right' : 'left');
          }
        }}
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ x: 300, opacity: 0, rotate: 10, scale: 0.9 }}
        whileDrag={{ rotate: 2, scale: 1.02 }}
        whileTap={{ cursor: 'grabbing' }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <CardContent />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <CardContent />
    </motion.div>
  );
};