<template>
  <div class="search_box">
    <slot name="aiOption"></slot>
    <div class="search_box__icon" :class="iconClass"></div>
    <input type="text" class="search_box__input" :placeholder="placeholder" v-model="keyword" />
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  iconClass: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Tìm kiếm',
  },
})
const emit = defineEmits(['search'])
const keyword = ref('')
let timeout = null
</script>
<style lang="scss" scoped>
$primary-color: #2680eb;
.search_box {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 303px;
  height: 36px;
  background-color: #ffffff;
  color: #9ea7b4;
  border-radius: 4px;
  border: 1px solid #dddde4 !important;
  &__input {
    flex: 1;
    min-width: 0;
    width: 100%;
    border: none;
    background-color: transparent;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 6px;
    padding-bottom: 6px;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: #9ca6b5;
      font-weight: 500;
    }
  }

  &:hover {
    border-color: $primary-color;
  }
  &:focus {
    border-color: $primary-color;
  }
}
</style>
