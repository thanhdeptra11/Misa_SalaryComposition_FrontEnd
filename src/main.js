import './assets/main.css'
import './assets/icon.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'

import router from './router'
// Import css
import './assets/PrismExcelTheme.css'
import BaseSearchBox from './components/base/BaseSearchBox.vue'
import BaseFormLayout from './components/base/BaseFormLayout.vue'
import BaseButton from '@/components/base/baseButton/BaseButton.vue'
import BaseSelectBox from '@/components/base/baseInput/BaseSelectBox.vue'
import BaseInput from '@/components/base/baseInput/BaseInput.vue'
import BaseCalendar from '@/components/base/baseInput/BaseCalendar.vue'
import BaseDatePicker from '@/components/base/baseInput/BaseDatePicker.vue'
import BaseCombobox from '@/components/base/baseInput/BaseCombobox.vue'
import ModalBasis from '@/components/base/baseModal/ModalBasis.vue'
import BaseTextArea from '@/components/base/baseInput/BaseTextArea.vue'
import BaseRadioGroup from '@/components/base/baseInput/BaseRadioGroup.vue'
import BaseCheckBox from '@/components/base/baseInput/BaseCheckBox.vue'
import BaseToolTip from '@/components/base/BaseToolTip.vue'
import BaseRadio from '@/components/base/baseInput/BaseRadio.vue'
import BaseTextUnderline from '@/components/base/baseInput/BaseTextUnderline.vue'
import BaseConfirmModal from '@/components/base/baseModal/BaseConfirmModal.vue'
const app = createApp(App)
app.component('ModalBasis', ModalBasis)
app.component('BaseConfirmModal', BaseConfirmModal)
app.component('BaseButton', BaseButton)
app.component('BaseSelectBox', BaseSelectBox)
app.component('BaseInput', BaseInput)
app.component('BaseCalendar', BaseCalendar)
app.component('BaseDatePicker', BaseDatePicker)
app.component('BaseCombobox', BaseCombobox)
app.component('BaseRadioGroup', BaseRadioGroup)
app.component('BaseTextArea', BaseTextArea)
app.component('BaseCheckBox', BaseCheckBox)
app.component('BaseToolTip', BaseToolTip)
app.component('BaseRadio', BaseRadio)
app.component('BaseTextUnderline', BaseTextUnderline)
app.component('BaseFormLayout', BaseFormLayout)
app.component('BaseSearchBox', BaseSearchBox)
app.use(createPinia())
app.use(router)

app.mount('#app')
