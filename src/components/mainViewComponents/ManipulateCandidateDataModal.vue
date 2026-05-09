<template>
  <ModalBasis
    :modelValue="modelValue"
    @update:modelValue="val => $emit('update:modelValue', val)"
    :title="title"
    width="560px"
    maxHeight="90vh"
    overlayBg="rgba(0, 0, 0, 0.45)"
    @close="handleClose"
  >
    <div class="candidate-form-container">
      
      <!-- Vùng upload file -->
      <div class="upload-section">
        <!-- Input file ẩn để kích hoạt bằng JS -->
        <input 
          type="file" 
          ref="fileInput" 
          class="hidden-input" 
          @change="handleFileChange" 
          accept=".doc,.docx,.pdf,.jpg,.jpeg,.png" 
        />
        
        <!-- Trạng thái chưa có file -->
        <div 
          v-if="!selectedFile" 
          class="dropzone" 
          @click="triggerFileInput" 
          @dragover.prevent="isDragging = true" 
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="{ 'dropzone--active': isDragging }"
        >
          <span class="dropzone-title">Kéo thả hoặc bấm vào đây để tải CV lên</span>
          <span class="dropzone-subtitle">Chấp nhận file .doc, .docx, .pdf, .jpg, .jpeg, .png (Dung lượng &lt; hơn 15 Mb)</span>
        </div>
        
        <!-- Đã tải file lên -->
        <div v-else class="uploaded-container">
          <div class="uploaded-info">
            <div class="icon_pdf file-icon"></div>
            <div class="file-details">
              <div class="file-name" :title="selectedFile.name">{{ selectedFile.name }}</div>
              <div class="file-size">{{ formatSize(selectedFile.size) }}</div>
            </div>
          </div>
          
          <BaseButton 
            variant="primary" 
            buttonText="Tải lại CV" 
            @click="triggerFileInput" 
          />
        </div>
      </div>

      <!-- Bố cục form nhập liệu -->
      <div class="form-section">
        <!-- Cột Avatar bên trái -->
        <div class="avatar-col">
          <div class="avatar-circle">Ảnh</div>
        </div>
        
        <div class="fields-col">
          <BaseInput 
            label="Họ và tên" 
            placeholder="Nhập họ và tên" 
            required 
            v-model="candidateName" 
          />

          <div class="form-row">
            <div class="col">
              <BaseDatePicker 
                label="Ngày sinh"
                v-model="candidateDOB"
              />
            </div>
            <div class="col">
              <BaseCombobox 
                label="Giới tính"
                placeholder="Chọn giới tính"
                v-model="candidateGender"
                :options="genderOptions"
              />
            </div>
          </div>
          <BaseInput 
            label="Khu vực" 
            placeholder="Chọn giá trị"  
            v-model="candidateRegion" 
          />
          <div class="form-row">
            <BaseInput 
            label="Số điện thoại" 
            placeholder="Nhập số điện thoại" 
            v-model="candidatePhone" 
          />
          <BaseInput 
            label="Email" 
            placeholder="Nhập Email" 
            v-model="candidateEmail" 
          />
          </div>
          <BaseCombobox 
                label="Quốc gia"
                placeholder="Chọn quốc gia"
                v-model="candidateCountry"
                :options="countryData.options"
                @load-more="loadCountries"
              />
          <BaseCombobox 
                label="Tỉnh/Thành phố"
                placeholder="Chọn tỉnh/thành phố"
                v-model="candidateCity"
                :options="cityData.options"
                :disabled="!candidateCountry"
                @load-more="loadCities"
              />
          <BaseCombobox 
                label="Phường/Xã"
                placeholder="Chọn phường/xã"
                v-model="candidateWard"
                :options="wardData.options"
                :disabled="!candidateCity"
                @load-more="loadWards"
              />
          <BaseInput 
            label="Địa chỉ" 
            placeholder="Nhập địa chỉ" 
            v-model="candidateAddressDetail" 
          />
        </div>
        
      </div>

    </div>

    <!-- Phần Footer -->
    <template #footer>
      <BaseButton variant="primary" buttonText="Hủy" @click="handleClose" />
      <BaseButton variant="secondary" buttonText="Lưu" @click="save" />
    </template>
  </ModalBasis>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import ModalBasis from '@/components/base/baseModal/ModalBasis.vue'
