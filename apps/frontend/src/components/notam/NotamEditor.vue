<template>
  <div 
    :class="css({
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bg: 'surface.base',
      border: '1px solid token(colors.surface.outline)',
      borderRadius: 'xl',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      position: 'relative' // 确保 overlay 定位正确
    })"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <transition name="fade">
      <div 
        v-if="isDragging" 
        :class="css({
          position: 'absolute', inset: '0', zIndex: '50',
          bg: 'rgba(26, 116, 255, 0.05)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px dashed token(colors.brand.primary)',
          borderRadius: 'xl',
          m: '2'
        })"
      >
        <div :class="css({ textAlign: 'center' })">
          <div :class="css({ fontSize: '48px', mb: '4' })">📂</div>
          <div :class="css({ fontSize: 'lg', fontWeight: 'bold', color: 'brand.primary' })">{{ pref.t('console.dropText') }}</div>
          <div :class="css({ fontSize: 'sm', color: 'surface.textDim' })">{{ pref.t('console.dropSub') }}</div>
        </div>
      </div>
    </transition>

    <div 
      :class="css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end', // 让 Tab 沉底
        bg: 'surface.sunken',
        borderBottom: '1px solid token(colors.surface.outline)',
        h: '44px',
        px: '4',
        pt: '2'
      })"
    >
      <div 
        :class="css({
          display: 'flex',
          height: '100%',
          gap: '8px',
          alignItems: 'flex-end',
          pl: '2'
        })"
      >
        <div 
          :class="css({
            display: 'flex', alignItems: 'center', gap: '2',
            fontSize: '12px', px: '4', py: '2', cursor: 'pointer',
            transition: 'background 0.1s, color 0.1s',
            position: 'relative',
            
            // Active State Styles
            color: 'brand.primary',
            bg: 'surface.base',
            fontWeight: '600',
            zIndex: '10',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
            height: '36px',
            mb: '-1px',
            pb: '2px',
            borderBottom: '1px solid token(colors.surface.base)', // 遮盖底部边框
            
            // 左侧裙边
            _before: {
              content: '\'\'',
              position: 'absolute',
              bottom: '0px',
              left: '-10px',
              width: '10px',
              height: '10px',
              mb: '-2px',
              borderBottom: '1px solid token(colors.surface.base)',
              borderBottomRightRadius: '10px',
              boxShadow: '5px 0 0 0 token(colors.surface.base)',
              zIndex: '1'
            },
            // 右侧裙边
            _after: {
              content: '\'\'',
              position: 'absolute',
              bottom: '0px',
              right: '-10px',
              width: '10px',
              height: '10px',
              mb: '-2px',
              borderBottom: '1px solid token(colors.surface.base)',
              borderBottomLeftRadius: '10px',
              boxShadow: '-5px 0 0 0 token(colors.surface.base)',
              zIndex: '1'
            }
          })"
        >
          {{ pref.t('console.manual') }}
        </div>

        <div 
          :class="css({
            display: 'flex', alignItems: 'center', gap: '2',
            fontSize: '12px', px: '4', py: '2', cursor: 'pointer',
            transition: 'background 0.1s, color 0.1s',
            position: 'relative',
            
            // Inactive Styles
            color: 'surface.textDim',
            bg: 'transparent',
            mb: '4px',
            pb: '0px',
            borderRadius: '8px',
            height: '32px',
            _hover: { 
              bg: 'rgba(0,0,0,0.05)',
              color: 'surface.text' 
            }
          })"
        >
          {{ pref.t('console.live') }} 
          <span 
            :class="css({ 
              fontSize: '9px', 
              bg: 'rgba(26, 116, 255, 0.1)', 
              color: 'brand.primary', 
              px: '1.5', 
              borderRadius: 'sm', 
              fontWeight: 'bold' 
            })"
          >
            {{ pref.t('console.beta') }}
          </span>
        </div>
      </div>
      
      <div :class="css({ display: 'flex', alignItems: 'center', pb: '6px' })">
        <div :class="css({ display: 'flex', alignItems: 'center', gap: '8px' })">
          <button 
            :class="css({
              bg: 'surface.base', color: 'surface.textDim',
              fontSize: '11px', fontWeight: '600',
              px: '3', py: '1',
              borderRadius: 'md',
              border: '1px solid token(colors.surface.outline)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              _hover: { 
                color: 'brand.primary', 
                borderColor: 'brand.primary',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 4px rgba(26, 116, 255, 0.15)'
              }
            })" 
            type="button" 
            @click="$emit(NotamEvents.CLEAR)" 
            title="Clear All"
          >
            {{ pref.t('action.clear') }}
          </button>
          <button 
            :class="css({
              bg: 'surface.base', color: 'surface.textDim',
              fontSize: '11px', fontWeight: '600',
              px: '3', py: '1',
              borderRadius: 'md',
              border: '1px solid token(colors.surface.outline)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              _hover: { 
                color: 'brand.primary', 
                borderColor: 'brand.primary',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 4px rgba(26, 116, 255, 0.15)'
              }
            })" 
            type="button" 
            @click="$emit(NotamEvents.LOAD_EXAMPLE)" 
            title="Load Demo"
          >
            {{ pref.t('action.loadExample') }}
          </button>
        </div>
      </div>
    </div>

    <div :class="css({ flex: '1', display: 'flex', overflow: 'hidden', bg: 'surface.base' })">
      <div 
        :class="css({
          w: '48px',
          bg: 'surface.base',
          color: 'surface.textDim',
          fontSize: '13px',
          fontFamily: 'mono',
          textAlign: 'right',
          pt: '5',
          pr: '3',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '1',
          opacity: 0.6,
          lineHeight: '1.6'
        })"
      >
        <span v-for="n in 18" :key="n">{{ n }}</span>
      </div>
      <textarea
        :class="css({
          flex: '1',
          w: '100%',
          h: '100%',
          bg: 'transparent',
          color: 'surface.text',
          border: 'none',
          resize: 'none',
          p: '5',
          fontFamily: 'mono',
          fontSize: '13px',
          lineHeight: '1.6',
          outline: 'none',
          _placeholder: { color: 'surface.textDim', opacity: 0.5 }
        })"
        :value="modelValue"
        :placeholder="pref.t('console.placeholder')"
        spellcheck="false"
        @input="handleInput"
        @keydown.enter.ctrl.prevent="handleShortcut"
      ></textarea>
    </div>

    <div 
      :class="css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: '4',
        py: '2',
        bg: 'surface.sunken',
        borderTop: '1px solid token(colors.surface.outline)',
      })"
    >
      <div :class="css({ fontSize: '11px', color: 'surface.textDim', display: 'flex', alignItems: 'center', gap: '3' })">
        <span>{{ pref.t('console.ln') }} {{ lineCount }}, {{ pref.t('console.col') }} {{ colCount }}</span>
        <span :class="css({ color: 'surface.outlineStrong' })">|</span>
        <span><b>Ctrl+Enter</b> {{ pref.t('console.runTip') }}</span>
      </div>

      <input
        type="file"
        ref="fileInputRef"
        style="display: none"
        accept=".txt,.json,.pdf,.xml"
        @change="handleFileSelect"
      />

      <div :class="css({ display: 'flex', alignItems: 'center', gap: '3' })">
        <button 
          :class="css({
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'surface.textDim',
            cursor: 'pointer',
            p: '2',
            borderRadius: 'lg',
            border: 'none',
            outline: 'none',
            bg: 'transparent',
            transition: 'all 0.2s',
            _hover: { 
              color: 'brand.primary', 
              bg: 'rgba(0,0,0,0.05)',
              transform: 'scale(1.1)' 
            }
          })" 
          type="button" 
          title="Upload File"
          @click="triggerUpload"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </button>

        <div :class="css({ w: '1px', h: '16px', bg: 'surface.outlineStrong' })"></div>

        <button 
          :class="css({
            bg: 'brand.primary',
            color: 'white',
            px: '5',
            py: '2',
            borderRadius: 'lg',
            fontWeight: '600',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(26, 116, 255, 0.25)',
            _hover: { bg: 'brand.hover', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(26, 116, 255, 0.35)' },
            _active: { transform: 'translateY(0)' },
            _disabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none', transform: 'none' }
          })" 
          type="button" 
          @click="emit(NotamEvents.EXECUTE)" 
          :disabled="!engineReady || !modelValue.trim()"
        >
          {{ pref.t('action.run') }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { css } from "@/styled-system/css";
import { NotamEvents } from "@/constants/events";
import { usePreferenceStore } from "@/stores/preferenceStore";

const pref = usePreferenceStore();

const props = defineProps<{
  modelValue: string;
  engineReady: boolean;
}>();

const emit = defineEmits<{
  (e: typeof NotamEvents.UPDATE_MODEL, value: string): void;
  (e: typeof NotamEvents.EXECUTE): void;
  (e: typeof NotamEvents.CLEAR): void;
  (e: typeof NotamEvents.LOAD_EXAMPLE): void;
  (e: typeof NotamEvents.BATCH_UPLOAD, file: File): void;
}>();

const lineCount = computed(() => (props.modelValue ? props.modelValue.split("\n").length : 1));
const colCount = computed(() => (props.modelValue ? props.modelValue.length : 0));

const handleInput = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;
  emit(NotamEvents.UPDATE_MODEL, value);
};

const handleShortcut = () => {
  if (props.engineReady && props.modelValue.trim()) {
    emit(NotamEvents.EXECUTE);
  }
};

// 拖拽逻辑
const isDragging = ref(false);

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer?.files.length) {
    const file = e.dataTransfer.files[0];
    emit(NotamEvents.BATCH_UPLOAD, file);
  }
};

// 手动上传逻辑
const fileInputRef = ref<HTMLInputElement | null>(null);
const triggerUpload = () => {
  fileInputRef.value?.click();
};
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    emit(NotamEvents.BATCH_UPLOAD, file);
    input.value = "";
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>