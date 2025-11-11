/**
 * 链选择标签组件
 * 用于在不同区块链之间切换
 */

interface ChainTabProps {
  chainId: number;
  name: string;
  symbol: string;
  value: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

export function ChainTab({ 
  name, 
  value, 
  active, 
  onClick, 
  className = '' 
}: ChainTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
    >
      {name} ({value})
    </button>
  );
}

interface ChainTabGroupProps {
  chains: Array<{
    chainId: number;
    name: string;
    symbol: string;
    value: string;
  }>;
  activeChainId: number;
  onChainChange: (chainId: number) => void;
  className?: string;
}

export function ChainTabGroup({ 
  chains, 
  activeChainId, 
  onChainChange, 
  className = '' 
}: ChainTabGroupProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {chains.map((chain) => (
        <ChainTab
          key={chain.chainId}
          chainId={chain.chainId}
          name={chain.name}
          symbol={chain.symbol}
          value={chain.value}
          active={activeChainId === chain.chainId}
          onClick={() => onChainChange(chain.chainId)}
        />
      ))}
    </div>
  );
}