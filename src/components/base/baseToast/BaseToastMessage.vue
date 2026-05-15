<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div
        v-if="visible"
        class="base-toast"
        :class="[`toast-${type}`, `toast-${position}`]"
      >
        <div class="toast-message">
          {{ message }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onUnmounted } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success' // success | error | warning
  },
  duration: {
    type: Number,
    default: 3000
  },
  position: {
    type: String,
    default: 'top-center' // top-center | top-right
  }
});

const emit = defineEmits(['update:visible']);

let timer = null;

const close = () => {
  clearTimer();
  emit('update:visible', false);
};

const startTimer = () => {
  clearTimer();

  if (props.duration > 0) {
    timer = setTimeout(close, props.duration);
  }
};

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};
/*
visible = true
  → watch kích hoạt → startTimer()
    → sau 3000ms → close()
      → emit('update:visible', false)
        → App.vue cập nhật → visible = false
          → toast ẩn
*/ 
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      startTimer();
    } else {
      clearTimer();
    }
  }
);

onUnmounted(clearTimer);
</script>
<style scoped lang="scss">
@import '@/assets/variables.scss';
.base-toast {
  position: fixed;
  z-index: 10001;
  display: flex;
  align-items: center;
  min-height: 40px;
  border-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.toast-top-center {
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
}

.toast-top-right {
  top: 24px;
  right: 24px;
}

.toast-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-message {
  min-width: 126px;
  height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #111;
  box-sizing: border-box;
}

.toast-success {
  border: 1px solid $primary-green;
  background-color: $primary-background;
}

.toast-success .toast-icon {
  background-color: #00c853;
}

.toast-error {
  border: 1px solid #f06b6b;
  background-color: #fff0f0;
}

.toast-error .toast-icon {
  background-color: #e53935;
}

.toast-warning {
  border: 1px solid #f3b64d;
  background-color: #fff7e6;
}

.toast-warning .toast-icon {
  background-color: #f5a623;
}

.toast-check {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-radius: 50%;
  position: relative;
  box-sizing: border-box;
}

.toast-check::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}

.toast-top-center.toast-fade-enter-from,
.toast-top-center.toast-fade-leave-to {
  transform: translate(-50%, -8px);
}

.toast-top-right.toast-fade-enter-from,
.toast-top-right.toast-fade-leave-to {
  transform: translateY(-8px);
}
</style>