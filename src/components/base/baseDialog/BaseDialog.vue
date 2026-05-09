<template>
  <div v-if="modelValue" class="base-dialog-overlay" @click.self="handleCancel">
    <div class="base-dialog" :style="{ width: width }">
      <div class="base-dialog-header">
        <h3 class="base-dialog-title">{{ title }}</h3>
        <button class="base-dialog-close" @click="handleCancel">&times;</button>
      </div>
      <div class="base-dialog-body">
        <slot>
          <div class="base-dialog-message">{{ message }}</div>
        </slot>
      </div>
      <div class="base-dialog-footer">
        <slot name="footer">
          <BaseButton variant="secondary" :buttonText="cancelText" @click="handleCancel" />
          <BaseButton variant="primary" :buttonText="confirmText" @click="handleConfirm" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '../baseButton/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Xác nhận' },
  message: { type: String, default: 'Bạn có chắc chắn muốn thực hiện hành động này?' },
  width: { type: String, default: '400px' },
  confirmText: { type: String, default: 'Đồng ý' },
  cancelText: { type: String, default: 'Hủy' }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.base-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.base-dialog {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.base-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.base-dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.base-dialog-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #7a8188;
  cursor: pointer;
  line-height: 1;
}

.base-dialog-close:hover {
  color: #1f1f1f;
}

.base-dialog-body {
  padding: 24px;
  font-size: 14px;
  color: #1f1f1f;
}

.base-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}
</style>
