import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { jokes as initialJokes } from './data';
import { Author, ViewMode, SortOption, Joke } from './types';
import { Header } from './components/Header';
import { SwipeView, GridView, ListView, CartoonView } from './components/Views';
import { Layers, Grid, List as ListIcon, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [authorFilter, setAuthorFilter] = useState<Author | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Joke Management State
  const [customJokes, setCustomJokes] = useState<Joke[]>(() => {
    try {
      const saved = localStorage.getItem('customJokes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load custom jokes", e);
      return [];
    }
  });

  const allJokes = useMemo(() => [...initialJokes, ...customJokes], [customJokes]);
  
  // Image Generation State
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  // Initialize favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jokeFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load favorites", e);
      return [];
    }
  });

  const generateImageForJoke = async (joke: Joke) => {
    if (imageCache[joke.id] || loadingImages[joke.id]) return;

    setLoadingImages(prev => ({ ...prev, [joke.id]: true }));

    try {
      // Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `A funny, colorful cartoon illustration representing this Hebrew wordplay joke: "${joke.content}". The style should be playful, artistic and suitable for a mobile app. Do not include text.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            imageConfig: {
                aspectRatio: "1:1"
            }
        }
      });

      // Extract image from response
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
             const base64Image = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
             setImageCache(prev => ({ ...prev, [joke.id]: base64Image }));
             break; 
          }
        }
      }
    } catch (error: any) {
      console.error("Failed to generate image:", error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [joke.id]: false }));
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id];
      localStorage.setItem('jokeFavorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleExport = () => {
    const exportData = {
      meta: {
        title: "The Wordplay Archive Database",
        exportedAt: new Date().toISOString(),
        totalJokes: allJokes.length,
        version: "1.0"
      },
      jokes: allJokes,
      userFavorites: favorites
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wordplay-archive-db-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper for date parsing dd/mm/yyyy
  const parseDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    // month is 0-indexed in Date constructor
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
  };

  // Filter jokes by search term first (used for counts)
  const searchFilteredJokes = useMemo(() => {
    if (!searchTerm) return allJokes;
    const lowerCaseTerm = searchTerm.toLowerCase();
    return allJokes.filter(j => j.content.toLowerCase().includes(lowerCaseTerm));
  }, [searchTerm, allJokes]);

  // Calculate counts per author based on search results
  const authorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(Author).forEach(a => counts[a] = 0);
    
    searchFilteredJokes.forEach(joke => {
      if (counts[joke.author] !== undefined) {
        counts[joke.author]++;
      }
    });
    return counts;
  }, [searchFilteredJokes]);

  const totalCount = searchFilteredJokes.length;

  // Filter and Sort jokes for display
  const filteredAndSortedJokes = useMemo(() => {
    let result = [...searchFilteredJokes];
    
    // Filter by Favorites
    if (showFavorites) {
        result = result.filter(j => favorites.includes(j.id));
    }

    // Filter by Author
    if (authorFilter) {
      result = result.filter(j => j.author === authorFilter);
    }

    // Sort Results
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return parseDate(b.date) - parseDate(a.date);
        case 'oldest':
          return parseDate(a.date) - parseDate(b.date);
        case 'az':
          return a.content.localeCompare(b.content, 'he');
        case 'za':
          return b.content.localeCompare(a.content, 'he');
        default:
          return 0;
      }
    });

    return result;
  }, [searchFilteredJokes, authorFilter, sortOption, showFavorites, favorites]);

  return (
    <div className="min-h-screen font-sans pb-28 md:pb-20">
      
      {/* Top Navigation */}
      <Header 
        currentAuthorFilter={authorFilter} 
        onFilterChange={setAuthorFilter} 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        resultCount={filteredAndSortedJokes.length}
        sortOption={sortOption}
        onSortChange={setSortOption}
        authorCounts={authorCounts}
        totalCount={totalCount}
        onExport={handleExport}
        showFavorites={showFavorites}
        onFavoritesToggle={() => setShowFavorites(!showFavorites)}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto">
        {viewMode === 'swipe' && (
          <SwipeView 
            jokes={filteredAndSortedJokes} 
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {viewMode === 'cartoon' && (
          <CartoonView 
            jokes={filteredAndSortedJokes} 
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            imageCache={imageCache}
            loadingImages={loadingImages}
            onGenerateImage={generateImageForJoke}
          />
        )}
        {viewMode === 'grid' && (
          <GridView 
            jokes={filteredAndSortedJokes} 
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {viewMode === 'list' && (
          <ListView 
            jokes={filteredAndSortedJokes} 
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </main>

      {/* Bottom Tab Bar for View Modes */}
      <div className="fixed bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-xl px-2 py-2 rounded-full shadow-2xl border border-white/50 z-50 flex items-center gap-2">
        <button 
          onClick={() => setViewMode('list')}
          className={`p-2.5 md:p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
              viewMode === 'list' 
              ? 'bg-slate-800 text-white shadow-lg scale-100' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          aria-label="List View"
        >
          <ListIcon size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => setViewMode('grid')}
          className={`p-2.5 md:p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
              viewMode === 'grid' 
              ? 'bg-slate-800 text-white shadow-lg scale-100' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          aria-label="Grid View"
        >
          <Grid size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => setViewMode('swipe')}
          className={`p-2.5 md:p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
              viewMode === 'swipe' 
              ? 'bg-slate-800 text-white shadow-lg scale-100' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          aria-label="Swipe View"
        >
          <Layers size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
        </button>
        <div className="w-px h-5 md:h-6 bg-slate-200 mx-1"></div>
        <button 
          onClick={() => setViewMode('cartoon')}
          className={`p-2.5 md:p-3 rounded-full transition-all duration-300 flex items-center justify-center relative ${
              viewMode === 'cartoon' 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-100' 
              : 'text-purple-500 hover:text-purple-600 hover:bg-purple-50'
          }`}
          aria-label="Cartoon View"
        >
          <ImageIcon size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
          {viewMode !== 'cartoon' && (
             <span className="absolute top-1 right-1 flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-purple-500"></span>
             </span>
          )}
        </button>
      </div>

    </div>
  );
};

export default App;