<template>
  <div class="candidate_list">
    <Header class="candidate_list__header" @add-candidate="openAddModal" />
    <div class="candidate_list__content">
      <ToolbarGrid @search="handleSearch" />
      <div class="candidate_list__grid_wrapper">
        <BaseGridData :columns="columns" :data="tableData" class="grid_data_area"
          @editRowTable="handleEdit"
          @deleteRowTable="handleDelete"
        >
          <!-- Slot để custom hiển thị cột candidateName -->
          <template #cell-candidateName="{ value }">
            <div class="avatar_cell">
              <div class="avatar_circle" :style="getAvatarStyle(value)">
                {{ getInitials(value) }}
              </div>
              <span class="user_name" :title="value">{{ value }}</span>
            </div>
          </template>

          <template #cell-candidateDob="{ value }">
            <span>{{ formatDate(value) }}</span>
          </template>
        </BaseGridData>
        <GridDataFooter
          :totalRecords="totalRecords"
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
        />
      </div>
    </div>
    
    <!-- Modal Thêm/Sửa Ứng Viên -->
    <ManipulateCandidateDataModal 
       v-model="showAddModal" 
       :title="modalTitle" 
       :candidateData="selectedCandidateData"
       @closeModal="closeModal"
       @saved="handleSaveSuccess"
    />

    <!-- Dialog Xác Nhận Xóa -->
    <BaseDialog
      v-model="showDeleteDialog"
      title="Xác nhận xóa"
      :message="`Bạn có chắc chắn muốn xóa ứng viên ${candidateToDelete?.candidateName} không?`"
      confirmText="Xóa"
      cancelText="Không"
      @confirm="confirmDelete"
    />

    <!-- Toast Thông Báo -->
    <BaseToastMessage
      v-model:visible="showToast"
      :message="toastMessage"
      :type="toastType"
    />
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import Header from '@/components/candidatesComponents/Header.vue'
import ToolbarGrid from '@/components/candidatesComponents/ToolbarGrid.vue'
import BaseGridData from '@/components/base/baseGridData/GridData.vue'
import GridDataFooter from '@/components/base/baseGridData/GridDataFooter.vue'
import ManipulateCandidateDataModal from '@/components/candidatesComponents/ManipulateCandidateDataModal.vue'
import BaseDialog from '@/components/base/baseDialog/BaseDialog.vue'
import BaseToastMessage from '@/components/base/baseToast/BaseToastMessage.vue'
import candidatesService from '@/services/candidatesService'

const columns = [
  { key: 1, field: 'candidateName', title: 'Họ và tên', width: '245px' },
  { key: 2, field: 'candidateDob', title: 'Ngày sinh', width: '160px' },
  { key: 3, field: 'candidateGender', title: 'Giới tính', width: '100px' },
  { key: 4, field: 'candidateRegion', title: 'Khu vực', width: '150px' },
  { key: 5, field: 'candidatePhoneNumber', title: 'Số điện thoại', width: '150px' },
  { key: 6, field: 'candidateEmail', title: 'Email', width: '200px' },
  { key: 7, field: 'candidateCountryName', title: 'Quốc gia', width: '150px' },
  { key: 8, field: 'candidateProvinceName', title: 'Thành phố', width: '200px' },
  { key: 9, field: 'candidateWardName', title: 'Phường/Xã', width: '200px' },
  { key: 10, field: 'candidateAddressDetail', title: 'Địa chỉ', width: '200px' },
]

const currentPage = ref(1)
const pageSize = ref(25)
const searchKeyword = ref('')
const totalRecords = ref(0)
const tableData = ref([])

// Trạng thái của Modal Thêm/Sửa Ứng viên
const showAddModal = ref(false)
const modalTitle = ref('')
const selectedCandidateData = ref(null)

// Trạng thái cho Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Trạng thái cho Dialog Xóa
const showDeleteDialog = ref(false)
const candidateToDelete = ref(null)

const openAddModal = () => {
  modalTitle.value = 'Thêm ứng viên'
  selectedCandidateData.value = null
  showAddModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  selectedCandidateData.value = null
}

const handleSaveSuccess = () => {
  showToast.value = true
  toastMessage.value = modalTitle.value === 'Thêm ứng viên' ? 'Thêm ứng viên thành công!' : 'Cập nhật ứng viên thành công!'
  toastType.value = 'success'
  fetchCandidates()
}

const handleEdit = async (row) => {
  try {
    const res = await candidatesService.getById(row.candidateId)
    // res có thể bọc trong data hoặc Data tùy thuộc backend, hàm getById baseService trả về response từ axios
    const detailData = res.data || res.Data || res
    
    selectedCandidateData.value = detailData
    modalTitle.value = 'Sửa ứng viên'
    showAddModal.value = true
  } catch (error) {
    console.error('Failed to fetch candidate details:', error)
    showToast.value = true
    toastMessage.value = 'Có lỗi xảy ra khi lấy thông tin ứng viên.'
    toastType.value = 'error'
  }
}

const handleDelete = (row) => {
  candidateToDelete.value = row
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!candidateToDelete.value) return
  
  try {
    await candidatesService.delete(candidateToDelete.value.candidateId)
    showToast.value = true
    toastMessage.value = 'Xóa ứng viên thành công!'
    toastType.value = 'success'
    
    // Nếu xóa bản ghi cuối cùng của trang hiện tại (và không phải trang 1), lùi lại 1 trang
    if (tableData.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    } else {
      fetchCandidates()
    }
  } catch (error) {
    console.error('Failed to delete candidate:', error)
    showToast.value = true
    toastMessage.value = 'Có lỗi xảy ra khi xóa ứng viên.'
    toastType.value = 'error'
  } finally {
    candidateToDelete.value = null
  }
}

const fetchCandidates = async () => {
  const request = {
    pageNumber: currentPage.value,
    pageSize: pageSize.value,
    searchTerm: searchKeyword.value
  }
  try {
    const res = await candidatesService.getPaging(request)
    tableData.value = res.data || res.Data || res.items || res
    totalRecords.value = res.totalRecords || res.TotalRecords || res.totalCount || 0
  } catch (error) {
    console.error('Failed to fetch candidates:', error)
  }
}

const handleSearch = (keyword) => {
  searchKeyword.value = keyword
  currentPage.value = 1
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Logic tạo avatar tạm

const getInitials = (name) => {
  if (!name) return ''
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

const avatarColors = ['#498af2', '#de5bea', '#7966f2', '#1fac54', '#f19e38', '#e35656', '#26c1a8']

const getAvatarStyle = (name) => {
  if (!name) return { backgroundColor: '#ccc' }
  // Dùng mã ASCII của tên để chọn màu ổn định
  let sum = 0
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i)
  }
  const color = avatarColors[sum % avatarColors.length]
  return { backgroundColor: color }
}

watch([currentPage, pageSize, searchKeyword], fetchCandidates, {
  immediate: true,
})
</script>
<style lang="scss" scoped>
.candidate_list {
  padding: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;

  &__content {
    flex: 1; //cho phần content chiếm toàn bộ không gian còn lại
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 24px;
  }

  &__grid_wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    background-color: #fff;
    /* Có thể thêm box-shadow / border radius nếu muốn container grid */
  }

  .grid_data_area {
    flex: 1; /* Để table lăn tự do, phần footer vẫn nằm ngang đáy */
    min-height: 0;
  }

  .avatar_cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .avatar_circle {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    flex-shrink: 0;
  }
  .user_name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
