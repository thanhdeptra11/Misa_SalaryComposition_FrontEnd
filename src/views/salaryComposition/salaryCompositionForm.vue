<template>
<!-- Gọi Base layout lắng nghe sự kiện back -->
 <BaseFormLayout pageTitle="Thêm thành phần" @back="handleBack">
 <!-- Slot của actions -->
  <template #header-actions>
    <BaseButton
    variant="primary"
    buttonText="Hủy bỏ"
    />
     <BaseButton
    variant="primary"
    buttonText="Lưu và thêm"
    />
    <BaseButton
    @click="handleSave"
    variant="secondary"
    buttonText="Lưu"
    width="80px"
    />
  </template>
  <!-- Nội dung chính có thể cuộn -->
   <div class="salary_composition_inputs">
        <!-- Input nhập tên thành phần -->
         <div class="composition_input">
           <BaseInput 
           v-model="compositionName"  label="Tên thành phần" 
            labelWidth="180px" inputWidth="676px" required="true"
             :error-message="errors.compositionName"
              @blur="validateField('compositionName')"
              @update:modelValue="handleFieldChange('compositionName')"
            />
         </div>
        <!-- Input nhập Mã thành phần -->
        <div class="composition_input">
          <BaseInput v-model="compositionCode"  label="Mã thành phần" placeholder="Nhập mã viết liền"
          labelWidth="180px" inputWidth="676px" required="true"
          :error-message="errors.compositionCode"
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
              required="true"
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
              required="true"
              labelWidth="180px" 
              inputWidth="237px"
              :errorMessage="errors.compositionProperty"
              @blur="validateField('compositionProperty')"
              @update:modelValue="handleFieldChange('compositionProperty')"
            />
            <!-- Radio group chọn kiểu áp dụng thuế -->
            <BaseRadioGroup 
            :options="taxAppliedTypes"
            v-model="internalTaxAppliedType"
            />
         </div>
         <!-- Input định mức -->
          <div class="composition_input">
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
            <BaseCheckBox 
            label="Cho phép giá trị vượt quá định mức"
            v-model="isValueExceedNorm"
            />
            <div class="icon_circle_info" id="icon-tooltip"></div>
            <BaseToolTip
            target="#icon-tooltip"
            :content="GLOBAL_CONSTANTS.TOOL_TIP_EXCEED_NORM"
            />
          </div>
          <!-- Input chọn kiểu giá trị -->
          <div class="composition_input">
            <BaseCombobox
              label="Kiểu giá trị"
              :options="valueTypeOptions"
              v-model="internalValueType"
              labelWidth="180px"
              inputWidth="237px"
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
                     v-model="customFormula"
                     input-width="674px"
                    
                    />
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
             <BaseRadioGroup
              v-model="displayPayroll"
              :options="displayPayrollTypeOptions"
             />
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
</template>
<script setup>
// Import components 
import BaseButton from '@/components/base/baseButton/BaseButton.vue';
import BaseFormLayout from '@/components/base/BaseFormLayout.vue';
import BaseInput from '@/components/base/baseInput/BaseInput.vue';
import BaseHierachyTree from '@/components/base/baseInput/BaseHierachyTree.vue';
import { DxTooltip } from 'devextreme-vue';
// ========================
// Services và js
import organizationService from '@/services/organizationService';
import enumService from '@/services/enumService';
import salaryCompositionService from '@/services/salaryCompositionService';
import { GLOBAL_CONSTANTS } from '@/constants/globalConstants';
// import validator
import { required, maxLength } from '@/utils/validator';
// ========================
// Import vue function
import { computed, ref, watch, reactive } from 'vue';
import { onMounted } from 'vue';
import BaseCombobox from '@/components/base/baseInput/BaseCombobox.vue';
import BaseRadio from '@/components/base/baseInput/BaseRadio.vue';
import BaseTextArea from '@/components/base/baseInput/BaseTextArea.vue';
import BaseRadioGroup from '@/components/base/baseInput/BaseRadioGroup.vue';
// ====================
const valueOptions = [
  {
    label: 'Tự động cộng tổng giá trị của các nhân viên',
    value: 'takeSum'
  },
  {
    label: 'Tính theo công thức tự đặt',
    value: 'formula'
  }
]
const handleBack = () => {
    console.log('back');
    
}
// Khai báo biến load danh sách đơn vị
const unitOptions = ref([]);
// Khai báo biến loại thành phần
const typeOptions = ref([]);
// Khai báo biến tính chất
const propertyOptions = ref([]);
// Khai báo biến kiểu áp dụng thuế
const taxAppliedTypes = ref([]);
// Khai báo biến kiểu giá trị
const valueTypeOptions = ref([]);
// Khai báo biến hiển thị trên phiếu lương
const displayPayrollTypeOptions = ref([])


