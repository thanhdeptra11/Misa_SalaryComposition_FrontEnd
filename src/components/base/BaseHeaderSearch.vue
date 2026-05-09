<template>
  <div class="header_search" :class="[`header_search--${variant}`]">
    <div class="header_search--icon">
      <div class="magnifying_glass_icon"></div>
    </div>
    <input type="text" class="header_search--input" :placeholder="placeholder" v-model="keyword" />
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  placeholder: {
    type: String,
    default: 'Tìm kiếm',
  },
  variant: {
    type: String,
    default: 'default', // 'default' | 'table'
  }
})
const emit = defineEmits(['search'])
const keyword = ref('')
let timeout = null
</script>
<style lang="scss" scoped>
.header_search {
  display: flex;
  align-items: center;
  min-width: 300px;
  height: 36px; /* Updated height to match table toolbar */
  background-color: #f2f2f2;
  color: #9ea7b4;
  border-radius: 4px;
  border: 1px solid transparent;
  
  &--table {
    background-color: #ffffff;
    border: 1px solid #dddde4;
    
    &:hover, &:focus-within {
      border-color: #34B057; /* using primary green on hover/focus */
    }
  }

  &--input {
    flex: 1;
    border: none;
    background-color: transparent;
    padding: 0 8px;
    font-size: 14px;
    &:focus {
      outline: none;
    }
    &::placeholder {
      color: #9ca6b5;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &--icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 8px;
  }
}
</style>
