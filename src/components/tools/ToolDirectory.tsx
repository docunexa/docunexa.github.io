import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ToolCategory, ToolDefinition } from '../../types';
import { TOOLS_REGISTRY } from '../../tools/registry';
import { ToolCard } from './ToolCard';

interface ToolDirectoryProps {
  onSelectTool: (tool: ToolDefinition) => void;
}

const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'pdf', label: 'PDF Suite' },
  { id: 'word', label: 'Word (.docx)' },
  { id: 'image', label: 'Image Studio' },
  { id: 'text', label: 'Text & Web' },
  { id: 'utility', label: 'Archive & Utilities' },
];

export const ToolDirectory: React.FC<ToolDirectoryProps> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    return TOOLS_REGISTRY.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.sourceFormats.some((fmt) => fmt.toLowerCase().includes(q)) ||
        (tool.targetFormat && tool.targetFormat.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="all-tools" className="py-16 border-t border-df-black/10 dark:border-df-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-df-pink">
              <span className="w-2 h-2 rounded-full bg-df-pink" />
              <span>Full Toolkit Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-df-black dark:text-df-white">
              Every document tool at your fingertips
            </h2>
            <p className="text-sm text-df-black/60 dark:text-df-white/60 max-w-xl">
              50+ precision tools built with client-side WebAssembly, Canvas, and Web Crypto APIs. Fast, private, and zero server lag.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-df-black/40 dark:text-df-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools or formats..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-btn bg-df-white dark:bg-df-black border border-df-black/15 dark:border-df-white/15 text-df-black dark:text-df-white placeholder:text-df-black/40 dark:placeholder:text-df-white/40 focus:border-df-blue focus:ring-1 focus:ring-df-blue transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? TOOLS_REGISTRY.length
                : TOOLS_REGISTRY.filter((t) => t.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-df-blue text-df-white shadow-sm'
                    : 'bg-df-black/5 dark:bg-df-white/5 text-df-black/70 dark:text-df-white/70 hover:bg-df-black/10 dark:hover:bg-df-white/10'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Tool Cards Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-df-black/15 dark:border-df-white/15 rounded-card space-y-3">
            <SlidersHorizontal className="w-8 h-8 text-df-black/30 dark:text-df-white/30 mx-auto" />
            <h4 className="font-semibold text-df-black dark:text-df-white">No matching tools found</h4>
            <p className="text-xs text-df-black/60 dark:text-df-white/60">
              Try adjusting your search terms or selecting another category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-semibold text-df-blue hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

