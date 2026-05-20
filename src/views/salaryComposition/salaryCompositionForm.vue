<template>
  <!-- Gọi Base layout lắng nghe sự kiện back -->
  <BaseFormLayout
    :pageTitle="
      isEditMode ? props.editingItem?.compositionName || 'Sửa thành phần' : 'Thêm thành phần'
    "
    @back="handleBack"
  >
    <!-- Slot của actions -->
    <template #header-actions>
      <div class="buttons_wrapper">
        <BaseButton variant="primary" buttonText="Hủy bỏ" @click="handleCancelForm" />
        <BaseButton variant="primary" buttonText="Lưu và thêm" />
        <BaseButton @click="handleSave" variant="secondary" buttonText="Lưu" width="80px" />
      </div>
    </template>
    <!-- Nội dung chính có thể cuộn -->
    <div class="salary_composition_inputs">
      <!-- Input nhập tên thành phần -->
      <div class="composition_input">
        <BaseInput
          v-model="compositionName"
          label="Tên thành phần"
          labelWidth="180px"
          inputWidth="676px"
          :required="true"
          :error-message="errors.compositionName"
          @blur="validateField('compositionName')"
          @update:modelValue="handleFieldChange('compositionName')"
        />
      </div>
      <!-- Input nhập Mã thành phần -->
      <div class="composition_input">
        <BaseInput
          v-model="compositionCode"
          label="Mã thành phần"
          placeholder="Nhập mã viết liền"
          labelWidth="180px"
          inputWidth="676px"
          :required="true"
          :error-message="errors.compositionCode"
          :disabled="isEditMode"
          @blur="validateField('compositionCode')"
        />
      </div>
      <!-- Input chọn đơn vị áp dụng -->
      <div class="composition_input">
        <div class="label_container"><b>Đơn vị áp dụng</b></div>
        <BaseHierachyTree
          v-model="compositionOrganization"
          :custom-data-source="unitOptions"
          display-expr="organizationName"
          :dropDownBoxWidth="676"
        />
      </div>
      <!-- Input nhập loại thành phần -->
      <!-- v-model: input đang đọc và ghi dữ liệu vào biến compositionType -->
      <!-- Dùng error thì khai báo khớp với tên các key trong ruleValidate -->
      <div class="composition_input">
        <BaseCombobox
          v-model="compositionType"
          :options="typeOptions"
          label="Loại thành phần"
          placeholder=""
          :required="true"
          labelWidth="180px"
          inputWidth="237px"
          :errorMessage="errors.compositionType"
          @blur="validateField('compositionType')"
          @update:modelValue="handleFieldChange('compositionType')"
        />
      </div>
      <!-- Input chọn tính chất -->
      <div class="composition_input custom_radio_group_property">
        <BaseCombobox
          class="base_cb_box"
          v-model="compositionProperty"
          :options="propertyOptions"
          label="Tính chất"
          placeholder=""
          :required="true"
          labelWidth="180px"
          inputWidth="237px"
          :errorMessage="errors.compositionProperty"
          @blur="validateField('compositionProperty')"
          @update:modelValue="handleFieldChange('compositionProperty')"
        />
        <div v-if="!isOtherProperty" class="tax_applied_control">
          <BaseRadioGroup
            v-if="!isDeductionProperty"
            :options="taxAppliedTypeOptions"
            v-model="internalTaxAppliedType"
          />
          <BaseCheckBox v-else :label="taxDeductionLabel" v-model="isTaxDeductionApplied" />
        </div>
      </div>
      <!-- Input định mức tính chất là khác thì ẩn định mức -->
      <div v-if="!isOtherProperty" class="composition_input">
        <BaseTextArea
          v-model="compositionNorm"
          label="Định mức"
          placeholder="Tự động gợi ý công thức và tham số khi gõ"
          labelWidth="180px"
          inputWidth="676px"
        />
      </div>
      <!-- Input checkbox cho phép giá trị vượt quá định mức-->
      <div class="composition_input">
        <div class="place_holder"></div>
        <BaseCheckBox label="Cho phép giá trị vượt quá định mức" v-model="isValueExceedNorm" />
        <div class="icon_circle_info" id="icon-tooltip"></div>
        <BaseToolTip target="#icon-tooltip" :content="GLOBAL_CONSTANTS.TOOL_TIP_EXCEED_NORM" />
      </div>
      <!-- Input chọn kiểu giá trị -->
      <div class="composition_input">
        <BaseCombobox
          label="Kiểu giá trị"
          :options="valueTypeOptions"
          v-model="internalValueType"
          labelWidth="180px"
          inputWidth="237px"
          :disabled="true"
        />
      </div>
      <!-- Input nhập giá trị -->
      <div class="composition_input custom_radio_group_value">
        <div class="place_holder"><b>Giá trị</b></div>
        <div class="value_options_container">
          <!-- Option 1 cộng tổng -->
          <div class="value_option_item">
            <div class="value_radio_row">
              <BaseRadio
                value="takeSum"
                label="Tự động cộng tổng giá trị của các nhân viên"
                v-model="ValueoptionModel"
              />
              <!-- Combobox kế bên -->
              <BaseCombobox
                class="value_inline_combobox"
                :disabled="ValueoptionModel !== 'takeSum'"
                placeholder="Trong cùng đơn vị công tác"
                inputWidth="240px"
              />
            </div>
            <!-- Cb box hiện ở dưới khi chọn radio -->
            <div class="value_conditional_content" v-if="ValueoptionModel === 'takeSum'">
              <BaseCombobox
                class="value_conditional_combobox"
                :disabled="ValueoptionModel !== 'takeSum'"
                placeholder="Chọn thành phần lương để cộng giá trị"
              />
            </div>
          </div>
          <!-- Option 2: Tính theo công thức tự đặt -->
          <div class="value_option_item">
            <div class="value_radio_row">
              <BaseRadio
                value="formula"
                label="Tính theo công thức tự đặt"
                v-model="ValueoptionModel"
              />
            </div>
            <!-- Nội dung hiển thị khi chọn -->
            <div class="value_conditional_content" v-if="ValueoptionModel === 'formula'">
              <BaseTextArea
                input-id="salary-formula-textarea"
                v-model="customFormula"
                inputWidth="676px"
                @focus="handleFormulaFocus"
                @input="handleFormulaInput"
              />

              <BasePopupContent
                v-model="isShowFormulaSuggestionPopup"
                parent-id="salary-formula-textarea"
                width="674px"
                :show-header="false"
                body-padding="0"
              >
                <BaseTabContent
                  v-model="activeSuggestionTab"
                  :tabs="suggestionTabs"
                  body-max-height="316px"
                >
                  <template #formula>
                    <div class="formula_suggestion_list">
                      <button
                        v-for="item in filteredFormulaSuggestions"
                        :key="item.key"
                        type="button"
                        class="formula_suggestion_item"
                        @mousedown.prevent="handleSelectFormulaSuggestion(item)"
                      >
                        <div class="mi_formula suggestion_icon"></div>

                        <div class="suggestion_content">
                          <div class="suggestion_title">
                            {{ item.name }}
                            <span class="suggestion_code"> ({{ item.syntax }}) </span>
                          </div>

                          <div class="suggestion_description">
                            {{ item.description }}
                          </div>
                        </div>
                      </button>

                      <div v-if="!filteredFormulaSuggestions.length" class="suggestion_empty">
                        Không tìm thấy công thức phù hợp
                      </div>
                    </div>
                  </template>

                  <template #parameter>
                    <div class="formula_suggestion_list">
                      <button
                        v-for="item in filteredParameterSuggestions"
                        :key="item.id"
                        type="button"
                        class="formula_suggestion_item"
                        @mousedown.prevent="handleSelectParameterSuggestion(item)"
                      >
                        <div class="mi_database suggestion_icon"></div>

                        <div class="suggestion_content">
                          <div class="suggestion_title">
                            {{ item.compositionName }}
                            <span class="suggestion_code"> ({{ item.compositionCode }}) </span>
                          </div>

                          <div v-if="item.description" class="suggestion_description">
                            {{ item.description }}
                          </div>
                        </div>
                      </button>

                      <div v-if="!filteredParameterSuggestions.length" class="suggestion_empty">
                        Không tìm thấy tham số phù hợp
                      </div>
                    </div>
                  </template>
                </BaseTabContent>
              </BasePopupContent>
            </div>
          </div>
        </div>
      </div>
      <!-- Input nhập mô tả -->
      <div class="composition_input">
        <BaseTextArea
          v-model="salaryCompositionDescription"
          label="Mô tả"
          labelWidth="180px"
          inputWidth="676px"
        />
      </div>
      <!-- Input chọn hiển thị trên phiếu lương -->
      <div class="composition_input">
        <div class="place_holder"><b>Hiển thị trên phiếu lương</b></div>
        <BaseRadioGroup v-model="displayPayroll" :options="displayPayrollTypeOptions" />
      </div>
      <!-- Input nguồn tạo -->
      <div class="composition_input">
        <BaseTextUnderline
          label="Nguồn tạo"
          labelWidth="180px"
          inputWidth="237px"
          v-model="sourceOfCreation"
        />
      </div>
    </div>
  </BaseFormLayout>
  <BaseConfirmModal
    v-model="isShowCancelConfirmModal"
    title="Thông báo"
    message="Thông tin đã được thay đổi. Bạn có muốn lưu lại không?"
    cancelText="Hủy"
    secondaryText="Không lưu"
    confirmText="Lưu"
    @secondary="handleDiscardChanges"
    @confirm="handleSaveAndBack"
  />
