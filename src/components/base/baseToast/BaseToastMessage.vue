<template>
  <Transition name="toast-fade">
    <div v-if="visible" class="base-toast" :class="`toast-${type}`">
      <div class="toast-icon">
        <span v-if="type === 'success'" class="icon-success">✓</span>
        <span v-if="type === 'error'" class="icon-error">✕</span>
        <span v-if="type === 'warning'" class="icon-warning">!</span>
      </div>
      <div class="toast-message">{{ message }}</div>
      <button class="toast-close" @click="close">&times;</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  message: { type: String, required: true },
  type: { type: String, default: 'success' }, // 'success' | 'error' | 'warning'
  duration: { type: Number, default: 3000 }
})

const emit = defineEmits(['update:visible'])

let timer = null

const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

const close = () => {
  clearTimer()
  emit('update:visible', false)
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    startTimer()
  } else {
    clearTimer()
  }
})

onUnmounted(() => {
  clearTimer()
})
</script>

<style scoped>
.base-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: #fff;
  z-index: 10000;
  min-width: 300px;
}

.toast-success {
  border-left: 4px solid #1fac54;
}

.toast-error {
  border-left: 4px solid #e35656;
}

.toast-warning {
  border-left: 4px solid #f19e38;
}

.toast-icon {
  margin-right: 12px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.toast-success .icon-success { color: #fff; background-color: #1fac54; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 14px; }
.toast-error .icon-error { color: #fff; background-color: #e35656; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 14px; }
.toast-warning .icon-warning { color: #fff; background-color: #f19e38; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 14px; }

.toast-message {
  flex: 1;
  font-size: 14px;
  color: #1f1f1f;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #7a8188;
  cursor: pointer;
  margin-left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  color: #1f1f1f;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
