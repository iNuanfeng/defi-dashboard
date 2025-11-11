# DeFi Dashboard

一个多链 DeFi 投资组合跟踪仪表盘，支持以太坊和 Polygon 网络的资产查看和管理。

## ✨ 功能特性

- 🔗 **多链支持**: 以太坊 (ETH) 和 Polygon (MATIC)
- 💰 **资产展示**: 原生代币和 ERC20 代币余额查看
- 💵 **实时定价**: 基于 CoinGecko API 的实时价格数据
- 📊 **投资组合总览**: 总价值、24小时变化等统计信息
- 🔐 **钱包连接**: 基于 RainbowKit 的安全钱包连接
- ⚡ **高性能**: React Query 驱动的高效数据缓存

## 🏗 技术架构

### 核心技术栈
- **前端**: Next.js 16, React 19, TypeScript
- **样式**: Tailwind CSS 4
- **钱包集成**: wagmi v2, RainbowKit v2
- **数据获取**: React Query (TanStack Query)
- **区块链交互**: viem v2

### 项目结构
```
├── app/                    # Next.js App Router
├── components/            # React 组件
├── lib/
│   ├── hooks/            # React hooks + API调用
│   └── utils/           # 工具函数
├── config/              # 配置文件
└── .github/
    ├── migrations/      # 迁移文档
    ├── prdDocs/        # 产品文档
    └── techDocs/       # 技术文档
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm (推荐)

### 安装依赖
```bash
pnpm install
```

### 开发服务器
```bash
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
pnpm build
pnpm start
```

## 📖 文档

### 开发文档
- **[技术方案](.github/techDocs/mvp-technical-solution.md)** - 详细技术架构说明
- **[产品需求](.github/prdDocs/defi-dashboard-mvp.md)** - MVP 功能需求文档

### 迁移记录
- **[迁移索引](.github/migrations/README.md)** - 所有迁移记录的索引
- **[React Query 迁移](.github/migrations/react-query-migration.md)** - 最新架构迁移详情

## 🔧 开发指南

### 数据获取
使用 React Query hooks 进行数据获取：

```typescript
import { useAllTokenPrices } from '@/lib/hooks';

const { data: prices, isLoading, error } = useAllTokenPrices();
```

### 格式化工具
使用内置的格式化函数：

```typescript
import { formatUSDValue, formatPriceChange } from '@/lib/utils';

const formattedValue = formatUSDValue(1234.56); // "$1,234.56"
const formattedChange = formatPriceChange(5.67); // "+5.67%"
```

### 支持的网络
- **Ethereum**: Chain ID 1
- **Polygon**: Chain ID 137

## 📊 性能特性

- **智能缓存**: 1分钟新鲜度，5分钟缓存时间
- **后台更新**: 每分钟自动刷新价格数据
- **错误重试**: 自动重试失败的网络请求
- **查询去重**: 相同请求自动合并，避免重复调用

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

[MIT License](LICENSE)

## 🙏 致谢

- [Next.js](https://nextjs.org) - React 全栈框架
- [wagmi](https://wagmi.sh) - React Hooks for Ethereum
- [RainbowKit](https://rainbowkit.com) - 钱包连接组件
- [TanStack Query](https://tanstack.com/query) - 数据获取库
- [CoinGecko](https://coingecko.com) - 加密货币价格API

---

*最后更新: 2024年11月*
