# 响应式浏览器测试

## 运行

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build -- --webpack
npm run test:e2e
npm run test:e2e:report
```

首次建立或有意更新视觉基线：`npm run test:e2e:update`。
单个组合：`npx playwright test --project=chromium-320x568`。

配置使用独立的生产预览端口 4320，避免开发热更新改变动画状态。可用
`PLAYWRIGHT_BASE_URL` 指定已启动的目标站点，此时不启动本地服务。
Chromium 在 macOS 使用完整 Chromium headless + Metal，避免纯软件渲染拖慢 3D 动画。

## 矩阵

Chromium、Firefox、WebKit，各自覆盖 320×568、375×667、390×844、430×932、
768×1024、1280×800、1440×900，共 21 个项目，每个项目跑新版与旧版两条真实交互流程。

- 新版 `/3d`：横向溢出、首屏场景/按钮/标题/完整文字卡片边界、声音开关、主题选择、
  扭蛋提交、重复扭蛋、类别匹配、3D 飞近与横幅展开、庆祝层边界、点赞反馈、自动关闭复位、浏览器后退。
- 旧版 `/`：横向溢出、类别选择保存、真实 POST 提交、任务展示、完成操作、刷新后偏好保留、路由往返。
- 项目没有账号/文本输入表单或导航栏；测试覆盖现有的类别选择表单和浏览器路由历史，
  不虚构登录、注册等不存在的功能。
- 图示的一屏要求包含机器、动作按钮、标题、小事卡片；主题选择在下方正常文档流中，可滚动访问。
  不以 `overflow:hidden` 隐藏溢出，也不截断任务文本。

## 视觉与失败证据

- `tests/e2e/responsive.spec.ts-snapshots/`：按浏览器、尺寸、操作系统分别保存待机、结果、庆祝、复位 PNG 基线。
- 待机/复位快照遮罩持续闪灯的 canvas，验证稳定的 UI 布局；结果快照保留真实 3D 场景。
- 庆祝快照等待横幅展开完成，保留实际 3D 小鸟和横幅；断言使用 canvas 且没有旧版立绘图片。
  浏览器的减少动态效果设置会取消振翅和悬停，并缩短飞近过程；普通模式仍有完整连续动画。
- 每轮结果另存 `3d-result-actual.png`，不遮罩并保留整页。
- 任务随机数仅在模型加载完成后固定，保证不同运行展示相同文案；旧版 API 用固定响应代替外部模型，
  仍断言实际 POST 的类别。测试不会跳过或快进 3D 动画。
- `test-results/`：失败截图、失败录像与 trace、JSON 结果；`playwright-report/`：HTML 报告。
- 首轮发现的问题及证据另存 `output/responsive-tests/first-run-failures/`，不会被后续运行清理。

视觉基线必须在当前 OS 上审阅；浏览器版本升级或字体变化可能需要重新审阅，不能盲目更新基线。
