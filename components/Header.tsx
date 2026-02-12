import React, { useState, useEffect } from 'react';
import { Author, SortOption } from '../types';
import { AUTHOR_COLORS, AVATARS } from '../constants';
import { Filter, X, Search, ArrowUpDown, Download, Star } from 'lucide-react';

interface HeaderProps {
  currentAuthorFilter: Author | null;
  onFilterChange: (author: Author | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  resultCount: number;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  authorCounts: Record<string, number>;
  totalCount: number;
  onExport: () => void;
  showFavorites: boolean;
  onFavoritesToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentAuthorFilter, 
  onFilterChange,
  searchTerm,
  onSearchChange,
  resultCount,
  sortOption,
  onSortChange,
  authorCounts,
  totalCount,
  onExport,
  showFavorites,
  onFavoritesToggle
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all pb-2">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center gap-2 tracking-tight">
              <span className="text-2xl md:text-3xl filter drop-shadow-sm hover:scale-110 transition-transform cursor-default">🤣</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Wordplay
              </span>
            </h1>
            
            {/* Mobile-only action buttons */}
            <div className="flex sm:hidden items-center gap-1">
                <button
                    onClick={onFavoritesToggle}
                    className={`p-2 rounded-full transition-all ${showFavorites ? 'text-yellow-400 bg-yellow-50' : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-50'}`}
                >
                    <Star size={18} strokeWidth={2.5} fill={showFavorites ? "currentColor" : "none"} />
                </button>
                <button
                    onClick={onExport}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                >
                    <Download size={18} strokeWidth={2.5} />
                </button>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full ml-1">
                    {resultCount}
                </span>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
                onClick={onFavoritesToggle}
                className={`p-2.5 rounded-full transition-all hover:scale-105 active:scale-95 ${showFavorites ? 'text-yellow-400 bg-yellow-50' : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-50'}`}
                title="Toggle Favorites"
            >
                <Star size={20} strokeWidth={2.5} fill={showFavorites ? "currentColor" : "none"} />
            </button>
            <button
                onClick={onExport}
                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all hover:scale-105 active:scale-95"
                title="Export Database"
            >
                <Download size={20} strokeWidth={2.5} />
            </button>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full ml-1">
                {resultCount}
            </span>
          </div>
        </div>

        {/* Search and Sort Row */}
        <div className="flex gap-2 md:gap-3 mb-2">
            {/* Search Input */}
            <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 md:pl-11 pr-8 md:pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                {searchTerm && (
                    <button 
                        onClick={() => onSearchChange('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[110px] md:min-w-[130px]">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <ArrowUpDown size={16} />
               </div>
               <select
                  value={sortOption}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  className="w-full pl-9 pr-4 md:pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs md:text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all hover:bg-slate-100"
               >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
               </select>
            </div>
        </div>
      </div>

      {/* Author Filter Bar */}
      <div className="overflow-x-auto whitespace-nowrap px-4 pb-2 scrollbar-hide">
        <div className="flex gap-2.5 min-w-max mx-auto sm:justify-center">
          <button
             onClick={() => onFilterChange(null)}
             className={`px-4 md:px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 active:scale-95 border-2 ${
               currentAuthorFilter === null 
                 ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200' 
                 : 'bg-white text-slate-600 border-transparent hover:border-slate-200 shadow-sm'
             }`}
          >
            All <span className="ml-1 opacity-60 text-xs font-normal">({totalCount})</span>
          </button>
          {Object.values(Author).map((author) => {
            const isActive = currentAuthorFilter === author;
            const colors = AUTHOR_COLORS[author];
            const count = authorCounts[author] || 0;
            return (
              <FilterButton 
                key={author} 
                author={author} 
                isActive={isActive} 
                colors={colors} 
                count={count} 
                onClick={() => onFilterChange(isActive ? null : author)} 
              />
            );
          })}
        </div>
      </div>
    </header>
  );
};

const FilterButton: React.FC<{
    author: Author, 
    isActive: boolean, 
    colors: any, 
    count: number, 
    onClick: () => void
}> = ({ author, isActive, colors, count, onClick }) => {
    const [imgSrc, setImgSrc] = useState(AVATARS[author]);

    useEffect(() => {
        setImgSrc(AVATARS[author]);
    }, [author]);

    const handleError = () => {
         const seed = author.split(' ')[0];
         const bgColors: Record<string, string> = {
            'Amiram': 'b6e3f4',
            'David': 'd1fae5',
            'Shoval': 'e9d5ff'
        };
        const bg = bgColors[seed] || 'e2e8f0';
        setImgSrc(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bg}`);
    };

    return (
        <button
            onClick={onClick}
            className={`pl-1.5 pr-4 md:pr-5 py-1.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 border-2 ${
              isActive 
                ? `${colors.bg} ${colors.text} ${colors.border} shadow-md` 
                : 'bg-white text-slate-600 border-transparent hover:border-slate-200 shadow-sm hover:shadow-md'
            }`}
          >
            <img 
                src={imgSrc} 
                alt={author} 
                onError={handleError}
                className="w-7 h-7 rounded-full object-cover border border-white shadow-sm"
            />
            {author.split(' ')[0]} <span className="opacity-60 text-xs font-normal">({count})</span>
          </button>
    );
};