</template>
<script setup>
// ========================
// Vue core
// ========================
import { computed, onMounted, reactive, ref, watch } from 'vue'

// ========================
// Base components
// ========================
import BaseButton from '@/components/base/baseButton/BaseButton.vue'
import BaseFormLayout from '@/components/base/BaseFormLayout.vue'
import BaseInput from '@/components/base/baseInput/BaseInput.vue'
import BaseHierachyTree from '@/components/base/baseInput/BaseHierachyTree.vue'
import BaseCombobox from '@/components/base/baseInput/BaseCombobox.vue'
import BaseRadio from '@/components/base/baseInput/BaseRadio.vue'
import BaseTextArea from '@/components/base/baseInput/BaseTextArea.vue'
import BaseRadioGroup from '@/components/base/baseInput/BaseRadioGroup.vue'
import BaseCheckBox from '@/components/base/baseInput/BaseCheckBox.vue'
import BaseToolTip from '@/components/base/BaseToolTip.vue'
import BaseTextUnderline from '@/components/base/baseInput/BaseTextUnderline.vue'
import BaseConfirmModal from '@/components/base/baseModal/BaseConfirmModal.vue'
import BasePopupContent from '@/components/base/BasePopupContent.vue'
import BaseTabContent from '@/components/base/BaseTabContent.vue'

