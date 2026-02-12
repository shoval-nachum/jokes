import React from 'react';
import { Author, SortOption } from '../types';
import { AUTHOR_COLORS } from '../constants';
import { Filter, X, Search, ArrowUpDown, Download } from 'lucide-react';

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
  onExport
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🤣</span>
            <span>The Wordplay Archive</span>
          </h1>
          <div className="flex items-center gap-3">
            <button
                onClick={onExport}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                title="Export Database"
            >
                <Download size={18} />
                <span className="text-xs font-medium hidden sm:inline">Export DB</span>
            </button>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {resultCount} {resultCount === 1 ? 'Joke' : 'Jokes'}
            </span>
          </div>
        </div>

        {/* Search and Sort Row */}
        <div className="flex gap-2 mb-2">
            {/* Search Input */}
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search jokes..." 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                {searchTerm && (
                    <button 
                        onClick={() => onSearchChange('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[120px]">
               <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-500">
                  <ArrowUpDown size={14} />
               </div>
               <select
                  value={sortOption}
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none cursor-pointer"
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
      <div className="overflow-x-auto whitespace-nowrap px-4 py-2 border-t border-gray-100 scrollbar-hide">
        <div className="flex gap-2 pb-1">
          <button
             onClick={() => onFilterChange(null)}
             className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
               currentAuthorFilter === null 
                 ? 'bg-gray-800 text-white shadow-md' 
                 : 'bg-white text-gray-600 border border-gray-200'
             }`}
          >
            All <span className="ml-1 opacity-75 text-xs">({totalCount})</span>
          </button>
          {Object.values(Author).map((author) => {
            const isActive = currentAuthorFilter === author;
            const colors = AUTHOR_COLORS[author];
            const count = authorCounts[author] || 0;
            return (
              <button
                key={author}
                onClick={() => onFilterChange(isActive ? null : author)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive 
                    ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-${colors.border.split('-')[1]}` 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {author.split(' ')[0]} <span className="opacity-75 text-xs">({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};