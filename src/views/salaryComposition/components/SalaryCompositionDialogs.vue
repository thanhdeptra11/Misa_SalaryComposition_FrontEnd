<!-- QUản lý và gom nhóm tất cả các hộp thoại xác nhận của màn Thành phần lương
 Cách hoạt động: Mỗi khi cần hiển thị hộp thoại xác nhận, component cha sẽ cập nhật 
 các props tương ứng (ví dụ: confirm-delete, confirm-status, v.v.) 
 và bật modal bằng cách cập nhật các model như isShowDeleteConfirmModal.
  Khi người dùng xác nhận hành động, 
  component sẽ phát ra sự kiện tương ứng (ví dụ: confirm-delete) 
  để component cha xử lý logic tiếp theo.
-->

<template>
  <BaseConfirmModal
    v-model="showDelete"
    title="Thông báo"
    :message="`Bạn có chắc chắn muốn xóa thành phần lương ${deleteItemName} không?`"
    cancelText="Hủy"
    confirmText="Xóa"
    :showSecondary="false"
    confirmButtonClass="delete-confirm-button"
    width="500px"
    @confirm="$emit('confirm-delete')"
  />

  <BaseConfirmModal
    v-model="showStatus"
    title="Chuyển trạng thái"
    :message="statusMessage"
    cancelText="Hủy bỏ"
    confirmText="Đồng ý"
    :showSecondary="false"
    width="500px"
    @confirm="$emit('confirm-status')"
  />

  <BaseConfirmModal
    v-model="showSystemDelete"
    title="Thông báo"
    message="Đây là thành phần lương mặc định của hệ thống nên không thể xóa. Vui lòng kiểm tra lại."
    confirmText="Đóng"
    @confirm="showSystemDelete = false"
    :showCancel="false"
    :showSecondary="false"
    width="500px"
  />

  <BaseConfirmModal
    v-model="showBulkStatus"
    title="Chuyển trạng thái"
    :message="bulkStatusMessage"
    cancelText="Hủy bỏ"
    confirmText="Đồng ý"
    :showSecondary="false"
    width="500px"
    @confirm="$emit('confirm-bulk-status')"
  />

  <BaseConfirmModal
    v-model="showBulkDelete"
    title="Xóa thành phần lương"
    :message="bulkDeleteMessage"
    cancelText="Hủy"
    confirmText="Xóa"
    :showCancel="hasDeletableRows"
    :showSecondary="false"
    confirmButtonClass="delete-confirm-button"
    width="500px"
    @confirm="$emit('confirm-bulk-delete')"
  />

  <SalaryCompositionSystemPickerModal
    v-model="showSystemPicker"
    @saved="$emit('system-picker-saved')"
  />

  <ColumnSettingModal
    v-model="showColumnSetting"
    parent-id="btnSettingColumn"
    :columns="columns"
    @save="$emit('save-column', $event)"
    @reset="$emit('reset-column')"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseConfirmModal from '@/components/base/baseModal/BaseConfirmModal.vue'
import SalaryCompositionSystemPickerModal from '../SalaryCompositionSystemPickerModal.vue'
import ColumnSettingModal from '@/components/base/baseGridData/ColumnSettingModal.vue'
/*
Xử dụng defineModel thay vief props + emit đôi
props: { isShowDeleteConfirmModal: Boolean }
emit('update:isShowDeleteConfirmModal', false)
ref 2 chiều đọc và ghi trực tiếp vào biến showDelete mà 
không cần phải định nghĩa props và emit riêng biệt
*/
const showDelete = defineModel('isShowDeleteConfirmModal', { type: Boolean, default: false })
const showStatus = defineModel('isShowStatusConfirmModal', { type: Boolean, default: false })
const showSystemDelete = defineModel('isShowSystemDeleteWarningModal', {
  type: Boolean,
  default: false,
})
const showBulkStatus = defineModel('isShowBulkStatusConfirmModal', {
  type: Boolean,
  default: false,
})
const showBulkDelete = defineModel('isShowBulkDeleteConfirmModal', {
  type: Boolean,
  default: false,
})

const showSystemPicker = defineModel('isShowSystemPickerModal', { type: Boolean, default: false })
const showColumnSetting = defineModel('isShowColumnSetting', { type: Boolean, default: false })

defineProps({
  deleteItemName: { type: String, default: '' },
  statusMessage: { type: String, default: '' },
  bulkStatusMessage: { type: String, default: '' },
  bulkDeleteMessage: { type: String, default: '' },
  hasDeletableRows: { type: Boolean, default: true },
  columns: { type: Array, default: () => [] },
})

defineEmits([
  'confirm-delete',
  'confirm-status',
  'confirm-bulk-status',
  'confirm-bulk-delete',
  'system-picker-saved',
  'save-column',
  'reset-column',
])
</script>
