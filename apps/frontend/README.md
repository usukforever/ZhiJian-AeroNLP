# 前端

安装依赖：

```bash
npm install
# 或
bun install
```

说明：`predev` / `prebuild` 会自动生成 Panda CSS（`src/styled-system/`），首次运行不需要手动执行生成命令。

开发 Notam 模块（监听指令建议在单独终端运行）：

```bash
# 监听并生成 src/styled-system/styles.css
npm run panda:css
# 或
bun run panda:css

# 监听并生成 src/styled-system/**.ts
npm run panda:ui
# 或
bun run panda:ui

# 启动开发服务
npm run dev
# 或
bun dev
```

一次性生成（不监听）：

```bash
npm run panda:gen
```

说明：Panda CSS 用于生成 `src/styled-system/`。不要使用 `npx panda ...`（会解析成 npm 上的同名包）。如需临时运行 CLI，请使用脚本或 `npx @pandacss/cli ...`。

notam 的指令输入示例可见于 `.mock/`。