// ========================
// Services / utils
// ========================
import organizationService from '@/services/organizationService'
import salaryCompositionService from '@/services/salaryCompositionService'
import { EXCEL_FORMULA_SUGGESTIONS } from '@/constants/excelFormulaSuggestions'
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants'
import { cleanPayload } from '@/utils/helper'
import { t } from '@/utils/resourseReader'
import { required } from '@/utils/validator'
import { useToast } from '@/components/base/composables/useToast'
import enumService from '@/services/enumService'
import { ENUM_NAMES, ENUM_DISPLAY_MAPS, getEnumText } from '@/constants/enumDisplayConstants'
// ========================
// Props / emits
// ========================
const props = defineProps({
  // mode = create: thêm mới, mode = edit: sửa bản ghi
  mode: {
    type: String,
    default: 'create',
  },

  // Dữ liệu dòng được chọn từ list khi sửa
  editingItem: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['back', 'saved'])

// ========================
// Composable dùng chung
// ========================
const { showSuccess, showError } = useToast()

// ========================
// Mode state
// ========================
const isEditMode = computed(() => props.mode === 'edit')
const isCloneMode = computed(() => props.mode === 'clone')
// Cờ này dùng để tránh watcher tự sinh mã chạy nhầm lúc đang bind dữ liệu sửa
const isBindingForm = ref(false)

// Cờ xác định mã thành phần đã bị user sửa tay chưa
const isCodeManuallyEdited = ref(false)

// Cờ xác định hệ thống đang tự sinh mã từ tên thành phần
const isAutoGenerating = ref(false)

// ========================
// Options state
// ========================
const unitOptions = ref([])
const typeOptions = ref([])
const propertyOptions = ref([])
const taxAppliedTypes = ref([])
const valueTypeOptions = ref([])
const displayPayrollTypeOptions = ref([])

// ========================
// Form state
// ========================
const salaryCompositionId = ref(null)
const systemCompositionId = ref(null)

const compositionName = ref('')
const compositionCode = ref('')
const compositionOrganization = ref([])
const compositionType = ref(null)
const compositionProperty = ref(null)
const internalTaxAppliedType = ref(null)
const compositionNorm = ref('')
const isValueExceedNorm = ref(false)
const internalValueType = ref(4)
const ValueoptionModel = ref(null)
const salaryCompositionDescription = ref('')
const displayPayroll = ref(null)
const sourceOfCreation = ref('Tự thêm')

const customFormula = ref('')

// ========================
// Validate state
// ========================
const errors = reactive({})

const validationRules = {
  compositionName: [required('fields.salaryComposition.compositionName')],
  compositionCode: [required('fields.salaryComposition.compositionCode')],
  compositionType: [required('fields.salaryComposition.compositionType')],
  compositionProperty: [required('fields.salaryComposition.compositionProperty')],
}

const formValidateValues = {
  compositionName,
  compositionCode,
  compositionType,
  compositionProperty,
}

// ========================
// Confirm modal state
// ========================
const isShowCancelConfirmModal = ref(false)

// ========================
// Form mapping
// ========================
const formFields = {
  salaryCompositionId,
  systemCompositionId,
  compositionOrganization,
  compositionCode,
  compositionName,
  compositionType,
  compositionProperty,
  internalTaxAppliedType,
  compositionNorm,
  internalValueType,
  customFormula,
  salaryCompositionDescription,
  displayPayroll,
  sourceOfCreation,
}

const defaultFormValues = {
  salaryCompositionId: null,
  systemCompositionId: null,
  compositionOrganization: [],
  compositionCode: '',
  compositionName: '',
  compositionType: null,
  compositionProperty: null,
  internalTaxAppliedType: null,
  compositionNorm: '',
  internalValueType: 4,
  customFormula: '',
  salaryCompositionDescription: '',
  displayPayroll: null,
  sourceOfCreation: 'Tự thêm',
}

const editFieldMap = {
  salaryCompositionId: 'id',
  systemCompositionId: 'systemCompositionId',
  compositionCode: 'compositionCode',
  compositionName: 'compositionName',
  compositionType: 'compositionType',
  compositionProperty: 'property',
  internalTaxAppliedType: 'taxableType',
  compositionNorm: 'norm',
  internalValueType: 'valueType',
  customFormula: 'valueExpression',
  salaryCompositionDescription: 'description',
  displayPayroll: 'showOnPayslip',
  sourceOfCreation: 'creationSource',
}

const cloneDefaultValue = (value) => {
  // Clone array để tránh các lần reset dùng chung một reference
  return Array.isArray(value) ? [...value] : value
}

// ========================
// Computed
// ========================
const highestSelectedIds = computed(() => {
  // BaseHierachyTree dùng multiple nên luôn chuẩn hóa về array trước khi filter
  const selectedIds = Array.isArray(compositionOrganization.value)
    ? compositionOrganization.value
    : []

  const selectedSet = new Set(selectedIds)

  const orgMap = new Map(unitOptions.value.map((org) => [org.id, org]))

  // Chỉ lấy các đơn vị cấp cao nhất, bỏ các node con nếu parent đã được chọn
  return selectedIds.filter((id) => {
    const org = orgMap.get(id)

    return org && !selectedSet.has(org.parentId)
  })
})

const isFormDirty = computed(() => {
  // Không tính sourceOfCreation vì field này có default "Tự thêm"
  const valuesNeedCheck = [
    compositionName.value,
    compositionCode.value,
    compositionOrganization.value,
    compositionType.value,
    compositionProperty.value,
    internalTaxAppliedType.value,
    compositionNorm.value,
    ValueoptionModel.value,
    customFormula.value,
    salaryCompositionDescription.value,
    displayPayroll.value,
  ]
  return valuesNeedCheck.some((value) => !isEmptyValue(value))
})

// ========================
// Fetch options
// ========================
const fetchUnitOptions = async () => {
  try {
    const data = await organizationService.getOrganizations()

    if (Array.isArray(data)) {
      unitOptions.value = data
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu phòng ban:', error)
  }
}

const fetchComboboxOptions = () => {
  // Load các enum dùng cho combobox/radio trong form
  enumService.fetchCbBoxOptions('CompositionType', typeOptions)
  enumService.fetchCbBoxOptions('CompositionProperty', propertyOptions)
  enumService.fetchCbBoxOptions('TaxAppliedType', taxAppliedTypes)
  enumService.fetchCbBoxOptions('MiValueType', valueTypeOptions)
  enumService.fetchCbBoxOptions('DisplayPayrollType', displayPayrollTypeOptions)
}

// ========================
// Validate methods
// ========================
const validateField = (fieldName) => {
  const rules = validationRules[fieldName] || []
  const value = formValidateValues[fieldName].value

  for (const rule of rules) {
    const errorMessage = rule(value)

    if (errorMessage) {
      errors[fieldName] = errorMessage
      return false
    }
  }

  errors[fieldName] = ''
  return true
}

const validateForm = () => {
  let isValid = true

  // Dùng forEach để validate hết field, không dừng ở field lỗi đầu tiên
  Object.keys(validationRules).forEach((fieldName) => {
    const fieldValid = validateField(fieldName)

    if (!fieldValid) {
      isValid = false
    }
  })

  return isValid
}

const handleFieldChange = (fieldName) => {
  // Chỉ validate lại khi field đang có lỗi để lỗi mất ngay khi user sửa đúng
  if (errors[fieldName]) {
    validateField(fieldName)
  }
}

// ========================
// Bind / reset form
// ========================
const resetForm = () => {
  // Reset toàn bộ field về default khi mở form thêm mới
  Object.keys(defaultFormValues).forEach((fieldName) => {
    formFields[fieldName].value = cloneDefaultValue(defaultFormValues[fieldName])
  })

  // Reset trạng thái sinh mã
  isCodeManuallyEdited.value = false
}

const bindFormData = (item) => {
  isBindingForm.value = true

  try {
    if (!item) {
      resetForm()
      return
    }

    // Bind các field có mapping 1-1 giữa API và form
    Object.keys(editFieldMap).forEach((fieldName) => {
      const shouldSkipWhenClone =
        isCloneMode.value && ['compositionCode', 'compositionName'].includes(fieldName)
      if (shouldSkipWhenClone) {
        formFields[fieldName].value = cloneDefaultValue(defaultFormValues[fieldName])
        return
      }
      const apiFieldName = editFieldMap[fieldName]
      const defaultValue = cloneDefaultValue(defaultFormValues[fieldName])

      formFields[fieldName].value = item[apiFieldName] ?? defaultValue
    })

    // Tree chọn đơn vị dùng array, trong khi API trả organizationId là một Guid
    compositionOrganization.value = item.organizationId ? [item.organizationId] : []

    // Khi sửa, mã đã có sẵn nên không để watcher tự sinh mã ghi đè
    isCodeManuallyEdited.value = !!compositionCode.value
  } finally {
    isBindingForm.value = false
  }
}

// ========================
// Dirty / cancel methods
// ========================
const isEmptyValue = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'boolean') {
    return value === false
  }

  return !String(value ?? '').trim()
}

