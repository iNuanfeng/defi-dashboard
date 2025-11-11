/**
 * 错误状态组件
 * 提供统一的错误信息展示和重试功能
 */

import { ExclamationTriangleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  type?: 'error' | 'warning' | 'network';
  className?: string;
}

export function ErrorState({ 
  title,
  message, 
  onRetry, 
  retryText = '重试',
  type = 'error',
  className = '' 
}: ErrorStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />;
      case 'network':
        return <XCircleIcon className="w-8 h-8 text-orange-500" />;
      default:
        return <XCircleIcon className="w-8 h-8 text-red-500" />;
    }
  };

  const getColorScheme = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'network':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`rounded-lg border p-6 text-center ${getColorScheme()} ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        {getIcon()}
        
        {title && (
          <h3 className="text-lg font-medium">{title}</h3>
        )}
        
        <p className="text-sm max-w-md">{message}</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div className={`flex items-center space-x-2 text-red-600 text-sm ${className}`}>
      <XCircleIcon className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className = '' }: NetworkErrorProps) {
  return (
    <ErrorState
      type="network"
      title="网络连接问题"
      message="无法获取数据，请检查您的网络连接或稍后重试"
      onRetry={onRetry}
      className={className}
    />
  );
}

interface WalletConnectionError {
  onRetry?: () => void;
  className?: string;
}

export function WalletConnectionError({ onRetry, className = '' }: WalletConnectionError) {
  return (
    <ErrorState
      type="warning"
      title="钱包连接问题"
      message="无法连接到您的钱包，请确保钱包已解锁并重新连接"
      onRetry={onRetry}
      retryText="重新连接"
      className={className}
    />
  );
}