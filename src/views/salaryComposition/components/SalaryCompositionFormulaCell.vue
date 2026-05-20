<!-- HIển thị và tô sáng công thức tính lương trong ô của bảng dữ liệu -->
<template>
  <span v-if="isEmpty"> - </span>
  <prism-editor
    v-else
    class="excel-formula-editor"
    :modelValue="value || ''"
    :highlight="highlighter"
    :readonly="true"
  />
</template>

<script setup>
import { computed } from 'vue'
import { highlight } from 'prismjs/components/prism-core'
import Prism from '@/utils/prismExcel.js'
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
})

const isEmpty = computed(() => {
  return props.value === null || props.value === undefined || String(props.value).trim() === ''
})

const highlighter = (code) => {
  if (!code) return ''
  return highlight(code, Prism.languages.excel, 'excel')
}
</script>