const handleBack = () => {
  handleCancelForm()
}

const handleCancelForm = () => {
  // Nếu form đã có dữ liệu thì hỏi xác nhận trước khi thoát
  if (isFormDirty.value) {
    isShowCancelConfirmModal.value = true
    return
  }

  emit('back')
}

const handleDiscardChanges = () => {
  // Không lưu, quay lại màn danh sách
  emit('back')
}

const handleSaveAndBack = async () => {
  // Nút "Lưu" trong modal xác nhận hủy
  const isSaved = await handleSave()

  if (isSaved) {
    isShowCancelConfirmModal.value = false
    emit('back')
  }
}

// ========================
// Auto generate code
// ========================
const generateCompositionCode = (value) => {
  // Sinh mã từ tên: bỏ dấu, đổi khoảng trắng thành _, bỏ ký tự đặc biệt, viết hoa
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .toUpperCase()
}

// ========================
// Submit methods
// ========================
const buildPayload = () => {
  // Payload dùng chung cho thêm mới và sửa
  return cleanPayload({
    organizationId: highestSelectedIds.value[0],
    systemCompositionId: systemCompositionId.value,
    compositionCode: compositionCode.value,
    compositionName: compositionName.value,
    compositionType: compositionType.value,
    property: compositionProperty.value,
    taxableType: internalTaxAppliedType.value,
    taxDeductionType: 'Không',
    norm: compositionNorm.value,
    valueType: internalValueType.value,
    valueExpression: customFormula.value,
    description: salaryCompositionDescription.value,
    showOnPayslip: displayPayroll.value,
    creationSource: sourceOfCreation.value,
    status: true,

    // BE yêu cầu id khi update
    ...(isEditMode.value ? { id: salaryCompositionId.value } : {}),
  })
}

