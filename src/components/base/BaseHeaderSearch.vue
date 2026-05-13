<template>
  <div class="header_search" :class="[`header_search--${variant}`]" v-click-outside="closeDropdown" >
    <div class="header_search--icon">
      <div class="icon_glass_search"></div>
    </div>
    <input type="text" class="header_search--input" :placeholder="placeholder" v-model="keyword" />
    <!-- Dropdown hiện kết quả -->
    <div class="header_search--dropdown" v-if="isOpen && results && results.length > 0">
      <div 
        v-for="(item, index) in results" 
        :key="index"
        class="header_search--item"
        @click="selectItem(item)"
      >
        <!-- Slot để cha tuỳ chỉnh cách render từng item -->
        <div class="dropdown_item">
          <slot name="search-item" :item="item">
          {{ item.label ?? item }}
        </slot>
        </div>
      </div>
    </div>
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
  },
  results: { type: Array, default: () => [] },  // cha truyền kết quả vào
  debounce: { type: Number, default: 300 },
  labelKey: { type: String, default: '' },
})
const emit = defineEmits(['search', 'selectSearchItem'])
const keyword = ref('')
const isOpen = ref(false)
let timeout = null
// Biến state selectedLabel
const selectedLabel = ref('')
//Hàm xử lý khi chọn 1 item
const selectItem = (item) => {
  emit('selectSearchItem', item)
   keyword.value = typeof item === 'object' ? (item[props.labelKey] ?? '') : ''
   selectedLabel.value = keyword.value
  isOpen.value = false
}

// Debounce để giảm số lần gọi API
watch(keyword, (val) => {
  if(val === selectedLabel.value){
      isOpen.value = false
      return
  }
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    emit('search', val)
    if (val) isOpen.value = true
  }, props.debounce)
})
const closeDropdown = () => {
  isOpen.value = false
}
// Directive click outside
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => { 
      if (!el.contains(e.target)) binding.value()  // binding.value phải là function
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}
</script>
<style lang="scss" scoped>
@use '../../assets/variables.scss';
.header_search {
  display: flex;
  position: relative; 
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
  &--dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #dddde4;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
  }

  &--item{
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    &:hover { background-color: #eafbf2; 
      .dropdown_item{
        color: #34B057 !important;
      }}
  }
}
.dropdown_item{
  color: black;
 
}
</style>
