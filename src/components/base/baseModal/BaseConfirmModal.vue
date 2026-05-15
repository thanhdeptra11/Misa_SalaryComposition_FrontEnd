<template>
  <ModalBasis
    :model-value="modelValue"
    :title="title"
    :width="width"
    :close-on-overlay-click="false"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="handleCancel"
  >
    <div class="confirm-message">
      {{ message }}
    </div>

    <template #footer>
      <BaseButton
        v-if="showCancel"
        variant="primary"
        :buttonText="cancelText"
        @click="handleCancel"
      />

      <BaseButton
        v-if="showSecondary"
        variant="primary"
        :buttonText="secondaryText"
        @click="handleSecondary"
      />

      <BaseButton
        variant="secondary"
        :buttonText="confirmText"
        @click="handleConfirm"
      />
    </template>
  </ModalBasis>
</template>

<script setup>
import ModalBasis from './ModalBasis.vue';
import BaseButton from '@/components/base/baseButton/BaseButton.vue';

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Thông báo'
  },
  message: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '500px'
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  },
  secondaryText: {
    type: String,
    default: 'Không lưu'
  },
  confirmText: {
    type: String,
    default: 'Lưu'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  showSecondary: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits([
  'update:modelValue',
  'cancel',
  'secondary',
  'confirm'
]);

const closeModal = () => {
  emit('update:modelValue', false);
};

const handleCancel = () => {
  closeModal();
  emit('cancel');
};

const handleSecondary = () => {
  closeModal();
  emit('secondary');
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<style scoped>
.confirm-message {
  font-size: 14px;
  color: #212121;
  line-height: 20px;
}
</style>
