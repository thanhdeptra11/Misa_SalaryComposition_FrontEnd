<template>
  <router-view />
  <BaseToastMessage
    v-model:visible="toastState.visible"
    :message="toastState.message"
    :type="toastState.type"
    :duration="toastState.duration"
    :position="toastState.position"
  />
</template>
<script setup>
import BaseToastMessage from '@/components/base/baseToast/BaseToastMessage.vue';
import { useToast } from '@/components/base/composables/useToast';

const { toastState } = useToast();
</script>
<style lang="scss" scoped></style>
