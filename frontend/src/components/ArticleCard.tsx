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
  const isLightBg = variant === 'report' || isLocked || (!isLocked && requiredRole === 'premium');

  // Capitalize role for display (e.g., premium -> Premium)
  const formatRoleName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div
      className={`relative p-8 rounded-[24px] transition-all duration-300 flex flex-col justify-between border ${
        variant === 'report'
          ? 'bg-[#c4c4c4] border-black/5 text-[#222] shadow-lg'
          : isLocked
            ? 'bg-[#c4c4c4] border-black/5 text-[#222] shadow-lg'
            : requiredRole === 'premium'
              ? 'border-t-black/10 border-x-black/10 border-b-0 text-black shadow-xl hover:opacity-95 backdrop-blur-md'
              : 'bg-[#151515]/80 border-white/5 text-white shadow-md hover:border-white/10 hover:bg-[#181818]/90'
      } ${className}`}
      style={
        variant !== 'report' && !isLocked && requiredRole === 'premium'
          ? { background: 'linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.5) 100%)' }
          : undefined
      }
    >
      <div className="flex-1 flex flex-col">
        {/* Header section with title and expand/lock icon */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h3
              onClick={hasAccess ? onExpand : undefined}
              className={`text-[20px] font-semibold leading-tight mb-1.5 ${hasAccess ? 'cursor-pointer hover:underline' : ''} ${isLightBg ? 'text-black' : 'text-white'}`}
            >
              {title}
            </h3>
            <p className={`text-[12px] font-medium ${isLightBg ? 'text-gray-600' : 'text-gray-500'}`}>
              {date}
            </p>
          </div>

          {/* Top Right Action Button */}
          {hasAccess ? (
            <button
              onClick={onExpand}
              className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer border border-black/5"
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
              className="w-10 h-10 bg-white rounded-[12px] flex items-center justify-center shadow-md border border-black/5"
              title={`${formatRoleName(requiredRole)} Clearance Required`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}
        </div>

        {/* Abstract */}
        <p className={`text-[14px] leading-[1.6] font-normal ${isLightBg ? 'text-[#333]' : 'text-gray-400'}`}>
          {abstract}
        </p>

        {imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden shadow-sm border border-black/5 aspect-[16/9] w-full">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover select-none pointer-events-none" />
          </div>
        )}
      </div>

      {/* Premium User Crown Badge (or relevant required tier badge) */}
      {requiredRole !== 'free' && isLocked && (
        <div className="mt-6 self-start bg-white text-[#d97706] font-medium text-[12px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-yellow-500/10">
          <span className="text-[14px] leading-none">👑</span>
          <span>Only for {formatRoleName(requiredRole)} User</span>
        </div>
      )}
    </div>
  );
}
