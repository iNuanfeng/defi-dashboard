/**
 * 加载状态组件
 * 提供统一的加载动画和状态展示
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ message = '加载中...', size = 'md', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <LoadingSpinner size={size} className="mb-3" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className = '', rows = 1 }: SkeletonProps) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 rounded h-4 ${i > 0 ? 'mt-2' : ''} ${className}`}
        />
      ))}
    </div>
  );
}

interface AssetLoadingCardProps {
  className?: string;
}

export function AssetLoadingCard({ className = '' }: AssetLoadingCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
    </div>
  );
}