export type UserRole = 'free' | 'basic' | 'pro' | 'premium';

interface ArticleCardProps {
  title: string;
  date: string;
  abstract: string;
  requiredRole?: UserRole;
  userRole?: UserRole;
  onExpand?: () => void;
  className?: string;
  imageUrl?: string;
  variant?: 'default' | 'report';
}

const ROLE_LEVELS: Record<UserRole, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  premium: 3,
};

export function ArticleCard({
  title,
  date,
  abstract,
  requiredRole = 'free',
  userRole = 'free',
  onExpand,
  className = 'h-full min-h-[300px]',
  imageUrl,
  variant = 'default',
}: ArticleCardProps) {
  // Check access based on role hierarchy
  const hasAccess = ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
  const isLocked = !hasAccess;

  const isHomepage = variant !== 'report';

  let bgClass = '';
  let textClass = 'text-[#222]';
  let titleClass = 'text-black';
  let dateClass = 'text-gray-500';
  let abstractClass = 'text-[#333]';
  let dividerClass = 'border-black/10';
  let bgStyle: React.CSSProperties | undefined = undefined;

  if (isHomepage) {
    if (isLocked) {
      bgClass = 'bg-[#c4c4c4] border-black/5 shadow-lg';
    } else if (requiredRole === 'premium') {
      // Premium unlocked card on homepage
      bgClass = 'border-t-black/10 border-x-black/10 border-b-0 shadow-xl hover:opacity-95 backdrop-blur-md';
      bgStyle = { background: 'linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.5) 100%)' };
      titleClass = 'text-black';
      dateClass = 'text-gray-600';
      abstractClass = 'text-[#222]';
    } else {
      // Normal unlocked card on homepage
      bgClass = 'bg-[#151515]/80 border-white/5 shadow-md hover:border-white/10 hover:bg-[#181818]/90';
      textClass = 'text-white';
      titleClass = 'text-white';
      dateClass = 'text-gray-400';
      abstractClass = 'text-gray-300';
      dividerClass = 'border-white/10';
    }
  } else {
    // Reports page (variant === 'report')
    bgClass = 'bg-[#e5e5e7] border-black/5 shadow-xl';
  }

  return (
    <div
      className={`relative p-8 rounded-[32px] transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between ${bgClass} ${textClass} ${className}`}
      style={bgStyle}
    >
      <div className="flex-1 flex flex-col">
        {/* Header section with title and action button */}
        <div className="flex justify-between items-start gap-4 mb-2">
          <div>
            <h3
              onClick={hasAccess ? onExpand : undefined}
              className={`text-xl font-semibold leading-tight mb-2 ${hasAccess ? 'cursor-pointer hover:underline' : ''} ${titleClass}`}
            >
              {title}
            </h3>
            <p className={`text-[13px] font-medium ${dateClass}`}>
              {date}
            </p>
          </div>

          {/* Top Right Action Button */}
          {hasAccess ? (
            <button
              onClick={onExpand}
              className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer border border-black/5 flex-shrink-0"
              aria-label="Expand article"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          ) : (
            <div
              className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-md border border-black/5 flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}
        </div>

        {/* Divider Line */}
        <div className={`border-b ${dividerClass} my-2.5`} />

        {/* Abstract */}
        <p className={`text-[14px] leading-[1.6] font-normal ${abstractClass} mb-2.5 line-clamp-2 overflow-hidden text-ellipsis`}>
          {abstract}
        </p>

        {/* Image */}
        {imageUrl && (
          <div className="rounded-[24px] overflow-hidden shadow-sm border border-black/5 aspect-[16/9] w-full mt-auto mb-1">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover select-none pointer-events-none" />
          </div>
        )}
      </div>

      {/* Lock Info Pill */}
      {isLocked && (
        <div className="mt-2.5 self-start bg-white text-[#d97706] font-medium text-[12px] px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm border border-yellow-500/10 select-none">
          <span className="text-[14px] leading-none">👑</span>
          <span>Only for Premium User</span>
        </div>
      )}
    </div>
  );
}
