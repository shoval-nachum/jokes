import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Joke, Author } from '../types';
import { JokeCard } from './JokeCard';
import { AUTHOR_COLORS, AVATARS } from '../constants';
import { Calendar, Star } from 'lucide-react';

interface ViewProps {
  jokes: Joke[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  imageCache?: Record<string, string>;
  onGenerateImage?: (joke: Joke) => void;
  loadingImages?: Record<string, boolean>;
}

export const SwipeView: React.FC<ViewProps> = ({ jokes, favorites, onToggleFavorite }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = () => {
    setCurrentIndex((prev) => (prev + 1) % jokes.length);
  };

  const currentJoke = jokes[currentIndex];

  if (jokes.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <span className="text-4xl mb-4">😶</span>
            <div className="text-center font-medium text-slate-500">No jokes found for this filter.</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] md:h-[70vh] relative w-full max-w-[95vw] md:max-w-md mx-auto px-2 md:px-4 mt-4 md:mt-8">
      <AnimatePresence mode="wait">
        <JokeCard 
          key={currentJoke.id} 
          joke={currentJoke} 
          styleType="card" 
          onSwipe={handleSwipe}
          isFavorite={favorites.includes(currentJoke.id)}
          onToggleFavorite={() => onToggleFavorite(currentJoke.id)}
        />
      </AnimatePresence>
      <div className="absolute -bottom-8 md:bottom-0 text-xs md:text-sm text-slate-400 font-bold tracking-wider uppercase bg-white/50 px-4 py-1 rounded-full backdrop-blur-sm">
        Swipe {currentIndex + 1} / {jokes.length}
      </div>
    </div>
  );
};

export const CartoonView: React.FC<ViewProps> = ({ 
  jokes, 
  favorites, 
  onToggleFavorite,
  imageCache = {},
  onGenerateImage,
  loadingImages = {}
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = () => {
    setCurrentIndex((prev) => (prev + 1) % jokes.length);
  };

  const currentJoke = jokes[currentIndex];

  useEffect(() => {
    if (currentJoke && onGenerateImage && !imageCache[currentJoke.id] && !loadingImages[currentJoke.id]) {
      onGenerateImage(currentJoke);
    }
  }, [currentIndex, currentJoke, imageCache, loadingImages, onGenerateImage]);

  if (jokes.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <span className="text-4xl mb-4">😶</span>
            <div className="text-center font-medium text-slate-500">No jokes found for this filter.</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] relative w-full max-w-[95vw] md:max-w-md mx-auto px-2 md:px-4 mt-4">
      <AnimatePresence mode="wait">
        <JokeCard 
          key={currentJoke.id} 
          joke={currentJoke} 
          styleType="cartoon" 
          onSwipe={handleSwipe}
          isFavorite={favorites.includes(currentJoke.id)}
          onToggleFavorite={() => onToggleFavorite(currentJoke.id)}
          imageUrl={imageCache[currentJoke.id]}
          isLoadingImage={loadingImages[currentJoke.id]}
        />
      </AnimatePresence>
      <div className="absolute -bottom-8 md:bottom-2 text-xs md:text-sm text-slate-400 font-bold tracking-wider uppercase bg-white/50 px-4 py-1 rounded-full backdrop-blur-sm z-0">
         Cartoon Mode {currentIndex + 1} / {jokes.length}
      </div>
    </div>
  );
};

export const GridView: React.FC<ViewProps> = ({ jokes, favorites, onToggleFavorite }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 pb-28">
      {jokes.map((joke) => (
        <JokeCard 
          key={joke.id} 
          joke={joke} 
          styleType="grid" 
          isFavorite={favorites.includes(joke.id)}
          onToggleFavorite={() => onToggleFavorite(joke.id)}
        />
      ))}
    </div>
  );
};

export const ListView: React.FC<ViewProps> = ({ jokes, favorites, onToggleFavorite }) => {
  return (
    <div className="flex flex-col gap-3 md:gap-4 p-4 pb-28 max-w-2xl mx-auto">
      {jokes.map((joke) => {
        const colors = AUTHOR_COLORS[joke.author];
        const isFav = favorites.includes(joke.id);
        
        return (
            <ListItem 
                key={joke.id} 
                joke={joke} 
                isFav={isFav} 
                colors={colors} 
                onToggleFavorite={onToggleFavorite} 
            />
        );
      })}
    </div>
  );
};

const ListItem: React.FC<{
    joke: Joke; 
    isFav: boolean; 
    colors: any; 
    onToggleFavorite: (id: string) => void 
}> = ({ joke, isFav, colors, onToggleFavorite }) => {
    const [imgSrc, setImgSrc] = useState(AVATARS[joke.author]);
    const [imgAttempt, setImgAttempt] = useState(0);

    const handleError = () => {
         const firstName = joke.author.split(' ')[0];
         const lowerName = firstName.toLowerCase();
         
         if (imgAttempt === 0) {
             setImgSrc(`./${lowerName}.jpg`);
             setImgAttempt(1);
         } else if (imgAttempt === 1) {
             setImgSrc(`./${lowerName}.png`);
             setImgAttempt(2);
         } else if (imgAttempt === 2) {
             setImgSrc(`./${firstName}.jpg`);
             setImgAttempt(3);
         } else {
             const seed = firstName;
             const bgColors: Record<string, string> = {
                'Amiram': 'b6e3f4',
                'David': 'd1fae5',
                'Shoval': 'e9d5ff'
            };
            const bg = bgColors[seed] || 'e2e8f0';
            setImgSrc(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bg}`);
         }
    };

    return (
        <div 
            className="bg-white rounded-[1.25rem] md:rounded-[1.5rem] p-4 md:p-5 shadow-sm hover:shadow-md border border-slate-100 flex gap-3 md:gap-4 items-start relative group transition-all duration-200 hover:-translate-y-1"
          >
             <div className="relative flex-shrink-0">
                <img 
                  src={imgSrc} 
                  alt={joke.author}
                  onError={handleError} 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 ${colors.border} bg-slate-50 object-cover`}
                />
             </div>
            <div className="flex-grow pt-0.5">
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-sm font-extrabold ${colors.text}`}>{joke.author.split(' ')[0]}</span>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
                    <Calendar size={10} strokeWidth={2.5} />
                    {joke.date}
                </span>
              </div>
              <p className="text-slate-800 text-base md:text-lg font-medium leading-relaxed pr-8 md:pr-10" dir="rtl">{joke.content}</p>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(joke.id);
              }}
              className={`absolute top-4 right-3 md:right-4 p-1.5 md:p-2 rounded-full transition-all ${
                  isFav ? 'bg-yellow-50 text-yellow-400' : 'text-slate-200 hover:text-yellow-400 hover:bg-slate-50'
              }`}
            >
              <Star 
                size={16} 
                className={isFav ? "fill-yellow-400" : ""} 
                strokeWidth={2.5}
              />
            </button>
          </div>
    );
}