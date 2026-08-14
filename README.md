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
├── .github/
│   └── workflows/
│       └── pages.yml     # GitHub Actions 自动部署
└── assets/
    ├── css/style.css     # 样式（深色科技风）
    ├── js/main.js        # 交互（导航 / 滚动显现 / 论文筛选）
    └── img/author_photo.jpg
```

## 部署方法 / How to Deploy

1. 新建仓库 **`lixyxd.github.io`**（Public，仓库名必须与用户名一致 / repo name must match your username）；
2. 将本目录所有文件推送到仓库 `main` 分支；
3. 打开仓库 **Settings → Pages**，在 "Build and deployment" 中选择 **Source: GitHub Actions**（本仓库已自带 `pages.yml` 工作流，推送后会自动构建并部署）；
4. 等待几分钟，访问 **https://lixyxd.github.io**。

> 如果推送后工作流没有运行，请到仓库 **Actions** 标签页手动触发 "Deploy to GitHub Pages"。

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