const handleSave = async () => {
  // Validate fail thì không gọi API
  if (!validateForm()) return false

  try {
    const payload = buildPayload()

    if (isEditMode.value) {
      // Form sửa thì gọi API update
      await salaryCompositionService.update(payload)
      showSuccess(t('message.activities.updateSuccess'))
    } else {
      // Form thêm mới thì gọi API create
      await salaryCompositionService.create(payload)
      showSuccess(t('message.activities.createSuccess'))
    }

    // Báo cho list biết đã lưu thành công để đóng form và fetch lại
    emit('saved', props.mode)
    return true
  } catch (error) {
    showError(
      error.message ||
        (isEditMode.value
          ? t('message.activities.updateError')
          : t('message.activities.createError')),
    )

    return false
  }
}
// ========================
// Formula methods
// ========================
const isShowFormulaSuggestionPopup = ref(false)
const activeSuggestionTab = ref('formula')
const salaryCompositionSuggestions = ref([])

const suggestionTabs = [
  { key: 'formula', label: 'Công thức' },
  { key: 'parameter', label: 'Tham số' },
]

const normalizeSearchText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
//Lọc danh sách công thức
const filteredFormulaSuggestions = computed(() => {
  const keyword = normalizeSearchText(customFormula.value)

  if (!keyword) return EXCEL_FORMULA_SUGGESTIONS

  return EXCEL_FORMULA_SUGGESTIONS.filter((item) =>
    [item.name, item.syntax, item.description].some((field) =>
      normalizeSearchText(field).includes(keyword),
    ),
  )
})
//Lọc danh sách tham số
const filteredParameterSuggestions = computed(() => {
  const keyword = normalizeSearchText(customFormula.value)

  const availableItems = salaryCompositionSuggestions.value.filter(
    (item) => item.id !== salaryCompositionId.value,
  )

  if (!keyword) return availableItems

  return availableItems.filter((item) =>
    [item.compositionName, item.compositionCode, item.description].some((field) =>
      normalizeSearchText(field).includes(keyword),
    ),
  )
})
//Lấy danh sách tham số
const fetchSalaryCompositionSuggestions = async () => {
  try {
    const data = await salaryCompositionService.getAll()
    salaryCompositionSuggestions.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tham số:', error)
    salaryCompositionSuggestions.value = []
  }
}
//Hiển thị pop up công thức
const handleFormulaFocus = () => {
  isShowFormulaSuggestionPopup.value = true
}
// Hiển thị pop up công thức khi input
const handleFormulaInput = () => {
  isShowFormulaSuggestionPopup.value = true
}
// Chọn công thức
const handleSelectFormulaSuggestion = (item) => {
  customFormula.value = item.value
  isShowFormulaSuggestionPopup.value = false
}
//Chọn tham số
const handleSelectParameterSuggestion = (item) => {
  customFormula.value = item.compositionCode
  isShowFormulaSuggestionPopup.value = false
}