import candidatesService from '@/services/candidatesService'
import regionService from '@/services/regionService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Thêm ứng viên' },
  candidateData: { type: Object, default: () => null }
})

const emit = defineEmits(['update:modelValue', 'closeModal', 'saved'])

const candidateId = ref(null)
const candidateName = ref('')
const candidateDOB = ref('') // Store chuỗi string trả về từ DatePicker
const candidateGender = ref('')
const candidateRegion = ref('')
const candidateCountry = ref('')
const candidateCity = ref('')
const candidateWard = ref('')
const candidateAddressDetail = ref('')
const candidatePhone = ref('')
const candidateEmail = ref('')


const genderOptions = [
  { label: 'Nam', value: 'Nam' },
  { label: 'Nữ', value: 'Nữ' },
  { label: 'Khác', value: 'Khác' }
]

const countryData = reactive({ options: [], page: 1, hasMore: true, isLoading: false })
const cityData = reactive({ options: [], page: 1, hasMore: true, isLoading: false })
const wardData = reactive({ options: [], page: 1, hasMore: true, isLoading: false })

const loadCountries = () => fetchRegions(null, countryData)
const loadCities = () => fetchRegions(candidateCountry.value, cityData)
const loadWards = () => fetchRegions(candidateCity.value, wardData)

onMounted(() => {
  loadCountries()
})

const formatDobForFrontend = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

let isBinding = false;

watch(() => props.candidateData, async (newVal) => {
  if (newVal) {
    isBinding = true;
    candidateId.value = newVal.candidateId || null
    candidateName.value = newVal.candidateName || ''
    candidateDOB.value = formatDobForFrontend(newVal.candidateDob)
    candidateGender.value = newVal.candidateGender || ''
    candidateRegion.value = newVal.candidateRegion || ''
    candidateAddressDetail.value = newVal.candidateAddressDetail || ''
    candidatePhone.value = newVal.candidatePhoneNumber || ''
    candidateEmail.value = newVal.candidateEmail || ''
    
    candidateCountry.value = newVal.candidateCountry || ''
    
    if (newVal.candidateCountry) {
      Object.assign(cityData, { options: [], page: 1, hasMore: true, isLoading: false })
      await loadCities()
      candidateCity.value = newVal.candidateProvince || ''
      
      if (newVal.candidateProvince) {
        Object.assign(wardData, { options: [], page: 1, hasMore: true, isLoading: false })
        await loadWards()
        candidateWard.value = newVal.candidateWard || ''
      }
    }
    
    setTimeout(() => {
      isBinding = false;
    }, 100); // Đợi watcher chạy xong mới tắt cờ
  } else {
    // Reset form for create
    candidateId.value = null
    candidateName.value = ''
    candidateDOB.value = ''
    candidateGender.value = ''
    candidateRegion.value = ''
    candidateCountry.value = ''
    candidateCity.value = ''
    candidateWard.value = ''
    candidateAddressDetail.value = ''
    candidatePhone.value = ''
    candidateEmail.value = ''
  }
}, { immediate: true })

const fetchRegions = async (parentId, dataState) => {
  if (!dataState.hasMore || dataState.isLoading) return
  dataState.isLoading = true

  try {
    const filters = []
    if (parentId) {
      filters.push({ property: 'ParentId', operator: '=', value: parentId })
    } else {
      filters.push({ property: 'RegionLevel', operator: '=', value: 1 })
    }
    const res = await regionService.getPaging({
      pageNumber: dataState.page,
      pageSize: 20,
      searchTerm: '',
      filters
    })
    const items = res.data || res.Data || res.items || res || []
    const newOptions = items.map(x => ({ label: x.regionName || x.name || x.label, value: x.id || x.value }))
    
    dataState.options.push(...newOptions)

    if (newOptions.length < 20) {
      dataState.hasMore = false
    } else {
      dataState.page++
    }
  } catch (error) {
    console.error('Failed to fetch regions:', error)
  } finally {
    dataState.isLoading = false
  }
}

