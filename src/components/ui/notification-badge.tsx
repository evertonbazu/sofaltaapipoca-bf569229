
import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  maxCount?: number;
}

export const NotificationBadge = React.forwardRef<HTMLDivElement, NotificationBadgeProps>(
  ({ count, maxCount = 99, className, ...props }, ref) => {
    if (count <= 0) return null;
    
    const displayCount = count > maxCount ? `${maxCount}+` : count;
    
    return (
      <div 
        ref={ref}
        className={cn(
          "absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs min-w-[18px] h-[18px] px-1",
          className
        )}
        {...props}
      >
        {displayCount}
      </div>
    );
  }
);

NotificationBadge.displayName = "NotificationBadge";