// ========================
// Watchers
// ========================
const COMPOSITION_PROPERTY_DEDUCTION = 2
const COMPOSITION_PROPERTY_OTHER = 3
const TAX_APPLIED_TYPE_DEDUCTION = 4

const isDeductionProperty = computed(
  () => Number(compositionProperty.value) === COMPOSITION_PROPERTY_DEDUCTION,
)

const isOtherProperty = computed(
  () => Number(compositionProperty.value) === COMPOSITION_PROPERTY_OTHER,
)

const taxAppliedTypeOptions = computed(() =>
  taxAppliedTypes.value
    .map((item) => {
      const value = typeof item === 'object' ? item.value : item

      return {
        value,
        label: getEnumText(ENUM_NAMES.TAX_APPLIED_TYPE, value, ''),
      }
    })
    .filter((option) => Number(option.value) !== TAX_APPLIED_TYPE_DEDUCTION),
)

const taxDeductionLabel = computed(() =>
  getEnumText(ENUM_NAMES.TAX_APPLIED_TYPE, TAX_APPLIED_TYPE_DEDUCTION, ''),
)

const isTaxDeductionApplied = computed({
  get: () => Number(internalTaxAppliedType.value) === TAX_APPLIED_TYPE_DEDUCTION,
  set: (checked) => {
    internalTaxAppliedType.value = checked ? TAX_APPLIED_TYPE_DEDUCTION : null
  },
})
watch(
  () => props.editingItem,
  (newItem) => {
    // Bind dữ liệu khi chuyển giữa thêm mới và sửa
    bindFormData(newItem)
  },
  { immediate: true },
)

