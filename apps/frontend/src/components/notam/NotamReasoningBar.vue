<template>
  <div 
    :class="css({
      mt: '2',
      borderRadius: 'md',
      overflow: 'hidden',
      bg: 'surface.sunken',
      border: '1px solid transparent',
      transition: 'border-color 0.2s',
      _hover: { borderColor: 'token(colors.surface.outlineStrong)' }
    })"
  >
    <div 
      :class="css({
        display: 'flex',
        alignItems: 'center',
        gap: '2',
        px: '2.5',
        py: '2',
        cursor: 'pointer',
        userSelect: 'none'
      })" 
      @click="toggle"
    >
      <div 
        :class="css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          w: '16px',
          h: '16px',
          flexShrink: 0
        })"
      >
        <div 
          v-if="isThinking" 
          :class="css({
            w: '12px',
            h: '12px',
            borderRadius: '50%',
            border: '2px solid token(colors.brand.primary)',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite'
          })"
        ></div>
        <n-icon
          v-else-if="isDone"
          :class="css({ color: 'status.active' })"
          :component="CheckmarkCircle16Filled"
        />
        <n-icon 
          v-else 
          :class="css({ color: 'surface.textDim' })" 
          :component="Sparkle16Regular" 
        />
      </div>

      <div 
        :class="css({
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          minWidth: '0' // [修复] 允许容器收缩
        })"
      >
        <template v-if="isThinking && lastLog">
          <span 
            :class="css({
              fontSize: '12px',
              fontWeight: 'bold',
              px: '1.5',
              borderRadius: 'sm',
              flexShrink: 0,
              bg: agentColors[lastLog.agent]?.bg,
              color: agentColors[lastLog.agent]?.text
            })"
          >
            {{ lastLog.agent }}
          </span>
          <span 
            :class="css({
              fontSize: '11px',
              color: 'surface.text',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              minWidth: '0' // [修复] 允许文字截断
            })"
          >
            {{ lastLog.content || pref.t('reasoningDrawer.idleThinking') }}
          </span>
        </template>

        <template v-else-if="isDone">
          <span :class="css({ fontSize: '11px', color: 'surface.textDim' })">
            {{ pref.t('reasoningDrawer.finished') }} 
            ({{ model.thoughts.length }} {{ pref.t('reasoningDrawer.ops') }})
          </span>
        </template>

        <template v-else>
          <span 
            :class="css({
              fontSize: '11px',
              color: 'surface.textDim',
              fontStyle: 'italic'
            })"
          >
            {{ pref.t('reasoningDrawer.idle') }}
          </span>
        </template>
      </div>

      <n-icon 
        :size="14" 
        :class="css({
          color: 'surface.textDim',
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          flexShrink: 0 // [修复] 防止图标被挤走
        })"
      >
        <ChevronDown16Regular />
      </n-icon>
    </div>

    <n-collapse-transition :show="isOpen">
      <div 
        :class="css({
          borderTop: '1px solid token(colors.surface.outline)',
          p: '3',
          bg: 'surface.canvas'
        })"
      >
        <div 
          v-for="log in model.thoughts" 
          :key="log.id" 
          :class="css({
            display: 'flex',
            gap: '3',
            mb: '2',
            fontSize: '11px',
            fontFamily: 'mono',
            lineHeight: '1.5'
          })"
        >
          <div 
            :class="css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              minWidth: '70px',
              gap: '1'
            })"
          >
            <span 
              :class="css({
                fontSize: '12px',
                fontWeight: 'bold',
                opacity: 0.9,
                textAlign: 'right',
                color: agentColors[log.agent]?.text
              })"
            >
              {{ log.agent }}
            </span>
            <div 
              :class="css({
                w: '1px',
                flex: 1,
                bg: 'surface.outline',
                my: '0.5'
              })"
            ></div>
          </div>
          <div 
            :class="css({
              flex: 1,
              color: 'surface.text',
              wordBreak: 'break-word'
            })"
          >
            {{ log.content }}
            <span 
              v-if="log.isStreaming" 
              :class="css({ animation: 'blink 1s infinite' })"
            >_</span>
          </div>
        </div>
      </div>
    </n-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { NIcon, NCollapseTransition } from "naive-ui";
import {
  ChevronDown16Regular,
  Sparkle16Regular,
  CheckmarkCircle16Filled,
} from "@vicons/fluent";
import { css } from "@/styled-system/css";
import { type NotamCardModel, type AgentType, NotamStage } from "@/models/NotamCard";
import { usePreferenceStore } from '@/stores/preferenceStore';

const pref = usePreferenceStore();
const props = defineProps<{ model: NotamCardModel }>();
const isOpen = ref(false);
const toggle = () => (isOpen.value = !isOpen.value);

const isThinkingStage: readonly NotamStage[] =  
  [NotamStage.CONNECTING, NotamStage.DISCOVERING, NotamStage.ANALYZING, NotamStage.VALIDATING] as const;

const isThinking = computed(() => 
  isThinkingStage.includes(props.model.stage)
);
const isDone = computed(() => props.model.stage === NotamStage.FINALIZED);
const lastLog = computed(() => {
  const len = props.model.thoughts.length;
  return len > 0 ? props.model.thoughts[len - 1] : null;
});

const agentColors: Record<string, { bg: string, text: string }> = {
  DISCOVERY: { bg: "agents.discovery.bg", text: "agents.discovery.text" },
  ANALYST:   { bg: "agents.analyst.bg",   text: "agents.analyst.text" },
  VALIDATOR: { bg: "agents.validator.bg", text: "agents.validator.text" },
};
</script>