<template>
  <div 
    :class="css({
      h: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bg: 'surface.canvas', // 使用 Canvas 背景色
      borderLeft: '1px solid token(colors.surface.outline)'
    })"
  >
    <div 
      :class="css({
        h: '40px', 
        px: '4', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid token(colors.surface.outline)', 
        bg: 'surface.base'
      })"
    >
      <h3 
        :class="css({ 
          fontSize: 'xs', 
          fontWeight: 'bold', 
          color: 'surface.textDim', 
          letterSpacing: 'wider' 
        })"
      >
        {{ pref.t('stream.title') }}
      </h3>
      <div 
        v-if="totalActiveCount > 0" 
        :class="css({
          fontSize: '10px', 
          fontWeight: 'bold', 
          px: '2', 
          py: '0.5', 
          borderRadius: 'sm',
          bg: 'status.active', // 确保此处为 active
          color: 'surface.base'
        })"
      >
        {{ pref.t('stream.processing') }} {{ totalActiveCount }} {{ pref.t('stream.tasks') }}
      </div>

      <div 
        v-else-if="showCompleteBadge" 
        :class="css({
          fontSize: '10px', 
          fontWeight: 'bold', 
          px: '2', 
          py: '0.5', 
          borderRadius: 'sm',
          bg: 'status.info',
          color: 'surface.base',
          animation: 'pulse 2s infinite' // 呼吸效果
        })"
      >
        {{ pref.t('stream.complete') }}
      </div>
    </div>

    <div :class="css({ flex: 1, overflowY: 'auto', p: '4' })">
      <div 
        v-if="store.cards.length === 0 && !store.isDecoding" 
        :class="css({
          h: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'surface.textDim', 
          opacity: 0.6
        })"
      >
        <div :class="css({ fontSize: '32px', mb: '2' })">📡</div>
        <p>{{ pref.t('stream.standby') }}</p>
      </div>

      <div :class="css({ display: 'flex', flexDirection: 'column', gap: '0' })">
        <div 
          v-if="store.isDecoding" 
          :key="`skel-decoding`" 
          :class="css({
            bg: 'surface.base',
            borderRadius: 'lg',
            border: '1px dashed token(colors.surface.outline)', // 虚线边框表示 Pending
            p: '3',
            opacity: 0.7,
            animation: 'pulse 1.5s infinite ease-in-out'
          })"
        >
          <div :class="css({ display: 'flex', alignItems: 'center', gap: '2', mb: '3' })">
            <div :class="css({ width: '30px', height: '30px', borderRadius: 'full', bg: 'surface.outlineStrong' })"></div> 
            <div :class="css({ width: '60px', height: '16px', borderRadius: 'md', bg: 'surface.outlineStrong' })"></div> 
            <div :class="css({ width: '80px', height: '12px', borderRadius: 'md', bg: 'surface.outlineStrong' })"></div> 
          </div>
          <div :class="css({ display: 'flex', flexDirection: 'column', gap: '2', mb: '3' })">
            <div :class="css({ width: '100%', height: '12px', borderRadius: 'md', bg: 'surface.outlineStrong' })"></div>
            <div :class="css({ width: '80%', height: '12px', borderRadius: 'md', bg: 'surface.outlineStrong' })"></div>
          </div>
          <div :class="css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })">
            <div :class="css({ width: '40px', height: '10px', borderRadius: 'md', bg: 'surface.outlineStrong' })"></div>
            <div 
              :class="css({
                w: '12px', h: '12px',
                borderRadius: 'full',
                border: '2px solid token(colors.brand.primary)',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite'
              })"
            ></div>
          </div>
        </div>

        <NotamSmartCard 
          v-for="card in store.cards" 
          :key="card.id"
          :notam="card"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'; // [!code ++]
import { css } from '@/styled-system/css';
import { useNotamRunStore } from '@/stores/notamRunStore';
import { usePreferenceStore } from '@/stores/preferenceStore';
import NotamSmartCard from './NotamSmartCard.vue';

const store = useNotamRunStore();
const pref = usePreferenceStore();

// 计算正在处理的总数 (队列中 + 分析中)
const totalActiveCount = computed(() => {
  const analyzing = store.cards.filter(c => c.stage !== 'finalized' && c.stage !== 'failed').length;
  return analyzing + (store.isDecoding ? 1 : 0);
});

// [新增] 监听任务完成状态
const showCompleteBadge = ref(false);

watch(totalActiveCount, (val, oldVal) => {
  // 当任务数从 >0 变为 0 时触发
  if (val === 0 && (oldVal || 0) > 0) {
    showCompleteBadge.value = true;
    setTimeout(() => {
      showCompleteBadge.value = false;
    }, 3000);
  }
});
</script>
