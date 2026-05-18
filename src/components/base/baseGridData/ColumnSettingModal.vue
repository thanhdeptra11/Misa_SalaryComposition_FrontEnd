<template>
  <BasePopupContent
    :model-value="modelValue"
    :parent-id="parentId"
    title="Tùy chỉnh cột"
    width="420px"
    :offset="offset"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="column_setting">
      <div class="search_container">
        <div class="icon_glass_search"></div>
        <input
        v-model="keyword"
        class="column_setting__search"
        type="text"
        placeholder="Tìm kiếm"
        />
      </div>
      

      <div class="column_setting__list">
        <div
          v-for="column in filteredColumns"
          :key="column.field"
          class="column_setting__item"
          draggable="true"
          @dragstart="handleDragStart(column.field)"
          @dragover.prevent
          @drop="handleDrop(column.field)"
        >
          <label
            class="column_setting__checkbox"
            :class="{ 'column_setting__checkbox--disabled': column.hideable === false }"
          >
            <input
              class="column_setting__checkbox_input"
              type="checkbox"
              :checked="column.visible !== false"
              :disabled="column.hideable === false"
              @change="toggleColumn(column.field)"
            />

            <span
              class="column_setting__checkbox_icon"
              :class="
                column.visible !== false
                  ? 'icon_square_check_primary'
                  : 'icon_square_default'
              "
            ></span>

            <span class="column_setting__checkbox_label">
              {{ column.title }}
            </span>
          </label>

          <span class="column_setting__drag">⋮⋮</span>
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
  </BasePopupContent>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BasePopupContent from '@/components/base/BasePopupContent.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array,
    required: true
  },
  parentId: {
    type: String,
    default: ''
  },
  offset: {
    type: Number,
    default: 8
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
.column_setting {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.search_container{
  position: relative;
  display: flex;
  align-items: center;
  .icon_glass_search{
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    z-index: 1;
  }
}

.column_setting__search {
  height: 36px;
  padding: 0 12px;

  border: 1px solid #dddde4;
  border-radius: 4px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  padding-left: 40px;
}

.column_setting__search:focus {
  border-color: #34b057;
}

.column_setting__list {
  max-height: 360px;
  overflow-y: auto;
}

.column_setting__item {
  height: 40px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  box-sizing: border-box;
}

.column_setting__item:hover {
  background-color: #f4f5f8;
}

.column_setting__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 0;
}

.column_setting__checkbox--disabled {
  cursor: default;
}

.column_setting__checkbox_input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.column_setting__checkbox_icon {
  flex-shrink: 0;
}

.column_setting__checkbox_label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column_setting__drag {
  cursor: grab;
  color: #757575;
  user-select: none;
  flex-shrink: 0;
}
</style>