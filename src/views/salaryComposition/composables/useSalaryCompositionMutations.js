import { ref, computed } from 'vue';
import { useToast } from '@/components/base/composables/useToast.js';
import { t } from '@/utils/resourseReader';
import salaryCompositionService from '@/services/salaryCompositionService';
import { buildToggleStatusPayload, isTracking, getBulkDeleteConfirmMessage } from '../utils/salaryCompositionList.helpers.js';
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants';

// Summary: Quản lý các thao tác thêm, sửa, xóa, chuyển trạng thái (đơn và hàng loạt) cho thành phần lương.
// Params: Object chứa selectedRows, tableData, pagingPayload, fetchData, handleClearSelection.
// Return: Object chứa các state modal và hàm xử lý thao tác (handleDelete, handleToggleStatus, openBulkStatusConfirm, vv.)
export function useSalaryCompositionMutations({
  selectedRows,
  tableData,
  pagingPayload,
  fetchData,
  handleClearSelection
}) {
  const { showSuccess, showError } = useToast();

  // --- DELETE (Single) ---
  const isShowDeleteConfirmModal = ref(false);
  const isShowSystemDeleteWarningModal = ref(false);
  const salaryCompositionToDelete = ref(null);
  const isDeleting = ref(false);

  // Summary: Mở modal xác nhận xóa hoặc cảnh báo không thể xóa đối với thành phần hệ thống.
  // Params: row (Object) - Dòng dữ liệu thành phần lương cần xóa.
  // Return: void
  const handleDelete = (row) => {
    if (row.systemCompositionId) {
      isShowSystemDeleteWarningModal.value = true;
      return;
    }
    salaryCompositionToDelete.value = row;
    isShowDeleteConfirmModal.value = true;
  };

  // Summary: Thực hiện gọi API xóa thành phần lương đơn lẻ, sau đó làm mới bảng.
  // Params: None
  // Return: Promise<void>
  const handleConfirmDelete = async () => {
    if (isDeleting.value || !salaryCompositionToDelete.value) return;

    const deleteId =
      salaryCompositionToDelete.value.id ||
      salaryCompositionToDelete.value.salaryCompositionId;

    if (!deleteId) {
      showError(t('message.activities.deleteError'));
      isShowDeleteConfirmModal.value = false;
      return;
    }

    try {
      isDeleting.value = true;
      await salaryCompositionService.delete(deleteId);
      showSuccess(t('message.activities.deleteSuccess'));

      isShowDeleteConfirmModal.value = false;
      salaryCompositionToDelete.value = null;

      if (tableData.value.length === 1 && pagingPayload.pageNumber > 1) {
        pagingPayload.pageNumber -= 1;
      }

      await fetchData();
    } catch (error) {
      showError(error?.message || t('message.activities.deleteError'));
    } finally {
      isDeleting.value = false;
    }
  };

  // --- TOGGLE STATUS (Single) ---
  const isShowStatusConfirmModal = ref(false);
  const salaryCompositionToToggle = ref(null);
  const isUpdatingStatus = ref(false);

  const nextStatus = computed(() => {
    if (!salaryCompositionToToggle.value) return 1;
    return isTracking(salaryCompositionToToggle.value.status) ? 0 : 1;
  });

  const nextStatusText = computed(() =>
    nextStatus.value === 1 ? 'đang theo dõi' : 'ngừng theo dõi'
  );

  const statusConfirmMessage = computed(() => {
    const name = salaryCompositionToToggle.value?.compositionName || '';
    return GLOBAL_CONSTANTS.STATUS_CHANGE_CONFIRM_MESSAGE(name, nextStatusText.value);
  });

  // Summary: Mở modal xác nhận thay đổi trạng thái theo dõi của một thành phần lương.
  // Params: row (Object) - Dòng dữ liệu thành phần lương cần đổi trạng thái.
  // Return: void
  const handleToggleStatus = (row) => {
    salaryCompositionToToggle.value = row;
    isShowStatusConfirmModal.value = true;
  };

  // Summary: Gọi API cập nhật trạng thái theo dõi mới cho thành phần lương đang xét.
  // Params: None
  // Return: Promise<void>
  const handleConfirmToggleStatus = async () => {
    if (isUpdatingStatus.value || !salaryCompositionToToggle.value) return;

    try {
      isUpdatingStatus.value = true;
      const payload = buildToggleStatusPayload(
        salaryCompositionToToggle.value,
        nextStatus.value
      );

      await salaryCompositionService.update(payload);
      showSuccess(t('message.activities.updateSuccess'));

      isShowStatusConfirmModal.value = false;
      salaryCompositionToToggle.value = null;

      await fetchData();
    } catch (error) {
      showError(error?.message || t('message.activities.updateError'));
    } finally {
      isUpdatingStatus.value = false;
    }
  };

  // --- BULK STATUS ---
  const isShowBulkStatusConfirmModal = ref(false);
  const bulkTargetStatus = ref(null);
  const isUpdatingBulkStatus = ref(false);

  const bulkStatusText = computed(() =>
    bulkTargetStatus.value === 1 ? 'đang theo dõi' : 'ngừng theo dõi'
  );

  const bulkStatusConfirmMessage = computed(() =>
    `Bạn có chắc chắn muốn chuyển trạng thái thành phần lương đã chọn sang ${bulkStatusText.value} không?`
  );

  // Summary: Mở modal xác nhận đổi trạng thái cho nhiều thành phần lương đã chọn.
  // Params: status (Number) - Trạng thái đích muốn chuyển sang (VD: 0 hoặc 1).
  // Return: void
  const openBulkStatusConfirm = (status) => {
    if (!selectedRows.value.length) return;
    bulkTargetStatus.value = status;
    isShowBulkStatusConfirmModal.value = true;
  };

  // Summary: Tạo payload dữ liệu để gửi API đổi trạng thái hàng loạt.
  // Params: status (Number) - Trạng thái đích.
  // Return: Array<Object> - Mảng dữ liệu payload có thêm cờ state: 2 (update).
  const buildBulkStatusPayload = (status) =>
    selectedRows.value.map((row) => ({
      ...buildToggleStatusPayload(row, status),
      state: 2
    }));

  // Summary: Gọi API cập nhật trạng thái cho nhiều dòng, reset lựa chọn và làm mới dữ liệu.
  // Params: None
  // Return: Promise<void>
  const handleConfirmBulkStatus = async () => {
    if (
      isUpdatingBulkStatus.value ||
      bulkTargetStatus.value === null ||
      !selectedRows.value.length
    ) {
      return;
    }

    try {
      isUpdatingBulkStatus.value = true;
      await salaryCompositionService.saveData(
        buildBulkStatusPayload(bulkTargetStatus.value)
      );

      showSuccess(t('message.activities.updateSuccess'));

      isShowBulkStatusConfirmModal.value = false;
      bulkTargetStatus.value = null;

      handleClearSelection();
      await fetchData();
    } catch (error) {
      showError(error?.message || t('message.activities.updateError'));
    } finally {
      isUpdatingBulkStatus.value = false;
    }
  };

  // --- BULK DELETE ---
  const isShowBulkDeleteConfirmModal = ref(false);
  const bulkSystemRows = ref([]);
  const bulkDeletableRows = ref([]);
  const isBulkDeleting = ref(false);

  const bulkDeleteConfirmMessage = computed(() => 
    getBulkDeleteConfirmMessage(bulkSystemRows.value, bulkDeletableRows.value)
  );

  // Summary: Phân tách dữ liệu chọn thành loại có thể xóa và loại hệ thống, sau đó mở modal xác nhận xóa hàng loạt.
  // Params: None
  // Return: void
  const openBulkDeleteConfirm = () => {
    if (!selectedRows.value.length) return;

    bulkSystemRows.value = selectedRows.value.filter(
      row => row.systemCompositionId
    );
    bulkDeletableRows.value = selectedRows.value.filter(
      row => !row.systemCompositionId
    );

    isShowBulkDeleteConfirmModal.value = true;
  };

  // Summary: Gọi API xóa hàng loạt các dòng hợp lệ, sau đó reset lựa chọn và load lại bảng.
  // Params: None
  // Return: Promise<void>
  const handleConfirmBulkDelete = async () => {
    if (isBulkDeleting.value || !bulkDeletableRows.value.length) return;

    const deleteIds = bulkDeletableRows.value
      .map(row => row.id || row.salaryCompositionId)
      .filter(Boolean);

    if (!deleteIds.length) return;

    try {
      isBulkDeleting.value = true;
      await salaryCompositionService.deleteMultiple(deleteIds);
      showSuccess(t('message.activities.deleteSuccess'));

      isShowBulkDeleteConfirmModal.value = false;
      bulkSystemRows.value = [];
      bulkDeletableRows.value = [];

      handleClearSelection();
      await fetchData();
    } catch (error) {
      showError(error?.message || t('message.activities.deleteError'));
    } finally {
      isBulkDeleting.value = false;
    }
  };

  return {
    isShowDeleteConfirmModal,
    isShowSystemDeleteWarningModal,
    salaryCompositionToDelete,
    handleDelete,
    handleConfirmDelete,

    isShowStatusConfirmModal,
    statusConfirmMessage,
    handleToggleStatus,
    handleConfirmToggleStatus,

    isShowBulkStatusConfirmModal,
    bulkStatusConfirmMessage,
    openBulkStatusConfirm,
    handleConfirmBulkStatus,

    isShowBulkDeleteConfirmModal,
    bulkDeleteConfirmMessage,
    bulkDeletableRows,
    openBulkDeleteConfirm,
    handleConfirmBulkDelete
  };
}
