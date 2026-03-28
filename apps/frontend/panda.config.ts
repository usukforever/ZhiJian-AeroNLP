import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // bun panda codegen --watch
  // bun panda cssgen --watch -o src/styled-system/styles.css
  // 扫描文件路径
  include: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  exclude: [],

  // 关键：关闭全局样式重置，避免破坏同事的 CSS
  preflight: false,

  // 样式输出目录
  // 在 @pandacss/dev 1.8.x 里，styles.css 是 panda cssgen 生成的，不是 codegen。
  // bun panda cssgen -o src/styled-system/styles.css

  outdir: "src/styled-system",
  jsxFramework: 'vue',

  staticCss: {
    themes: ["light", "dark"]
  },

  // 主题配置 (复刻之前的深蓝/科技风)
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            primary: { value: "#1a74ff" },
            hover: { value: "#3b87ff" },
            bg: { value: "#0b1020" },
            surface: { value: "rgba(26, 116, 255, 0.12)" },
            text: {
              main: { value: "#0b1220" },
              dim: { value: "#5d6a85" }
            }
          },
          // [新增] 状态语义色，用于卡片状态条、标签等
          status: {
            critical: { value: "#ef4444" }, // Red-500
            warning:  { value: "#f59e0b" }, // Amber-500
            info:     { value: "#3b82f6" }, // Blue-500
            active:   { value: "#22c55e" }, // Green-500
            pending:  { value: "#f97316" }, // Orange-500
            expired:  { value: "#64748b" },  // Slate-500
            perm:     { value: "#7c3aed" }  // [新增] Purple-600
          },
          // [新增] 智能体专属配色 (文字与背景分离，方便组合)
          agents: {
            discovery: {
              text: { value: "#1a74ff" },
              bg:   { value: "rgba(26, 116, 255, 0.1)" }
            },
            analyst: {
              text: { value: "#a855f7" },
              bg:   { value: "rgba(168, 85, 247, 0.1)" }
            },
            validator: {
              text: { value: "#10b981" },
              bg:   { value: "rgba(16, 185, 129, 0.1)" }
            }
          },
          surface: {
            canvas: { value: "#f3f5fb" },
            base: { value: "#ffffff" },
            elevated: { value: "#f7f9ff" },
            sunken: { value: "#eef2f9" },
            // [新增] 悬浮层/菜单专用背景
            popover: { value: "#ffffff" },
            outline: { value: "rgba(15, 23, 42, 0.12)" },
            outlineStrong: { value: "rgba(15, 23, 42, 0.18)" },
            text: { value: "#0b1220" },
            textDim: { value: "#5d6a85" },
            textHighlight: { value: "#f97316" }
          }
        },
        fonts: {
          mono: { value: "'IBM Plex Mono', monospace" },
          sans: { value: "'Space Grotesk', system-ui, sans-serif" }
        }
      },
      semanticTokens: {
        colors: {
          // ... 原有 colors
          
          // [!code ++] [新增] 实体卡片专用配色 (支持浅色/深色模式)
          entity: {
            critical: {
              bg: { value: { base: '#FEF2F2', _dark: 'rgba(239, 68, 68, 0.15)' } },      // Red 50
              border: { value: { base: '#FECACA', _dark: 'rgba(239, 68, 68, 0.3)' } }    // Red 200
            },
            warning: {
              bg: { value: { base: '#FFFBEB', _dark: 'rgba(245, 158, 11, 0.15)' } },     // Amber 50
              border: { value: { base: '#FDE68A', _dark: 'rgba(245, 158, 11, 0.3)' } }   // Amber 200
            },
            info: {
              bg: { value: { base: '#EFF6FF', _dark: 'rgba(59, 130, 246, 0.15)' } },     // Blue 50
              border: { value: { base: '#BFDBFE', _dark: 'rgba(59, 130, 246, 0.3)' } }   // Blue 200
            }
          }
          
        }
      }
    }
  },
  themes: {
    light: {
      tokens: {
      }
    },
    dark: {
      tokens: {
        colors: {
          brand: {
            primary: { value: "#4c8dff" },
            hover: { value: "#70a4ff" },
            bg: { value: "#0b1020" },
            surface: { value: "rgba(255, 255, 255, 0.06)" },
            text: {
              main: { value: "#e7edff" },
              dim: { value: "#9aa9c4" },
            }
          },
          // [新增] 深色模式下的状态色调整（稍微调亮一点以适应黑底）
          status: {
            critical: { value: "#f87171" }, // Red-400
            warning:  { value: "#fbbf24" }, // Amber-400
            info:     { value: "#60a5fa" }, // Blue-400
            active:   { value: "#4ade80" }, // Green-400
            pending:  { value: "#fb923c" }, // Orange-400
            expired:  { value: "#94a3b8" }, // Slate-400
            perm:     { value: "#a78bfa" }  // [新增] Purple-400
          },
          // [新增] 深色模式智能体配色
          agents: {
            discovery: {
              text: { value: "#4c8dff" },
              bg:   { value: "rgba(76, 141, 255, 0.15)" }
            },
            analyst: {
              text: { value: "#c084fc" },
              bg:   { value: "rgba(192, 132, 252, 0.15)" }
            },
            validator: {
              text: { value: "#4ade80" },
              bg:   { value: "rgba(74, 222, 128, 0.15)" }
            }
          },
          surface: {
            canvas: { value: "#0b1020" },
            base: { value: "#111a2b" },
            elevated: { value: "#16213a" },
            sunken: { value: "#0e1627" },
            // [新增] 深色模式下的悬浮层，比 Base 亮，带一点蓝调
            popover: { value: "#1e293b" },
            outline: { value: "rgba(203, 214, 255, 0.14)" },
            outlineStrong: { value: "rgba(203, 214, 255, 0.22)" },
            text: { value: "#e7edff" },
            textDim: { value: "#9aa9c4" }
          }
        }
      }
    }
  }
});