// Logic load Tỉnh thao Quốc gia
watch(candidateCountry, async (newVal) => {
  if (isBinding) return;
  
  candidateCity.value = ''
  candidateWard.value = ''
  Object.assign(cityData, { options: [], page: 1, hasMore: true, isLoading: false })
  Object.assign(wardData, { options: [], page: 1, hasMore: true, isLoading: false })
  
  if (newVal) {
    await loadCities()
  }
})

// Logic load Xã theo Tỉnh
watch(candidateCity, async (newVal) => {
  if (isBinding) return;
  
  candidateWard.value = ''
  Object.assign(wardData, { options: [], page: 1, hasMore: true, isLoading: false })
  
  if (newVal) {
    await loadWards()
  }
})

// Quản lý trạng thái File Upload
const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)

const handleClose = () => {
  emit('update:modelValue', false)
  emit('closeModal')
}

const parseDobForBackend = (dobStr) => {
  if (!dobStr) return null;
  const parts = String(dobStr).trim().split('/');
  
  if (parts.length === 3) { // dd/MM/yyyy
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}T00:00:00`;
  } else if (parts.length === 2) { // MM/yyyy
    return `${parts[1]}-${parts[0].padStart(2, '0')}-01T00:00:00`;
  } else if (parts.length === 1 && parts[0].length === 4) { // yyyy
    return `${parts[0]}-01-01T00:00:00`;
  }
  return null;
}

const save = async () => {
  const payload = {
    candidateName: candidateName.value,
    candidateDob: parseDobForBackend(candidateDOB.value),
    candidateGender: candidateGender.value,
    candidatePhoneNumber: candidatePhone.value,
    candidateEmail: candidateEmail.value,
    candidateRegion: candidateRegion.value,
    candidateCountry: candidateCountry.value,
    candidateProvince: candidateCity.value,
    candidateWard: candidateWard.value,
    candidateAddressDetail: candidateAddressDetail.value
  }

  if (candidateId.value) {
    payload.candidateId = candidateId.value;
  }

  try {
    if (candidateId.value) {
      await candidatesService.update(payload)
    } else {
      await candidatesService.create(payload)
    }
    emit('saved')
    handleClose()
  } catch (error) {
    console.error('Failed to save candidate:', error)
  }
}

// Logic định dạng dung lượng file
const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Kích hoạt input file
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// Nhận file từ input
const handleFileChange = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

// Nhận file từ thao tác kéo thả
const handleDrop = (event) => {
  isDragging.value = false
  const files = event.dataTransfer.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/variables.scss' as *;

.candidate-form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;
}

// Upload file
.upload-section {
  width: 100%;
  height: 100px;
}
.hidden-input {
  display: none;
}

// Dropzone
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d4d7dc;
  border-radius: 4px;
  background-color: #ffffff;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  height: 100px;
  box-sizing: border-box;
}
.dropzone:hover {
  background-color: #f1f4f8;
  border-color: $primary-blue;
}
.dropzone--active {
  background-color: #e2efff;
  border-color: $primary-blue;
}

.dropzone-title {
  color: $primary-blue;
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 4px;
}
.dropzone-subtitle {
  color: #7a8188;
  font-size: 13px;
}

// Uploaded file
.uploaded-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  background-color: #f8f9fa; 
  height: 100px;
  width: 100%;
  font-size: 11px;
  box-sizing: border-box;
  padding-left: 10px;
  padding-right: 10px;
}

.uploaded-info {
  display: flex;
  align-items: center;
  gap: 16px;
  overflow: hidden; 
}


.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.file-name {
  color: $primary-blue;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 450px;
}
.file-size {
  color: #7a8188;
  font-size: 13px;
}

// Form nhập liệu
.form-section {
  display: flex;
  gap: 14px;
}
.avatar-col {
  width: 80px;
  flex-shrink: 0;
}
.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  margin-top: 10px;
}
.fields-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.form-row {
  display: flex;
  gap: 16px;
  width: 100%;
}
.form-row .col {
  flex: 1;
  min-width: 0;
}
</style>
