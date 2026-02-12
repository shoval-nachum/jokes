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
    return <div className="text-center p-10 text-gray-500">No jokes found for this filter.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] relative w-full max-w-md mx-auto px-4 mt-8">
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
      <div className="absolute bottom-0 text-sm text-gray-400 font-medium">
        Swipe left or right for next joke ({currentIndex + 1}/{jokes.length})
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
    return <div className="text-center p-10 text-gray-500">No jokes found for this filter.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] relative w-full max-w-md mx-auto px-4 mt-4">
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
      <div className="absolute bottom-2 text-sm text-gray-400 font-medium z-0">
        Swipe for next cartoon ({currentIndex + 1}/{jokes.length})
      </div>
    </div>
  );
};

export const GridView: React.FC<ViewProps> = ({ jokes, favorites, onToggleFavorite }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 pb-24">
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
    <div className="flex flex-col gap-4 p-4 pb-24 max-w-2xl mx-auto">
      {jokes.map((joke) => {
        const colors = AUTHOR_COLORS[joke.author];
        const isFav = favorites.includes(joke.id);
        
        return (
          <div key={joke.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start relative group">
             <img 
              src={AVATARS[joke.author]} 
              alt={joke.author} 
              className={`w-10 h-10 rounded-full border-2 ${colors.border} flex-shrink-0 mt-1`}
            />
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-bold ${colors.text}`}>{joke.author.split(' ')[0]}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={10} />
                    {joke.date}
                </span>
              </div>
              <p className="text-gray-800 text-lg leading-snug pr-8" dir="rtl">{joke.content}</p>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(joke.id);
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Star 
                size={18} 
                className={isFav ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
              />
            </button>
          </div>
        );
      })}
    </div>
  );
};