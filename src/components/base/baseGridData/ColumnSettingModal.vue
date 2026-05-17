<template>
  <ModalBasis
    :model-value="modelValue"
    title="Tùy chỉnh cột"
    width="420px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="column-setting">
      <input
        v-model="keyword"
        class="column-setting__search"
        type="text"
        placeholder="Tìm kiếm"
      />

      <div class="column-setting__list">
        <div
          v-for="column in filteredColumns"
          :key="column.field"
          class="column-setting__item"
          draggable="true"
          @dragstart="handleDragStart(column.field)"
          @dragover.prevent
          @drop="handleDrop(column.field)"
        >
          <label class="column-setting__checkbox">
            <input
              type="checkbox"
              :checked="column.visible !== false"
              :disabled="column.hideable === false"
              @change="toggleColumn(column.field)"
            />
            <span>{{ column.title }}</span>
          </label>

          <span class="column-setting__drag">⋮⋮</span>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton
        variant="primary"
        button-text="Lấy lại mặc định"
        @click="handleReset"
      />
      <BaseButton
        variant="secondary"
        button-text="Lưu"
        @click="handleSave"
      />
    </template>
  </ModalBasis>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ModalBasis from '@/components/base/baseModal/ModalBasis.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'update:modelValue',
  'save',
  'reset'
])

const keyword = ref('')
const draftColumns = ref([])
const draggingField = ref(null)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      draftColumns.value = props.columns.map(column => ({ ...column }))
      keyword.value = ''
    }
  }
)

const filteredColumns = computed(() => {
  const searchText = keyword.value.trim().toLowerCase()

  if (!searchText) return draftColumns.value

  return draftColumns.value.filter(column =>
    column.title.toLowerCase().includes(searchText)
  )
})

const toggleColumn = (field) => {
  const column = draftColumns.value.find(item => item.field === field)

  if (!column || column.hideable === false) return

  column.visible = column.visible === false
}

const handleDragStart = (field) => {
  draggingField.value = field
}

const handleDrop = (targetField) => {
  if (!draggingField.value || draggingField.value === targetField) return

  const fromIndex = draftColumns.value.findIndex(
    item => item.field === draggingField.value
  )
  const toIndex = draftColumns.value.findIndex(
    item => item.field === targetField
  )

  const [movedColumn] = draftColumns.value.splice(fromIndex, 1)
  draftColumns.value.splice(toIndex, 0, movedColumn)

  draggingField.value = null
}

const handleSave = () => {
  emit(
    'save',
    draftColumns.value.map((column, index) => ({
      ...column,
      order: index
    }))
  )
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped lang="scss">
.column-setting {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-setting__search {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dddde4;
  border-radius: 4px;
  outline: none;
}

.column-setting__list {
  max-height: 360px;
  overflow-y: auto;
}

.column-setting__item {
  height: 40px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
}

.column-setting__item:hover {
  background-color: #f4f5f8;
}

.column-setting__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.column-setting__drag {
  cursor: grab;
  color: #757575;
  user-select: none;
}
</style>