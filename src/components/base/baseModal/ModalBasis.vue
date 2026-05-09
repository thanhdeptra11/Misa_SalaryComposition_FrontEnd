<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="modelValue" 
        class="modal-overlay" 
        :style="{ backgroundColor: overlayBg }" 
        @mousedown="handleOverlayClick"
      >
        <div 
          class="modal-container" 
          :style="{ width: width, maxHeight: maxHeight }" 
          @mousedown.stop
        >
          <div class="modal-header">
            <span class="modal-title">{{ title }}</span>
            <div class="close-btn icon_close" @click="closeModal">
             
            </div>
          </div>
          
          <div class="modal-body">
            <slot name="default"></slot>
          </div>
          <!-- Kiểm tra xem component cha có truyền footer không -->
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '600px' },
  maxHeight: { type: String, default: '90vh' },
  overlayBg: { type: String, default: 'rgba(0, 0, 0, 0.45)' },
  closeOnOverlayClick: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close'])

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    closeModal()
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* Ngăn Modal quá dài so với màn hình */
  flex-shrink: 0;
  
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin: 24px 16px 0 24px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  cursor: pointer;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #111;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding: 24px !important;
}

.modal-footer {
  height: 56px;
  padding: 9px 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #dddde4;
  background-color: #f1f2f5;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

/* Hiệu ứng Transition cho Overlay mờ dần và Modal trượt */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: slide-down 0.3s ease-out;
}
.modal-fade-leave-active .modal-container {
  animation: slide-up 0.3s ease-in forwards;
}

@keyframes slide-down {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes slide-up {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-30px); opacity: 0; }
}
</style>
