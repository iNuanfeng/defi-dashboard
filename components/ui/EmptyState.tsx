/**
 * 空状态组件
 * 当没有数据时显示的友好界面
 */

import { WalletIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'wallet' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon = 'info', 
  action, 
  className = '' 
}: EmptyStateProps) {
  const getIcon = () => {
    const iconClass = "w-12 h-12 text-gray-400 mx-auto";
    
    switch (icon) {
      case 'wallet':
        return <WalletIcon className={iconClass} />;
      case 'warning':
        return <ExclamationTriangleIcon className={iconClass} />;
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mb-4">
        {getIcon()}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 max-w-sm mx-auto mb-6">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-transparent shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface NoAssetsStateProps {
  isConnected: boolean;
  onConnectWallet: () => void;
  className?: string;
}

export function NoAssetsState({ isConnected, onConnectWallet, className = '' }: NoAssetsStateProps) {
  if (!isConnected) {
    return (
      <EmptyState
        icon="wallet"
        title="连接钱包开始使用"
        description="请连接您的加密货币钱包以查看资产余额和进行DeFi操作"
        action={{
          label: "连接钱包",
          onClick: onConnectWallet
        }}
        className={className}
      />
    );
  }

  return (
    <EmptyState
      title="暂无资产"
      description="当前钱包中没有发现任何加密资产。您可以向钱包转入一些代币后重新查看。"
      className={className}
    />
  );
}