<template>
  <div 
    :class="css({
      height: '100%', 
      bg: 'surface.base',
      borderRadius: 'xl',
      border: '1px solid token(colors.surface.outline)',
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden'
    })"
  >
    <div 
      :class="css({
        h: '40px', 
        flexShrink: 0, 
        px: '4', 
        bg: 'surface.sunken', 
        borderBottom: '1px solid token(colors.surface.outline)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      })"
    >
      <div 
        :class="css({ 
          fontSize: '14px', 
          fontWeight: 'bold', 
          color: 'surface.textDim', 
          letterSpacing: '1px' 
        })"
      >
        {{ pref.t('radar.title') }}
      </div>
      <div :class="css({ display: 'flex', alignItems: 'center' })">
         <button 
           v-if="currentGrounding && !isCurrentSaved" 
           :class="css({
             fontSize: '13px', fontWeight: 'bold', 
             color: 'brand.primary', bg: 'rgba(26, 116, 255, 0.1)', 
             px: '2', py: '1', borderRadius: 'md', 
             cursor: 'pointer', transition: 'all 0.2s', 
             _hover: { bg: 'brand.primary', color: 'white' }
           })" 
           @click="saveCurrentTarget"
           title="Monitor this target"
         >
           {{ pref.t('radar.monitor') }}
         </button>
         <div 
           v-else-if="currentGrounding" 
           :class="css({
             fontSize: '13px', fontWeight: 'bold', color: 'brand.primary', 
             display: 'flex', alignItems: 'center', gap: '6px'
           })"
         >
            <span class="pulse-dot"></span> {{ pref.t('radar.tracking') }}
         </div>
      </div>
    </div>

    <div 
      :class="css({ 
        height: '180px', 
        flexShrink: 0, 
        display: 'flex', 
        borderBottom: '1px solid token(colors.surface.outline)' 
      })"
    >
      <div 
        :class="css({ 
          flex: '1', p: '4', 
          display: 'flex', flexDirection: 'column', justifyContent: 'center' 
        })"
      >
        <div v-if="currentGrounding" :class="css({ display: 'flex', flexDirection: 'column', gap: '2' })">
           <div :class="css({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' })">
              <span :class="css({ fontSize: '12px', color: 'surface.textDim', fontWeight: '600' })">{{ pref.t('radar.labels.icao') }}</span>
              <span :class="css({ fontSize: '14px', color: 'brand.primary', fontWeight: 'bold', fontFamily: 'mono' })">{{ currentGrounding.code }}</span>
           </div>
           <div :class="css({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' })">
              <span :class="css({ fontSize: '12px', color: 'surface.textDim', fontWeight: '600' })">{{ pref.t('radar.labels.name') }}</span>
              <span :class="css({ fontSize: '11px', color: 'surface.text', fontWeight: '600' })">{{ currentGrounding.name }}</span>
           </div>
           <div :class="css({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' })">
              <span :class="css({ fontSize: '12px', color: 'surface.textDim', fontWeight: '600' })">{{ pref.t('radar.labels.fir') }}</span>
              <span :class="css({ fontSize: '11px', color: 'surface.textHighlight', fontWeight: '600', fontFamily: 'mono' })">{{ currentGrounding.fir }}</span>
           </div>
           <div :class="css({ mt: '1', bg: 'surface.sunken', p: '1.5', borderRadius: 'md' })">
              <div :class="css({ fontSize: '12px', color: 'surface.textDim', fontWeight: '600' })">{{ pref.t('radar.labels.pos') }}</div>
              <div :class="css({ fontFamily: 'mono', fontSize: '10px', color: 'surface.textDim' })">
                {{ currentGrounding.coordinates[0].toFixed(2) }}, {{ currentGrounding.coordinates[1].toFixed(2) }}
              </div>
           </div>
        </div>
        
        <div 
          v-else 
          :class="css({ textAlign: 'center', color: 'surface.textDim', fontSize: '10px' })"
        >
           <div :class="css({ fontSize: '18px', mb: '1', opacity: 0.5 })">⌖</div>
           <div>{{ pref.t('radar.noTarget') }}</div>
        </div>
      </div>

      <div 
        :class="css({ 
          width: '140px', 
          borderLeft: '1px solid token(colors.surface.outline)', 
          bg: 'surface.sunken', 
          display: 'grid', 
          placeItems: 'center', 
          position: 'relative', 
          overflow: 'hidden' 
        })"
      >
         <div 
           :class="css({ 
             width: '110px', 
             height: '110px', 
             borderRadius: 'full', 
             border: '1px solid token(colors.surface.outlineStrong)', 
             position: 'relative', 
             bg: 'radial-gradient(circle, token(colors.surface.base) 0%, token(colors.surface.sunken) 70%)' 
           })"
         >
            <div :class="css({ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', bg: 'brand.primary', opacity: 0.1 })"></div>
            <div :class="css({ position: 'absolute', left: '50%', top: '0', bottom: '0', width: '1px', bg: 'brand.primary', opacity: 0.1 })"></div>
            
            <div 
              v-for="idx in 2" 
              :key="idx"
              :class="css({
                position: 'absolute',
                top: `${50 - idx * 15}%`,
                left: `${50 - idx * 15}%`,
                width: `${idx * 30}%`,
                height: `${idx * 30}%`,
                borderRadius: 'full',
                border: '1px dashed token(colors.brand.primary)',
                opacity: 0.15
              })"
            ></div>

            <div 
              :class="css({
                position: 'absolute', top: '50%', left: '50%', width: '50%', height: '2px',
                bg: 'linear-gradient(90deg, transparent 0%, token(colors.brand.primary) 100%)',
                transformOrigin: '0 0',
                animation: 'radarSpin 3s linear infinite',
                opacity: 0.6
              })"
            ></div>
            
            <div 
              v-if="currentGrounding" 
              :class="css({
                position: 'absolute', top: '35%', right: '35%',
                width: '6px', height: '6px', borderRadius: 'full',
                bg: 'brand.primary',
                boxShadow: '0 0 8px token(colors.brand.primary)',
                animation: 'blip 1.5s infinite'
              })"
            >
              <div 
                :class="css({
                  position: 'absolute', top: '-12px', left: '8px',
                  fontSize: '8px', fontWeight: 'bold', color: 'brand.primary', fontFamily: 'mono'
                })"
              >
                {{ currentGrounding.code }}
              </div>
            </div>
         </div>
      </div>
    </div>

    <div 
      :class="css({
        bg: 'surface.sunken', px: '4', py: '1',
        borderBottom: '1px solid token(colors.surface.outline)',
        fontSize: '14px', fontWeight: 'bold', color: 'surface.textDim', letterSpacing: '1px'
      })"
    >
       <span>{{ pref.t('radar.watchList') }} ({{ targets.length }})</span>
    </div>

    <div :class="css({ flex: '1', overflowY: 'auto', bg: 'surface.base' })">
       <div 
         v-for="target in targets" 
         :key="target.code"
         :class="css({
           display: 'flex', 
           justifyContent: 'space-between', 
           alignItems: 'center',
           h: '44px',
           pl: '6',
           pr: '3',
           borderBottom: '1px solid token(colors.surface.outline)',
           cursor: 'pointer',
           bg: (target.code === currentGrounding?.code) ? 'rgba(26, 116, 255, 0.04)' : 'transparent',
           borderLeft: (target.code === currentGrounding?.code) ? '3px solid token(colors.brand.primary)' : '3px solid transparent',
           transition: 'all 0.1s',
           _hover: { bg: 'surface.sunken' }
         })"
         @click="store.activateTarget(target.code)"
       >
          <div 
            :class="css({
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              flex: '1',
              minWidth: '0',
              overflow: 'hidden'
            })"
          >
            <span :class="css({ fontSize: '12px', fontWeight: 'bold', color: 'surface.text', fontFamily: 'mono', width: '40px', flexShrink: 0 })">{{ target.code }}</span>
            <span 
              :class="css({
                fontSize: '11px', color: 'surface.textDim', fontWeight: '500',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: '120px'
              })"
            >
              {{ target.name }}
            </span>
            <span 
              :class="css({
                fontSize: '9px', fontWeight: 'bold',
                px: '1.5', py: '0.5', borderRadius: 'sm',
                flexShrink: 0,
                ...getStatusStyles(target.status)
              })"
            >
              {{ target.status.toUpperCase() }}
            </span>
          </div>

          <div :class="css({ display: 'flex', alignItems: 'center', gap: '4', pl: '2' })">
             <span :class="css({ fontSize: '10px', fontFamily: 'mono', color: 'surface.textDim', whiteSpace: 'nowrap' })">{{ target.signalStrength }} dB</span>
             <button 
               :class="css({
                 display: 'flex', alignItems: 'center', justifyItems: 'center',
                 color: 'surface.outlineStrong',
                 cursor: 'pointer',
                 p: '1.5',
                 borderRadius: 'md',
                 border: 'none',
                 bg: 'transparent',
                 transition: 'all 0.2s',
                 _hover: { color: 'red.500', bg: 'rgba(239, 68, 68, 0.1)' }
               })" 
               @click.stop="store.removeTarget(target.code)"
               title="Stop Monitoring"
             >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
             </button>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { css } from "@/styled-system/css";
import { useNotamRunStore } from "@/stores/notamRunStore";
import { usePreferenceStore } from "@/stores/preferenceStore";
const pref = usePreferenceStore();

const store = useNotamRunStore();
const currentGrounding = computed(() => store.currentGrounding);
const targets = computed(() => store.targets);

const isCurrentSaved = computed(() => {
  if (!currentGrounding.value) return false;
  return targets.value.some(t => t.code === currentGrounding.value?.code);
});

const saveCurrentTarget = () => {
  if (currentGrounding.value) {
    store.addTarget(currentGrounding.value.code);
  }
};

// 状态样式辅助函数
const getStatusStyles = (status: string) => {
  if (status === 'warning') {
    return { color: 'orange.500', bg: 'rgba(249, 115, 22, 0.1)' };
  } else if (status === 'locked') {
    return { color: 'brand.primary', bg: 'rgba(26, 116, 255, 0.1)' };
  }
  return { color: 'surface.textDim', bg: 'rgba(0,0,0,0.05)' };
};
</script>

<style scoped>
.pulse-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--colors-brand-primary);
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(26, 116, 255, 0.4);
  animation: pulse 2s infinite;
}

@keyframes radarSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes blip { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.8); opacity: 0.5; } }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
</style>