const fetchUnitOptions = async () => {
  try {
    const data = await organizationService.getOrganizations();
    if (data && Array.isArray(data)) {
      unitOptions.value = data;
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu phòng ban:", error);
  }
};
// Biến nhập Tên thành phần
const compositionName = ref('');
// Biến nhập Mã thành phần
const compositionCode = ref('');
// Biến nhập Định mức
const compositionNorm = ref('');
// Biến selected đơn vị
const compositionOrganization = ref([])
// Biến selected loại thành phần
const compositionType = ref([])
// Biến selected tính chất
const compositionProperty = ref([])
// Biến selected kiểu áp dụng thuế
const internalTaxAppliedType = ref([])
// Biến checked có cho phép giá trị vượt quá định mức
const isValueExceedNorm = ref(false);
// Biến selected kiểu giá trị
const internalValueType = ref([])
// Biến selected giá trị
const ValueoptionModel = ref([])
// Biến công thức tự đặt
const customFormula = ref('')
// Biến mô tả
const salaryCompositionDescription = ref('')
// Biến selected hiển thị trên phiếu lương
const displayPayroll = ref([])
// Biến nguồn tạo
const sourceOfCreation = ref('Tự thêm')
// Biến reactive để validate
const errors = reactive({})
// Khởi tạo rule field trong rule phải khớp với resources
const validationRules = {
  compositionName: [
    required('fields.salaryComposition.compositionName')
  ],
  compositionCode: [
    required('fields.salaryComposition.compositionCode')
  ],
  compositionOrganization: [
    required('fields.salaryComposition.compositionOrganization')
  ],
  compositionType: [
    required('fields.salaryComposition.compositionType')
  ],
  compositionProperty: [
    required('fields.salaryComposition.compositionProperty')
  ],
}
// Lấy formvalue cần validate
const formValidateValues = {
  compositionName,
  compositionCode,
  compositionOrganization,
  compositionType,
  compositionProperty
}
// Validate từng field
const validateField = (fieldName) => {
  const rules = validationRules[fieldName] || [];
  const value = formValidateValues[fieldName].value;

  for (const rule of rules) {
    const errorMessage = rule(value);

    if (errorMessage) {
      errors[fieldName] = errorMessage;
      return false;
    }
  }

  errors[fieldName] = '';
  return true;
};

const validateForm = () => {
  let isValid = true;

  Object.keys(validationRules).forEach((fieldName) => {
    const fieldValid = validateField(fieldName);

    if (!fieldValid) {
      isValid = false;
    }
  });

  return isValid;
};
// Validate lại khi field có lỗi 
const handleFieldChange = (fieldName) => {
  if (errors[fieldName]) {
    validateField(fieldName);
  }
};

// Computed tính toán để chỉ lấy id các đơn vị cấp cao nhất
const highestSelectedIds = computed(() => {
  const selectedSet = new Set(compositionOrganization.value)

  const orgMap = new Map(
    unitOptions.value.map(org => [org.id, org])
  )

  return compositionOrganization.value.filter(id => {
    const org = orgMap.get(id)

    return org && !selectedSet.has(org.parentId)
  })
})
// Biến flag lưu state current code
const isCodeManuallyEdited = ref(false);
const isAutoGenerating = ref(false);
// Hàm xử lí sinh mã thành phần tự động
const generateCompositionCode = (value) => {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .toUpperCase();
};

watch(compositionCode, (newValue) => {
  handleFieldChange('compositionCode');
  if (isAutoGenerating.value) return;

  isCodeManuallyEdited.value = !!newValue;
},
  { flush: 'sync' });

// Xử lí gõ ô Tên thành phần thì tự sinh mã thành phần
watch(compositionName, (newValue) => {
  if (isCodeManuallyEdited.value) return;

  isAutoGenerating.value = true;
  compositionCode.value = generateCompositionCode(newValue);
  isAutoGenerating.value = false;
});

// Hàm xử lí nút Lưu
const handleSave = async () => {
  if(!validateForm()) return;
  try {
  // Tạo payload
  const payload = {
    organizationId: highestSelectedIds.value,
    systemCompositionId: null,
    compositionCode: compositionCode.value,
    compositionName: compositionName.value,
    compositionType: compositionType.value, 
    property: compositionProperty.value,
    taxableType: internalTaxAppliedType.value,
    taxDeductionType: "Không", // Backend yêu cầu truyền cứng
    norm: compositionNorm.value,
    valueType: internalValueType.value,
    valueExpression: customFormula.value,
    description: salaryCompositionDescription.value,
    showOnPayslip: displayPayroll.value,
    creationSource: sourceOfCreation.value,
    status: true // Mặc định là kích hoạt
  }
  // Đẩy lên Be
  const response = await salaryCompositionService.create(payload);
} catch (error) {
  console.log('Lỗi khi thêm mới thành phần lương', error);
}
  
}

// Onmounted
onMounted(() => {
    fetchUnitOptions();
    enumService.fetchCbBoxOptions('CompositionType', typeOptions);
    enumService.fetchCbBoxOptions('CompositionProperty', propertyOptions);
    enumService.fetchCbBoxOptions('TaxAppliedType', taxAppliedTypes);
    enumService.fetchCbBoxOptions('MiValueType', valueTypeOptions);
    enumService.fetchCbBoxOptions('DisplayPayrollType', displayPayrollTypeOptions);
})
</script>
<style lang="scss" scoped>
.composition_input{
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    .place_holder{
        display: flex;
        align-items: center;
        width: 180px;
        min-width: 180px;
        height: 36px;
        padding-right: 8px;
        box-sizing: border-box;
    }
    .label_container{
    min-width: 180px;
    font-size: 14px;
    color: #212121;
    height: 36px;
    display: flex;
    align-items: center;
    padding-right: 8px;   
    }
    .icon_circle_info{
      margin-left: 5px;
    }
}
.custom_radio_group_property{
    .base_cb_box{
        padding-right: 32px;
    }
}
.custom_radio_group_value{
  display: flex;
  align-items: flex-start;
}
.value_options_container{
  .value_radio_row{
    display: flex;
    margin-bottom: 16px;
    .value_inline_combobox{
      margin-left: 16px;
    }
  }
  .value_conditional_combobox{
    margin-bottom: 16px;
  }
}


</style>