# 🏠 DRheEheAM_Gary 个人主页

> 初三(准高一)生 · OIer · 二次元  
> 「爱如果太猛烈/注定是要毁灭」

基于 **React 19** + **Vite 8** 构建的现代个人主页，融合了粒子动效、音乐播放、主题切换等丰富交互。

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ 功能特性

| 特性 | 说明 |
|------|------|
| 🎨 **粒子背景** | 基于 tsParticles 的动态粒子系统，支持鼠标悬停交互 |
| 🌓 **明暗主题** | 一键切换 Light / Dark 模式 |
| 📝 **打字机歌词** | 逐字显示喜欢的歌词，循环播放 |
| 📊 **GitHub 贡献图** | 集成 react-github-calendar 展示年度贡献 |
| 📺 **B站动态** | 调用 Bilibili API 拉取最新动态 |
| 📱 **响应式设计** | 适配桌面与移动端 |
| 🖱️ **滚动吸附** | CSS Scroll Snap 无缝切换页面，Tab 自动高亮 |
| ✨ **元素上浮动画** | IntersectionObserver 驱动，元素依次从下方浮入 |
| 🔵 **淡蓝点缀** | 图标、头像光环等淡蓝色点缀，清新雅致 |
| 💳 **卡片悬停** | 圆角卡片 + hover 上浮 + 背景高亮

## 🗂️ 页面结构

| 页面 | 组件 | 内容 |
|------|------|------|
| 🏡 **首页** | `HomePage` | 简介、关于我、游戏/二次元成分 |
| 📧 **联系** | `ContactPage` | 联系方式 |
| 🎮 **游戏** | `GamesPage` | 游戏账号展示 |
| 🌸 **二次元** | `AnimePage` | 虚拟主播、角色主推 |
| 💻 **项目** | `ProjectsPage` | GitHub 项目、贡献图、B站动态 |
| 🔗 **链接** | `LinksPage` | 个人网站、社交链接合集 |

> 💡 「关于我」已合并至首页，无需单独页面。
>
> 💡 右侧全局边栏固定显示头像、名字和歌词打字机。

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## 🧩 技术栈

| 技术 | 用途 |
|------|------|
| **React 19** | UI 框架 |
| **Vite 8** | 构建工具 |
| **tsParticles** | 粒子动画背景 |
| **react-github-calendar** | GitHub 贡献热力图 |
| **react-icons** | 图标库 |
| **Font Awesome** | 社交/游戏图标 |
| **ESLint** | 代码检查 |

## 📁 项目结构

```
src/
├── assets/              # 静态资源
├── components/          # 通用组件
│   ├── AnimatedSection.jsx    # 滚动动画容器
│   ├── BiliBiliFeed.jsx       # B站动态
│   ├── GitHubContributions.jsx # GitHub贡献图
│   ├── LyricsTypewriter.jsx   # 歌词打字机
│   ├── MusicPlayer.jsx        # 音乐播放器
│   ├── ParticleBackground.jsx # 粒子背景
│   ├── TabBar.jsx             # 标签导航栏
│   └── ThemeToggle.jsx        # 主题切换按钮
├── data/
│   └── profile.js       # 个人信息配置文件
├── hooks/
│   └── useTheme.jsx     # 主题管理 Hook
├── pages/               # 页面组件
│   ├── HomePage.jsx
│   ├── ContactPage.jsx
│   ├── GamesPage.jsx
│   ├── AnimePage.jsx
│   ├── ProjectsPage.jsx
│   └── LinksPage.jsx
├── App.jsx              # 应用主入口
├── App.css              # 全局样式
├── index.css            # 基础样式重置
└── main.jsx             # 渲染入口
```

## ⚙️ 自定义配置

所有个人信息集中管理在 `src/data/profile.js` 中，包括：

- 个人简介与签名
- 联系方式（邮箱、QQ、电话、B站）
- 游戏账号（原神、星穹铁道、Minecraft）
- 喜欢的歌曲列表
- 二次元/VTB 推的角色
- GitHub 项目链接
- 社交链接合集

只需修改该文件即可快速定制属于自己的主页。

## 📄 开源协议

本项目基于 **MIT** 协议开源。

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/DRheEheAMGary">DRheEheAM_Gary</a>
</p>
