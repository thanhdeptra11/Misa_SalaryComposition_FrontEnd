<template>
  <Teleport to="body">
    <Transition name="popup_fade">
      <div
        v-if="modelValue"
        ref="popupRef"
        class="base_popup_content"
        :style="popupStyle"
        @mousedown.stop
  >
    <div v-if="showHeader" class="base_popup_content__header">
      <span class="base_popup_content__title">{{ title }}</span>
    </div>

    <div
      class="base_popup_content__body"
      :style="{ padding: bodyPadding }"
    >
    <slot />
    </div>

    <div v-if="$slots.footer" class="base_popup_content__footer">
      <slot name="footer" />
    </div>
  </div>
</Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean, // true = mở popup, false = đóng popup
    default: false
  },
  parentId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '420px'
  },
  offset: {
    type: Number, // Khoảng cách (px) giữa popup và element cha
    default: 8
  },
  closeOnOutsideClick: {
    type: Boolean,
    default: true
  },
  showHeader: {
  type: Boolean,
  default: true
},
bodyPadding: {
  type: String,
  default: '24px 0 24px 24px'
}
})

const emit = defineEmits(['update:modelValue', 'close'])

const popupRef = ref(null)
const position = ref({
  top: 0,
  left: 0
})
/**
 * popupStyle
 * Tạo object style để bind vào popup element
 * Reactive: tự cập nhật khi position hoặc props.width thay đổi
 */
const popupStyle = computed(() => ({
  width: props.width,
  top: `${position.value.top}px`,
  left: `${position.value.left}px`
}))
/**
 * getParentElement
 * Lấy element cha dựa vào props.parentId
 */
const getParentElement = () => document.getElementById(props.parentId)
/**
 * updatePosition
 * Tính toán và cập nhật vị trí popup sao cho:
 *   - Mặc định: hiện bên DƯỚI element cha, căn phải với cha
 *   - Nếu bị tràn xuống dưới viewport: tự động lật lên TRÊN
 *   - Nếu bị tràn sang trái/phải: kéo vào trong viewport
 */
const updatePosition = () => {
  const parentElement = getParentElement()
  // Chưa có element hoặc popup chưa render → bỏ qua
  if (!parentElement || !popupRef.value) return
  // Lấy tọa độ + kích thước của element cha so với viewport
  const parentRect = parentElement.getBoundingClientRect()
  const popupWidth = popupRef.value.offsetWidth
  const popupHeight = popupRef.value.offsetHeight
  // Khoảng đệm tối thiểu so với mép viewport (trái/phải/trên/dưới)
  const viewportPadding = 8
 // parentRect.right = cạnh phải cha so với viewport
  // + window.scrollX = chuyển sang tọa độ tuyệt đối (document)
  // - popupWidth = dịch trái để cạnh phải popup khớp cạnh phải cha
  let left = parentRect.right + window.scrollX - popupWidth
  // ── Tính top ──
  // Mặc định: hiện ngay bên dưới cha + offset
  let top = parentRect.bottom + window.scrollY + props.offset

 // Giới hạn left: không được vượt ra ngoài viewport trái/phải
  const minLeft = window.scrollX + viewportPadding                              // Mép trái viewport
  const maxLeft = window.scrollX + window.innerWidth - popupWidth - viewportPadding  // Mép phải viewport
// Khoảng không nhỏ hơn minLeft không lớn hơn maxLeft
  left = Math.min(Math.max(left, minLeft), maxLeft)
// Kiểm tra có bị tràn xuống dưới viewport không (vị trí bottom của popup) > (chiều cao viewport - padding)
  const isOverflowBottom =
    parentRect.bottom + props.offset + popupHeight >
    window.innerHeight - viewportPadding
// (vị trí top của popup nếu lật lên) >= padding trên
  const canPlaceAbove =
    parentRect.top - popupHeight - props.offset >= viewportPadding
// Nếu tràn xuống dưới VÀ có chỗ ở trên → lật popup lên trên cha
  if (isOverflowBottom && canPlaceAbove) {
    top = parentRect.top + window.scrollY - popupHeight - props.offset
  }
// Cập nhật state → popupStyle tự cập nhật → popup di chuyển
  position.value = { top, left }
}

const closePopup = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleClickOutside = (event) => {
  if (!props.closeOnOutsideClick) return

  const parentElement = getParentElement()

  const isClickInsidePopup = popupRef.value?.contains(event.target)
  const isClickOnParent = parentElement?.contains(event.target)

  if (!isClickInsidePopup && !isClickOnParent) {
    closePopup()
  }
}

const bindEvents = () => {
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
  document.addEventListener('mousedown', handleClickOutside)
}

const unbindEvents = () => {
  window.removeEventListener('resize', updatePosition) //Cửa sổ thay đổi kích thước, tính lại ví trí
  window.removeEventListener('scroll', updatePosition, true) // Cuộn trang, tính lại ví trí
  document.removeEventListener('mousedown', handleClickOutside) // Bấm chuột ngoài popup → đóng popup
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
        // Chờ vue render DOM xong
      await nextTick()
    //   Tính vị trí
      updatePosition()
      bindEvents()
    } else {
      unbindEvents()
    }
  }
)

onMounted(async () => {
    // Nếu set sẵn popup đang mở 
  if (props.modelValue) {
    await nextTick()
    updatePosition()
    bindEvents()
  }
})

onBeforeUnmount(() => {
  unbindEvents()
})
</script>

<style scoped>
.base_popup_content {
  position: absolute;
  z-index: 10000;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 16px);
}

.base_popup_content__header {
  display: flex;
  justify-content: space-between;
  margin: 24px 16px 0 24px;
}

.base_popup_content__title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
}

.base_popup_content__close {
  border: none;
  background: transparent;
  color: #555;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.base_popup_content__body {
  flex: 1;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.base_popup_content__footer {
  height: 56px;
  padding: 9px 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #dddde4;
  background-color: #f1f2f5;
  box-sizing: border-box;
  flex-shrink: 0;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.popup_fade-enter-active,
.popup_fade-leave-active {
  transition: opacity 0.2s ease;
}

.popup_fade-enter-from,
.popup_fade-leave-to {
  opacity: 0;
}
</style>