# lixyxd.github.io

**李小勇 Xiaoyong Li · 个人主页 / Personal Homepage**

西安电子科技大学（杭州研究院）副研究员 · 雷达成像 / 目标识别 / 深度学习
Associate Researcher, Hangzhou Institute of Technology, Xidian University · Radar Imaging / Target Recognition / Deep Learning

访问 / Visit: **https://lixyxd.github.io**

## 站点结构 / Structure

```
.
├── index.html      # 主页（中英双语）
├── 404.html        # 404 页面
├── .nojekyll       # 禁用 Jekyll（纯静态站点）
└── assets/
    ├── css/style.css     # 样式（深色科技风）
    ├── js/main.js        # 交互（导航 / 滚动显现 / 论文筛选）
    └── img/author_photo.jpg
```

## 部署与更新 / Deploy & Update

GitHub Pages 分支部署：`Settings → Pages → Source: Deploy from a branch → main / (root)`。推送到 `main` 分支后网站自动更新：

```bash
git add -A && git commit -m "update homepage" && git push origin main
```

## 本地预览 / Preview Locally

```bash
python -m http.server 8080     # 然后访问 http://localhost:8080
```
