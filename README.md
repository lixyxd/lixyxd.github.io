# lixyxd.github.io

**李小勇 Xiaoyong Li · 个人主页 / Personal Homepage**

西安电子科技大学杭州研究院准聘副教授 · 雷达成像 / 目标识别 / 深度学习
Tenure-Track Associate Professor, Hangzhou Institute of Technology, Xidian University · Radar Imaging / Target Recognition / Deep Learning

访问 / Visit: **https://lixyxd.github.io**

## 站点结构 / Structure

```
.
├── index.html            # 主页（中英双语）
├── 404.html              # 404 页面
├── .nojekyll             # 禁用 Jekyll（纯静态站点）
└── assets/
    ├── css/style.css     # 样式（深色科技风）
    ├── js/main.js        # 交互（导航 / 滚动显现 / 论文筛选）
    └── img/author_photo.jpg
```

## 部署方式 / How It's Deployed

本站使用 **GitHub Pages 分支部署（Deploy from a branch）**，无需 Actions 工作流：

- 部署源：`main` 分支根目录 `/`
- **每次向 `main` 分支推送更新，网站都会自动重新构建并发布**，几分钟内生效
- 相关设置位于：仓库 **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root)**

> 提示：首次启用时选过主题 `jekyll-theme-cayman`，但仓库内的 `.nojekyll` 文件会禁用 Jekyll 处理，因此实际以纯静态 HTML 呈现，`_config.yml` 不生效（保留无影响）。

## 本地更新步骤 / How to Update

```bash
# 克隆仓库
git clone https://github.com/lixyxd/lixyxd.github.io.git
cd lixyxd.github.io

# 修改 index.html / assets 后提交推送
git add -A
git commit -m "update homepage"
git push origin main     # 推送后网站自动更新
```

不想用命令行的话，也可以直接在 GitHub 网页上编辑 `index.html`（打开文件 → 铅笔图标 → 修改 → Commit changes），同样会自动重新部署。

## 需要你补充的内容 / TODO

- [ ] **Google Scholar 链接**：打开 `index.html`，搜索 `YOUR_SCHOLAR_ID`，替换为你的谷歌学术主页 ID（形如 `?user=xxxxxxxx`）；
- [ ] 如有个人域名，可在 Settings → Pages 中配置 Custom domain（可选）。

## 数据来源 / Data Source

论文列表、被引与下载数据来自 [IEEE Xplore · Author 37089716785](https://ieeexplore.ieee.org/author/37089716785)（抓取于 2026-08）。个人履历综合自 [西电杭州研究院主页](https://hz.xidian.edu.cn/info/1267/9514.htm) 与 [西电教师主页](https://faculty.xidian.edu.cn/LIXIAOYONG/zh_CN/index.htm)。

## 本地预览 / Preview Locally

```bash
# 任选其一
python -m http.server 8080     # 然后访问 http://localhost:8080
npx serve .
```
