# go-far-away 去远方

[![CI and deploy](https://github.com/YunYouJun/go-far-away/actions/workflows/ci.yml/badge.svg)](https://github.com/YunYouJun/go-far-away/actions/workflows/ci.yml)

> Go the farthest place.

[在线体验](https://go-far-away.yyj.moe/) · [GitHub Pages 备用站](https://yunyoujun.github.io/go-far-away/)

定位个人所在地，或通过输入经纬度的方式，计算出世界上距离自己最远的地方。（~~地球不完全是圆的这种细节，就不要在意啦！~~）

## Origin

此前不知在哪看过这样一个说法，从家里定位出自己所在地的经纬度。再将北纬换成难为，将东经换成西经并互补，便会得到地球上的另一个点。而这就是你在这个世界上可以去的最远的地方，也是离家最远的地方。

> 这时，你站在这个点上，朝东西南北迈出的任何一步，都在回家的路上。

## Function

- [x] 定位
  - [x] 自动定位
    - [x] IP 定位
    - [x] 浏览器精准定位
  - [x] 自定义经纬度
  - [x] 自定义地址
    - [x] autocomplete
  - [x] 经纬度与地址双向绑定
- [x] 经纬度分秒与小数转换
- [ ] 地图切换
  - [ ] 百度地图
  - [x] 高德地图
  - [ ] 谷歌地图
- [ ] 去远方
  - [x] 地球上距离自己最远的地方
    - [x] 显示距离
      <!-- - [ ] 显示连线 -->
  - [ ] 指定国家距离自己最远的地方
  - [x] 国内距离自己最远的地方
  - [x] 省内距离自己最远的地方
- [x] 全局消息提示
- [x] PWA 离线应用壳

## Development

需要 Node.js `^20.19.0 || >=22.12.0`。

```bash
npm ci
cp .env.example .env.local
npm run dev
```

在高德开放平台创建 Web 端 JS API Key，将其写入 `.env.local`：

```dotenv
VITE_AMAP_KEY=your_amap_web_key
VITE_AMAP_SECURITY_CODE=your_amap_security_code
```

请为 Key 配置可用域名白名单，避免被第三方滥用并耗尽配额。Key 属于浏览器端公开凭据，不要在仓库中提交实际值。

## Quality

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run verify:dist
```

## Deployment

主站通过 Cloudflare Pages 的 Git 集成发布，配置如下：

- 生产分支：`master`
- 构建命令：`npm run build:cloudflare`
- 输出目录：`dist`
- 自定义域名：`go-far-away.yyj.moe`

Cloudflare Pages 的生产与预览环境均需配置 `VITE_AMAP_KEY` 和 `VITE_AMAP_SECURITY_CODE`。高德 Key 的域名白名单应同时包含 `go-far-away.yyj.moe` 与 `yunyoujun.github.io`。

`master` 分支还会通过 GitHub Actions 发布到 GitHub Pages，作为备用站。首次启用时：

1. 在仓库 `Settings → Pages` 中将 Source 设为 **GitHub Actions**。
2. 在 `Settings → Secrets and variables → Actions` 中添加 `VITE_AMAP_KEY` 和 `VITE_AMAP_SECURITY_CODE`。

需要手动触发 Cloudflare Direct Upload 时，可以运行 `npm run deploy:cloudflare`；日常发布由 Git 集成自动完成。

## Intend

- [ ] the farthest place in the universe
