This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 本地预览静态导出（`out/`）

以前若用 `GITHUB_ACTIONS=true npm run build`，生成的 HTML 会引用 `/little-thing/_next/...`，在 `out` 目录直接起静态服务器并打开根路径时，CSS/JS 会 404，页面会白屏或布局错乱。

请改用：

```bash
npm run build:static
cd out && python3 -m http.server 4175
```

浏览器打开 **http://127.0.0.1:4175/**（注意是站点根路径，不要少打斜杠）。

线上 **GitHub Pages**（子路径 `/little-thing/`）仍由 CI 使用 `STATIC_EXPORT` + `BASE_PATH=/little-thing` 构建，与本地命令 `npm run build:pages` 一致。

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
