<template>
  <div 
    :class="css({
      position: 'relative',
      display: 'flex',
      bg: 'surface.base',
      borderRadius: 'lg',
      border: '1px solid token(colors.surface.outline)',
      overflow: 'hidden', // [修复] 防止内部内容溢出圆角
      transitionProperty: 'box-shadow, transform, border-color', 
      transitionDuration: '0.2s',
      mb: '3',
      maxWidth: '100%', // [修复] 限制最大宽度，防止被撑开
      _hover: {
        boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)',
        transform: 'scale(1.005)',
        borderColor: 'brand.primary',
      }
    })"
  >
    <div 
      :class="severityBar({ severity: notam.data.severity as any })"
    ></div>

    <div 
      :class="css({
        flex: 1,
        p: '3',
        display: 'flex',
        flexDirection: 'column',
        gap: '3',
        minWidth: '0' // [修复] 关键！允许 Flex 子项收缩，防止被长文本撑大父容器
      })"
    >
      
      <div 
        :class="css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start', // [优化] 对齐改为顶部，防止多行 ID 错位
          flexWrap: 'wrap', // [修复] 允许 Header 在极端窄屏下换行
          gap: '2'
        })"
      >
        <div :class="css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap' })">
          <n-icon 
            :size="18" 
            :class="severityIcon({ severity: notam.data.severity as any })"
          >
            <component :is="severityConfig[notam.data.severity]?.icon" />
          </n-icon>
          
          <span 
            :class="css({
              fontFamily: 'mono',
              fontWeight: 'bold',
              fontSize: 'xs',
              bg: 'surface.sunken',
              px: '1.5',
              py: '0.5',
              borderRadius: 'md',
              color: 'surface.text',
              whiteSpace: 'nowrap'
            })"
          >
            {{ notam.airportCode }}
          </span>
          
          <div 
            :class="css({
              fontFamily: 'mono',
              fontSize: 'sm',
              lineHeight: '1',
              display: 'flex',
              alignItems: 'baseline',
              whiteSpace: 'nowrap'
            })"
          >
            <span :class="css({ fontWeight: 'bold', color: 'brand.primary' })">{{ notam.data.identifier?.split('/')[0] || 'Pending' }}</span>
            <span :class="css({ fontSize: 'xs', color: 'surface.textDim' })">/{{ notam.data.identifier?.split('/')[1] || '..' }}</span>
          </div>
        </div>
        
        <div :class="css({ display: 'flex', alignItems: 'center', gap: '2', ml: 'auto' })">
            <div :class="css({ position: 'relative' })"> 
              <button 
                :class="css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'surface.textDim',
                  bg: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  p: '1',
                  borderRadius: 'md',
                  position: 'relative',
                  transition: 'all 0.2s',
                  _hover: { bg: 'surface.sunken', color: 'brand.primary' },
                })" 
                title="History / Versions"
                @click="showHistoryMenu = !showHistoryMenu"
              >
                  <n-icon :size="18" :component="History16Regular" />
                  <span 
                    v-if="notam.history.length > 0" 
                    :class="css({
                      position: 'absolute', top: '-2px', right: '-4px',
                      bg: 'surface.outlineStrong', color: 'surface.text',
                      fontSize: '9px', fontWeight: 'bold', px: '1', borderRadius: 'full',
                      minWidth: '14px', textAlign: 'center'
                    })"
                  >
                    {{ notam.history.length }}
                  </span>
              </button>

              <NotamHistoryMenu 
                :is-open="showHistoryMenu" 
                :history="notam.history"
                @close="showHistoryMenu = false"
                @restore="handleRestore"
              />
            </div>
            
            <div 
              :class="statusBadgeClass(notam.timeStatus, isProcessing)"
            >
               <span 
                 v-if="shouldPulse" 
                 :class="css({
                    width: '6px', height: '6px', borderRadius: 'full',
                    bg: 'status.active',
                    position: 'relative',
                    _before: {
                      content: '\'\'',
                      position: 'absolute', inset: 0, borderRadius: 'full',
                      bg: 'status.active',
                      animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                      opacity: 0.75
                    }
                 })"
               ></span>
               {{ localizedStatus }}
            </div>
        </div>
      </div>

      <div 
        :class="css({
          display: 'flex',
          flexDirection: 'column',
          gap: '2',
          minWidth: '0' // [修复] Body 也需要允许收缩
        })"
      >
        
        <div v-if="notam.data.impacted_entities.length > 0" :class="css({ display: 'flex', flexDirection: 'column', gap: '2' })">
          <div 
            v-for="entity in notam.data.impacted_entities" 
            :key="entity.id" 
            :class="getEntityCardClass(entity.status)"
          >
            <div :class="css({ display: 'flex', alignItems: 'center', gap: '2' })">
              <n-icon :size="16" :class="css({ color: 'surface.textDim', flexShrink: 0 })">
                <component :is="getDomainIcon(entity.domain)" />
              </n-icon>
              <span 
                :class="css({ 
                  fontWeight: 'bold', 
                  fontSize: '13px', 
                  color: 'surface.text',
                  wordBreak: 'break-word' // [修复] 实体名称允许断行
                })"
              >
                {{ entity.designator }}
              </span>
            </div>

            <div :class="css({ display: 'flex', alignItems: 'center', gap: '2', ml: 'auto' })">
              <span 
                :class="cx(
                  css({
                    fontSize: '10px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }),
                  getEntityStatusClass(entity.status)
                )"
              >
                {{ entity.status }}
              </span>
              <span 
                v-if="entity.reason" 
                :class="css({ 
                  fontSize: '10px', color: 'surface.textDim', 
                  maxWidth: '120px', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                })"
              >
                {{ entity.reason }}
              </span>
            </div>
          </div>
        </div>

        <div 
          v-if="notam.data.summary" 
          :class="css({
            p: '2',
            borderRadius: 'md',
            fontSize: '12px',
            lineHeight: '1.5',
            color: 'surface.textDim',
            bg: 'surface.canvas',
            border: '1px dashed token(colors.surface.outline)',
            wordBreak: 'break-word', // [修复] 关键：处理 66666 这种长字符串
            whiteSpace: 'pre-wrap'   // [修复] 保留换行但允许自动换行
          })"
        >
          <div>
            <span :class="css({ fontWeight: 'bold', fontSize: '10px', color: 'brand.primary', mr: '1', opacity: 0.8 })">AI SUMMARY:</span>
            {{ notam.data.summary }}
          </div>
        </div>

        <div 
          v-if="notam.data.validity.from" 
          :class="css({
            display: 'flex', 
            alignItems: 'center', 
            gap: '3',
            flexWrap: 'wrap', // [修复] 允许日期行换行
            p: '1.5', pl: '2', 
            bg: 'surface.canvas',
            borderRadius: 'md',
            border: '1px solid token(colors.surface.outline)',
            fontSize: '11px',
            color: 'surface.textDim'
          })"
        >
            <div :class="css({ display: 'flex', alignItems: 'baseline', gap: '1.5', whiteSpace: 'nowrap' })">
                <span :class="css({ fontSize: '9px', fontWeight: 'bold', color: 'surface.textDim', opacity: 0.8 })">FROM</span>
                <span :class="css({ fontFamily: 'mono', fontWeight: '600', color: 'surface.text' })">{{ formatTime(notam.data.validity.from) }}</span>
            </div>
            
            <span :class="css({ color: 'surface.outlineStrong', fontSize: '9px' })">➜</span>
            
            <div :class="css({ display: 'flex', alignItems: 'baseline', gap: '1.5', whiteSpace: 'nowrap' })">
                <span :class="css({ fontSize: '9px', fontWeight: 'bold', color: 'surface.textDim', opacity: 0.8 })">TO</span>
                <span :class="css({ fontFamily: 'mono', fontWeight: '600', color: 'surface.text' })">
                  {{ notam.data.validity.isPerm ? 'PERM' : formatTime(notam.data.validity.to) }}
                </span>
            </div>
            
            <div 
              v-if="!notam.data.validity.isPerm"
              :class="css({
                ml: 'auto',
                fontSize: '9px', fontWeight: 'bold',
                px: '1.5', py: '0.5', borderRadius: 'sm',
                bg: 'surface.outline', color: 'surface.textDim',
                whiteSpace: 'nowrap'
              })"
            >
                {{ notam.data.validity.duration_text || getDuration(notam.data.validity.from, notam.data.validity.to) }}
            </div>
          </div>
        
        <div v-if="notam.data.tags.length" :class="css({ display: 'flex', flexWrap: 'wrap', gap: '2' })">
          <span 
            v-for="tag in notam.data.tags" 
            :key="tag" 
            :class="css({
              fontSize: '10px',
              color: 'brand.primary',
              bg: 'surface.sunken',
              border: '1px solid token(colors.surface.outline)',
              px: '1.5',
              borderRadius: 'sm'
            })"
          >
            #{{ tag }}
          </span>
        </div>

        <NotamReasoningBar :model="notam" />
        <NotamRawViewer :text="notam.rawText" />

      </div>

      <div 
        :class="css({
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: '1', pt: '2',
          borderTop: '1px dashed token(colors.surface.outline)',
          opacity: 0.9,
          flexWrap: 'wrap', // [修复] Footer 也允许换行
          gap: '2'
        })"
      >
        <div 
          :class="css({ display: 'flex', alignItems: 'center', gap: '1.5', fontSize: '11px', color: 'surface.textDim' })" 
          title="AI Confidence Score"
        >
          <div 
            :class="css({
              w: '4px', h: '4px', borderRadius: 'full',
              bg: (notam.data.confidence > 80) ? 'status.active' : 'status.warning'
            })"
          ></div>
          <span>{{ pref.t('status.confidence') }}: {{ notam.data.confidence || 0 }}%</span>
        </div>

        <div :class="css({ display: 'flex', gap: '2' })">
          <button 
            :class="css({
              fontSize: '11px', bg: 'transparent', 
              border: '1px solid token(colors.surface.outline)',
              color: 'surface.textDim', px: '2', py: '1', borderRadius: 'md', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '1',
              transition: 'all 0.2s',
              _hover: { bg: 'surface.sunken', borderColor: 'brand.primary', color: 'brand.primary' }
            })" 
            title="Locate on Map" 
            @click="handleLocate"
          >
             <n-icon :component="Location16Regular" />
             <span>{{ pref.t('action.locate') }}</span>
          </button>
          <button 
            :class="css({
              fontSize: '11px', bg: 'transparent', 
              border: '1px solid token(colors.surface.outline)',
              color: 'surface.textDim', px: '2', py: '1', borderRadius: 'md', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '1',
              transition: 'all 0.2s',
              _hover: { bg: 'surface.sunken', borderColor: 'brand.primary', color: 'brand.primary' }
            })" 
            title="Human Correction"
          >
             <n-icon :component="Edit16Regular" />
             <span>{{ pref.t('action.fix') }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Script 部分保持不变
import { computed, ref } from "vue";
import { css, cva, cx } from "@/styled-system/css";
import { 
  NotamCardModel, 
  NotamStage, 
  TimeStatus, 
  EntityDomain, 
  EntityStatus,
  type NotamHistoryItem,
  AlertSeverity
} from "@/models/NotamCard";
import { NIcon } from "naive-ui";
import NotamReasoningBar from './NotamReasoningBar.vue';
import NotamRawViewer from './NotamRawViewer.vue';
import NotamHistoryMenu from './NotamHistoryMenu.vue';
import { useNotamRunStore } from '@/stores/notamRunStore';
import { usePreferenceStore } from '@/stores/preferenceStore';
import {
  Warning24Filled,
  ErrorCircle24Filled,
  Info24Regular,
  CheckmarkCircle24Regular,
  Location16Regular,
  Edit16Regular,
  History16Regular,
  Alert16Regular,
  AirplaneTakeOff16Filled,
  Ruler16Filled,
  Globe16Filled,
  VehicleCar16Filled,
  WeatherHaze20Filled,
} from "@vicons/fluent";

const props = defineProps<{
  notam: NotamCardModel;
}>();
const store = useNotamRunStore();
const pref = usePreferenceStore();
const showHistoryMenu = ref(false);

const severityConfig: Record<string, { icon: any }> = {
  [AlertSeverity.CRITICAL]: { icon: ErrorCircle24Filled },
  [AlertSeverity.WARNING]: { icon: Warning24Filled },
  [AlertSeverity.INFO]: { icon: Info24Regular },
  [AlertSeverity.ACTIVE]: { icon: CheckmarkCircle24Regular },
};

const getDomainIcon = (domain: EntityDomain) => {
  switch (domain) {
    case EntityDomain.RUNWAY: return AirplaneTakeOff16Filled;
    case EntityDomain.AIRSPACE: return Globe16Filled;
    case EntityDomain.NAV_AID: return Ruler16Filled;
    case EntityDomain.AG_FACILITY: return VehicleCar16Filled;
    case EntityDomain.OBSTACLE: return WeatherHaze20Filled;
    default: return Alert16Regular;
  }
};

const processingStages: readonly NotamStage[] = [
  NotamStage.CONNECTING,
  NotamStage.DISCOVERING,
  NotamStage.ANALYZING,
  NotamStage.VALIDATING,
];

const isProcessing = computed(() => processingStages.includes(props.notam.stage));

const localizedStatus = computed(() => {
  if (isProcessing.value) {
    return pref.t(`status.stage.${props.notam.stage}`);
  }
  if (props.notam.stage === NotamStage.FAILED) {
    return pref.t('status.stage.failed');
  }
  const ts = props.notam.timeStatus || TimeStatus.UNKNOWN;
  return pref.t(`status.time.${ts}`).toUpperCase();
});

const shouldPulse = computed(() => {
  if (isProcessing.value) return true;
  return props.notam.timeStatus === TimeStatus.ACTIVE;
});

const handleLocate = () => {
  if (props.notam.airportCode && props.notam.airportCode !== 'PENDING') {
    store.updateGrounding(props.notam.airportCode);
  }
};

const handleRestore = (item: NotamHistoryItem) => {
  props.notam.restore(item);
  showHistoryMenu.value = false;
};

const formatTime = (isoStr: string) => {
  if (!isoStr) return '--';
  const d = new Date(isoStr);
  return d.toLocaleString('en-GB', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
};

const getDuration = (from: string, to: string) => {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h`;
};

// --- Style Helpers ---

const severityBar = cva({
  base: {
    width: "4px",
    flexShrink: 0,
    alignSelf: "stretch",
  },
  variants: {
    severity: {
      critical: { bg: "status.critical" },
      warning:  { bg: "status.warning" },
      info:     { bg: "status.info" },
      active:   { bg: "status.active" },
      expired:  { bg: "status.expired" },
    },
  },
  defaultVariants: { severity: "info" },
});

const severityIcon = cva({
  base: {
    flexShrink: 0,
    display: "flex",
  },
  variants: {
    severity: {
      critical: { color: "status.critical" },
      warning:  { color: "status.warning" },
      info:     { color: "status.info" },
      active:   { color: "status.active" },
      expired:  { color: "status.expired" },
    },
  },
  defaultVariants: { severity: "info" },
});

const statusBadge = cva({
  base: {
    fontSize: "9px",
    fontWeight: "bold",
    px: "2",
    py: "0.5",
    borderRadius: "full",
    display: "flex",
    alignItems: "center",
    gap: "3px",
    transition: "all 0.3s",
    whiteSpace: "nowrap",
  },
  variants: {
    mode: {
      processing: { bg: "rgba(26, 116, 255, 0.1)", color: "brand.primary" },
      active: { bg: "rgba(16, 185, 129, 0.1)", color: "status.active" },
      pending: { bg: "rgba(245, 158, 11, 0.1)", color: "status.warning" },
      expired: { bg: "surface.sunken", color: "surface.textDim" },
      perm: { bg: "rgba(124, 58, 237, 0.1)", color: "status.perm" },
      default: { bg: "rgba(26, 116, 255, 0.1)", color: "brand.primary" },
    },
  },
  defaultVariants: {
    mode: "default",
  },
});

const statusBadgeClass = (status: TimeStatus | undefined, processing: boolean) => {
  if (processing) return statusBadge({ mode: "processing" });

  switch (status) {
    case TimeStatus.ACTIVE:
      return statusBadge({ mode: "active" });
    case TimeStatus.PENDING:
      return statusBadge({ mode: "pending" });
    case TimeStatus.EXPIRED:
      return statusBadge({ mode: "expired" });
    case TimeStatus.PERM:
      return statusBadge({ mode: "perm" });
    default:
      return statusBadge({ mode: "default" });
  }
};

const entityCard = cva({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "2",
    p: "2",
    borderRadius: "md",
    border: "1px solid",
  },
  variants: {
    status: {
      critical: { bg: "entity.critical.bg", borderColor: "entity.critical.border" },
      warning: { bg: "entity.warning.bg", borderColor: "entity.warning.border" },
      info:     { bg: "entity.info.bg",     borderColor: "entity.info.border" },
    },
  },
  defaultVariants: {
    status: "info",
  },
});

const getEntityCardClass = (status: EntityStatus) => {
  if (status === EntityStatus.CLOSED || status === EntityStatus.UNSERVICEABLE) {
    return entityCard({ status: "critical" });
  }
  if (status === EntityStatus.RESTRICTED) {
    return entityCard({ status: "warning" });
  }
  return entityCard({ status: "info" });
};


const getEntityStatusClass = (status: EntityStatus) => {
  if (status === EntityStatus.CLOSED || status === EntityStatus.UNSERVICEABLE) {
    return css({ color: "status.critical" });
  }
  if (status === EntityStatus.RESTRICTED) {
    return css({ color: "status.warning" });
  }
  if (status === EntityStatus.ACTIVE) {
    return css({ color: "status.active" });
  }
  return css({ color: "surface.textDim" });
};
</script>
