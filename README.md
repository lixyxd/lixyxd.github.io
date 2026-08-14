# lixyxd.github.io

**李小勇 Xiaoyong Li · 个人主页 / Personal Homepage**

西安电子科技大学（杭州研究院）副研究员 · 雷达成像 / 目标识别 / 深度学习
Associate Researcher, Hangzhou Institute of Technology, Xidian University · Radar Imaging / Target Recognition / Deep Learning

访问 / Visit: **https://lixyxd.github.io**

## 站点结构 / Structure

```
.
├── index.html      # 主页（中英双语，深色科技风）
├── 404.html        # 404 页面
├── .nojekyll       # 禁用 Jekyll（纯静态站点）
└── assets/
    ├── css/style.css     # 样式（雷达网格背景 / 玻璃拟态 / 渐变光效 / 微动画）
    ├── js/main.js        # 交互（导航 / 滚动显现 / 论文筛选 / 数字滚动 / 进度条 / 返回顶部 / 导航高亮）
    └── img/author_photo.jpg
```

## 版本记录 / Changelog

- **2026-08 美化改版**：深色科技风精修 —— 雷达网格 + 光晕动态背景、玻璃拟态卡片、标题渐变字、头像雷达扫描环、统计数字滚动、滚动进度条、返回顶部、滚动导航高亮、404 页面同步美化。改动均以 git 提交记录，可随时回退。

## 部署与更新 / Deploy & Update

GitHub Pages 分支部署：`Settings → Pages → Source: Deploy from a branch → main / (root)`。推送到 `main` 分支后网站自动更新：

```bash
git add -A && git commit -m "update homepage" && git push origin main
```

## 本地预览 / Preview Locally

```bash
python -m http.server 8080     # 然后访问 http://localhost:8080
```
