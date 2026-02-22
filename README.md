# 无敌麦当当的疯狂 8 点 (Crazy Eights)

这是一个使用 React + Vite + Tailwind CSS 构建的经典纸牌游戏。

## 游戏特性
- 完整的 Crazy Eights 规则
- 智能 AI 对战
- 响应式设计（支持手机和电脑）
- 流畅的动画效果 (Motion)

## 本地开发
1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 部署到 Vercel
本项目已配置好 Vercel 部署所需的文件。

1. **推送代码到 GitHub**
   - 创建一个新的 GitHub 仓库。
   - 将本地代码推送到该仓库。

2. **在 Vercel 中导入**
   - 登录 Vercel，选择 "Add New Project"。
   - 导入您的 GitHub 仓库。

3. **配置环境变量**
   - 在 Vercel 项目设置中，添加环境变量 `GEMINI_API_KEY`。
   - 填入您的 Google AI Studio API 密钥。

4. **完成部署**
   - Vercel 会自动识别 Vite 配置并完成构建。

## 技术栈
- React 19
- Tailwind CSS 4
- Motion (动画)
- Lucide React (图标)
- Vite
