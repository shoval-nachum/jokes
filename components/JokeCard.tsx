import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Joke } from '../types';
import { AUTHOR_COLORS, AVATARS } from '../constants';
import { Share2, Calendar, Star, Sparkles, Image as ImageIcon } from 'lucide-react';

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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hebrew Wordplay Joke',
          text: `${joke.content}\n\n- ${joke.author} (${joke.date})`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
       navigator.clipboard.writeText(`${joke.content}\n\n- ${joke.author} (${joke.date})`);
       alert('Joke copied to clipboard!');
    }
  };

  const CardContent = () => (
    <div className={`h-full bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col justify-between relative overflow-hidden ${styleType === 'grid' ? 'min-h-[280px]' : ''}`}>
      {/* Decorative Background Blob (only show if not in cartoon mode or if cartoon is loading) */}
      {styleType !== 'cartoon' && (
        <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-20 ${colors.bg}`}></div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-start relative z-10 mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={AVATARS[joke.author]} 
            alt={joke.author} 
            className={`w-10 h-10 rounded-full border-2 ${colors.border}`}
          />
          <div>
            <p className="text-sm font-bold text-gray-800">{joke.author}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar size={10} />
              <span>{joke.date}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
            <button 
              onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.();
              }}
              className="text-gray-400 hover:text-yellow-400 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Star 
                size={18} 
                className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""} 
              />
            </button>
            <button 
              onClick={handleShare}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Share2 size={18} />
            </button>
        </div>
      </div>

      {/* Cartoon Image Area */}
      {styleType === 'cartoon' && (
        <div className="w-full aspect-square rounded-2xl mb-4 overflow-hidden relative bg-gray-50 border border-gray-100 flex items-center justify-center">
            {isLoadingImage ? (
                <div className="flex flex-col items-center gap-2 text-gray-400 animate-pulse">
                    <Sparkles className="animate-spin" size={24} />
                    <span className="text-xs font-medium">Generating Cartoon...</span>
                </div>
            ) : imageUrl ? (
                <img src={imageUrl} alt="AI Cartoon" className="w-full h-full object-cover" />
            ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                    <ImageIcon size={32} />
                    <span className="text-xs">Image unavailable</span>
                </div>
            )}
        </div>
      )}

      {/* Content */}
      <div className={`flex-grow flex items-center justify-center z-10 ${styleType === 'cartoon' ? 'py-2' : 'py-8'}`}>
        <p className={`text-center font-bold text-gray-800 leading-relaxed ${joke.content.length > 50 ? 'text-lg' : 'text-xl'}`} dir="rtl">
          {joke.content}
        </p>
      </div>
      
      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 w-full h-2 ${colors.badge}`}></div>
    </div>
  );

  if (styleType === 'card' || styleType === 'cartoon') {
    return (
      <motion.div
        className={`absolute w-full ${styleType === 'cartoon' ? 'max-w-md h-auto min-h-[500px]' : 'h-[400px] max-w-sm'} cursor-grab active:cursor-grabbing`}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e: any, info: PanInfo) => {
          if (Math.abs(info.offset.x) > 100 && onSwipe) {
            onSwipe(info.offset.x > 0 ? 'right' : 'left');
          }
        }}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ x: 300, opacity: 0, rotate: 20 }}
        whileDrag={{ rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <CardContent />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <CardContent />
    </motion.div>
  );
};