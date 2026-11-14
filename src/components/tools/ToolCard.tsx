import React from 'react';
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  Images,
  Code,
  FileType,
  FileCheck,
  Globe,
  Combine,
  Split,
  Copy,
  ArrowUpDown,
  RotateCw,
  Trash2,
  Minimize2,
  Lock,
  Unlock,
  Hash,
  Stamp,
  Sparkles,
  Type,
  FolderArchive,
  Info,
  FilePlus,
  Files,
  Eye,
  Maximize2,
  Minimize,
  Crop,
  Sliders,
  Layers,
  Archive,
  HelpCircle,
  Calculator,
  ShieldCheck,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (tool: ToolDefinition) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  FileCode,
  Image: ImageIcon,
  Images,
  Code,
  FileType,
  FileCheck,
  Globe,
  Combine,
  Split,
  Copy,
  ArrowUpDown,
  RotateCw,
  Trash2,
  Minimize2,
  Lock,
  Unlock,
  Hash,
  Stamp,
  Sparkles,
  Type,
  FolderArchive,
  Info,
  FilePlus,
  Files,
  Eye,
  Maximize2,
  Minimize,
  Crop,
  Sliders,
  Layers,
  Archive,
  HelpCircle,
  Calculator,
  ShieldCheck,
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const IconComponent = ICON_MAP[tool.iconName] || FileText;

  return (
    <div
      onClick={() => onSelect(tool)}
      className="group relative flex flex-col justify-between p-5 rounded-card border border-df-black/10 dark:border-df-white/10 bg-df-white dark:bg-df-black hover:border-df-blue/40 dark:hover:border-df-blue/40 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between mb-3.5">
          <div className="w-11 h-11 rounded-xl bg-df-blue/10 text-df-blue border border-df-blue/20 group-hover:bg-df-blue group-hover:text-df-white group-hover:border-df-blue transition-colors flex items-center justify-center">
            <IconComponent className="w-5 h-5" />
          </div>
          {tool.status !== 'fully-implemented' && (
            <StatusBadge status={tool.status} notice={tool.statusNotice} />
          )}
        </div>

        <h4 className="font-bold text-base text-df-black dark:text-df-white group-hover:text-df-blue transition-colors mb-1.5">
          {tool.name}
        </h4>
        <p className="text-xs text-df-black/60 dark:text-df-white/60 leading-relaxed mb-4">
          {tool.description}
        </p>
      </div>

      <div className="pt-3 border-t border-df-black/5 dark:border-df-white/5 flex items-center justify-between text-xs font-semibold text-df-blue">
        <span>Use Tool</span>
        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

