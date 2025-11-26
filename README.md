# Colosseum - SystematicTrade AI Dashboard

这是一个基于 React + TypeScript 的高频交易策略监控仪表盘。前端采用现代化的组件架构，模拟了实时的金融数据流和决策日志。

## 1. 代码结构说明 (通俗版)

这个项目是基于 **React** 框架构建的。你可以把它想象成搭积木，每个文件都是一个积木块。

### 核心文件
*   **`index.html`**: **地基**。网页的入口文件，它负责引入样式和脚本。
*   **`index.tsx`**: **启动开关**。它负责把 React 应用挂载到 HTML 上。
*   **`App.tsx`**: **主控室**。这是整个网页的骨架。它负责：
    *   页面布局（顶栏、左右分栏）。
    *   **调度中心**：它设置了一个定时器（每0.5秒），不断指挥后台生成新数据，并把数据分发给各个图表。
*   **`types.ts`**: **数据字典**。类似 Python 的 Class 定义。它规定了“仓位”、“日志”的数据格式，防止代码写错。

### 组件库 (components/)
*   **`DashboardCard.tsx`**: **万能卡片**。一个带标题栏的深色方框，用来装图表或表格。
*   **`EquityChart.tsx`**: **走势图**。负责画那条盈亏曲线。
*   **`PositionsTable.tsx`**: **持仓表**。展示当前买卖了哪些外汇。
*   **`ActivityLog.tsx`**: **日志流**。展示 AI 的决策过程（Input Prompt -> Chain of Thought -> Decision）。
*   **`CompetitionBoard.tsx`**: **排行榜**。展示多个策略的排名情况。
*   **`LiveTicker.tsx`**: **跳动特效**。这是一个很小的组件，专门负责监控数字变化。一旦数字变大就闪绿光，变小就闪红光，模拟心脏跳动的效果。

### 模拟后台 (核心逻辑)
*   **`simulation.ts`**: **假数据库/假后端**。
    *   因为目前没有连接真实的 Python 后端，这个文件在浏览器内存里模拟了一个交易系统。
    *   它保存了所有策略的 PnL、持仓和历史记录。
    *   `tick()` 函数：相当于每一个时间切片。每次调用它，它就微调价格（模拟波动），计算新的盈亏，并随机产生新的交易信号。

---

## 2. 模拟数据与实时更新机制

### 动态数据原理
目前的实时效果是通过**“轮询 (Polling)”**机制实现的，而不是真正的 WebSocket 推送。

1.  **数据源 (`simulation.ts`)**: 内部维护了一组变量（strategies, positions, logs）。
2.  **触发器 (`App.tsx`)**: 
    *   使用 `setInterval` 设置了一个 500ms (0.5秒) 的定时器。
    *   每隔 0.5秒，前端就会喊一声：“SimulationService，给我最新的数据！”
    *   `SimulationService.tick()` 响应请求，随即生成微小的价格波动，更新 PnL，并可能生成新的交易日志。
3.  **渲染**: React 接收到新数据，发现数据变了，于是自动更新界面上的数字。`LiveTicker` 组件检测到数字变化，触发颜色闪烁动画。

### 如何替换为真实数据？
当你有了真实的 Python 后端（比如 FastAPI 或 Flask）后，你需要做以下修改：

1.  找到 `App.tsx` 中的 `useEffect` 部分。
2.  将 `SimulationService.tick()` 替换为 HTTP 请求。

**代码示例：**

```typescript
// App.tsx 修改示意

useEffect(() => {
  const timer = setInterval(async () => {
    // 1. 向你的 Python 后端请求数据
    // 假设你的后端接口是 http://localhost:8000/api/snapshot
    const response = await fetch('http://localhost:8000/api/snapshot');
    const realData = await response.json();

    // 2. 将真实数据喂给前端
    setStrategies(realData.strategies);
    setPositions(realData.positions);
    setLogs(realData.logs);
    
  }, 500); // 频率可以根据实际情况调整

  return () => clearInterval(timer);
}, []);
```

---

## 3. 本地运行指南 (Local Run)

如果你想在自己的电脑上运行这个项目，请按照以下步骤操作。

### 环境准备
1.  安装 **Node.js** (推荐 v18 或更高版本)。
2.  准备一个代码编辑器 (VS Code 或 IntelliJ IDEA)。

### 安装与启动
1.  在项目根目录下打开终端 (Terminal)。
2.  安装依赖包 (相当于 pip install)：
    ```bash
    npm install
    ```
3.  启动开发服务器：
    ```bash
    npm run dev
    ```
4.  浏览器访问终端显示的地址 (通常是 `http://localhost:5173`)。

### 常见问题
*   **端口被占用**: 如果 5173 打不开，查看终端提示的新端口号。
*   **缺少依赖**: 如果报错 "Module not found"，请确保执行了 `npm install`。