watch(
  compositionCode,
  () => {
    // Bỏ qua watcher khi đang bind form để tránh set nhầm trạng thái user sửa tay
    if (isBindingForm.value) return

    handleFieldChange('compositionCode')

    if (isAutoGenerating.value) return

    isCodeManuallyEdited.value = !!compositionCode.value
  },
  { flush: 'sync' },
)

watch(compositionName, (newValue) => {
  // Bỏ qua auto generate khi đang bind dữ liệu edit/create
  if (isBindingForm.value) return

  // Nếu user đã sửa mã tay thì không tự ghi đè mã nữa
  if (isCodeManuallyEdited.value) return

  isAutoGenerating.value = true
  compositionCode.value = generateCompositionCode(newValue)
  isAutoGenerating.value = false
})

// ========================
// Lifecycle
// ========================
onMounted(() => {
  fetchUnitOptions()
  fetchComboboxOptions()
  fetchSalaryCompositionSuggestions()
})
</script>

<style lang="scss" scoped>
.composition_input {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  .place_holder {
    display: flex;
    align-items: center;
    width: 188px;
    min-width: 188px;
    height: 36px;
    padding-right: 8px;
    box-sizing: border-box;
  }
  .label_container {
    min-width: 180px;
    font-size: 14px;
    color: #212121;
    height: 36px;
    display: flex;
    align-items: center;
    padding-right: 8px;
  }
  .icon_circle_info {
    margin-left: 5px;
  }
}
.custom_radio_group_property {
  align-items: flex-start;
  .base_cb_box {
    padding-right: 32px;
  }
  .tax_applied_control {
    height: 36px; /* Bằng với chiều cao của ô input combobox */
    display: flex;
    align-items: center;
  }
}
.custom_radio_group_value {
  display: flex;
  align-items: flex-start;
}
.value_options_container {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  .value_radio_row {
    display: flex;
    margin-bottom: 16px;
    .value_inline_combobox {
      margin-left: 16px;
    }
  }
  .value_conditional_combobox {
    margin-bottom: 16px;
  }
}
.buttons_wrapper {
  display: flex;
  gap: 12px;
}
.formula_suggestion_list {
  display: flex;
  flex-direction: column;
}

.formula_suggestion_item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background-color: #ffffff;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: #f6fbf7;
  }
}

.suggestion_icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.suggestion_content {
  min-width: 0;
  flex: 1;
}

.suggestion_title {
  color: #212121;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}

.suggestion_code {
  color: #4b5563;
  font-weight: 400;
}

.suggestion_description {
  margin-top: 2px;
  color: #666666;
  font-size: 13px;
  line-height: 18px;
}

.suggestion_empty {
  padding: 16px;
  color: #666666;
  font-size: 14px;
}
</style>
