import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  badge?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  className = '',
  badge,
}) => {
  const label = actionLabel || actionText;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-dashed border-[#F3C3D8] bg-[#FFF0F6]/50 ${className}`}
    >
      <div className="w-12 h-12 mb-3 rounded-2xl bg-white flex items-center justify-center text-[#D94F91] border border-[#F3C3D8] shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>
      {badge && (
        <span className="mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF0F6] text-[#A83267] border border-[#F3C3D8]">
          {badge}
        </span>
      )}
      <h3 className="text-sm font-bold text-[#54263F] tracking-tight">{title}</h3>
      <p className="mt-1 text-xs text-[#806779] max-w-sm leading-relaxed">{description}</p>
      {label && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-rose-primary mt-4 px-4 py-2 text-xs font-semibold cursor-pointer"
        >
          {label}
        </button>
      )}
    </div>
  );
};
