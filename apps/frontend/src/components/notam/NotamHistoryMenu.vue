<template>
  <div 
    v-if="isOpen" 
    :class="css({
      position: 'absolute', 
      top: '30px', 
      right: '0', 
      zIndex: 10
    })" 
    @click.self="$emit('close')"
  >
    <div 
      :class="css({
        width: '280px',
        bg: 'surface.popover', 
        border: '1px solid token(colors.surface.outline)',
        borderRadius: 'lg',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', 
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        animation: 'slideDown 0.2s ease-out'
      })"
    >
      <div 
        :class="css({
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: '3', 
          borderBottom: '1px solid token(colors.surface.outline)',
          bg: 'surface.sunken'
        })"
      >
        <span 
          :class="css({ 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: 'surface.textDim', 
            letterSpacing: '0.05em' 
          })"
        >
          HISTORY TIMELINE
        </span>
        <button 
          :class="css({ 
            bg: 'transparent', 
            border: 'none', 
            color: 'surface.textDim', 
            cursor: 'pointer', 
            fontSize: '16px', 
            lineHeight: 1,
            _hover: { color: 'surface.text' }
          })" 
          @click="$emit('close')"
        >
          ×
        </button>
      </div>

      <div 
        v-if="history.length === 0" 
        :class="css({ 
          p: '4', 
          textAlign: 'center', 
          fontSize: '11px', 
          color: 'surface.textDim', 
          fontStyle: 'italic' 
        })"
      >
        No history versions available.
      </div>

      <div 
        v-else 
        :class="css({ 
          p: '0', 
          maxHeight: '300px', 
          overflowY: 'auto' 
        })"
      >
        <div 
          v-for="(item, index) in history" 
          :key="item.timestamp" 
          :class="css({
            display: 'flex', 
            gap: '3', 
            px: '3', 
            py: '0', 
            cursor: 'pointer',
            transition: 'background 0.2s',
            _hover: { bg: 'surface.sunken' }
          })"
          @click="$emit('restore', item)"
        >
          <div 
            :class="css({ 
              position: 'relative', 
              width: '12px', 
              flexShrink: 0 
            })"
          >
            <div 
              :class="css({ 
                position: 'absolute',
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '1px', 
                bg: 'surface.outline'
              })" 
              :style="{
                top: index === 0 ? '16px' : '0',  // 首节点：从圆点中心开始
                bottom: index === history.length - 1 ? 'auto' : '0', // 尾节点：到底部
                height: index === history.length - 1 ? '16px' : 'auto' // 尾节点：只到圆点
              }"
            ></div>
            <div 
              :class="css({ 
                position: 'relative',
                zIndex: 1,
                w: '6px', h: '6px', 
                borderRadius: 'full', 
                bg: 'surface.outlineStrong',
                mx: 'auto',
                mt: '16px' 
              })"
            ></div>
          </div>

          <div 
            :class="css({ 
              flex: 1, 
              overflow: 'hidden',
              py: '3', 
              borderBottom: '1px solid rgba(0,0,0,0.03)' 
            })"
          >
             <div 
               :class="css({ 
                 display: 'flex', 
                 justifyContent: 'space-between', 
                 alignItems: 'center', 
                 mb: '1' 
               })"
             >
                <span 
                  :class="css({ 
                    fontSize: '10px', 
                    fontFamily: 'mono', 
                    color: 'surface.textDim' 
                  })"
                >
                  {{ formatTime(item.timestamp) }}
                </span>
                <span 
                  :class="css({ 
                    fontSize: '9px', 
                    fontWeight: 'bold', 
                    bg: 'surface.outline', 
                    px: '1.5', 
                    borderRadius: 'sm', 
                    color: 'surface.text' 
                  })"
                >
                  {{ item.data.identifier || 'Unknown' }}
                </span>
             </div>
             <div class="summary">{{ item.data.summary || 'No summary available' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { css } from '@/styled-system/css';
import type { NotamHistoryItem } from '@/models/NotamCard';

defineProps<{
  isOpen: boolean;
  history: NotamHistoryItem[];
}>();

defineEmits(['close', 'restore']);

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleString('en-GB', { 
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false 
  });
};
</script>

<style scoped>
.summary {
  font-size: 11px;
  color: var(--panda-colors-surface-text);
  line-height: 1.4;
  display: -webkit-box;
  overflow: hidden;
  /* Standard property for compatibility/linting */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
</style>