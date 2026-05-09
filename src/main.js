import './assets/main.css'
import './assets/icon.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'

import router from './router'

import BaseButton from '@/components/base/baseButton/BaseButton.vue'
import BaseSelectBox from '@/components/base/baseInput/BaseSelectBox.vue'
import BaseInput from '@/components/base/baseInput/BaseInput.vue'
import BaseCalendar from '@/components/base/baseInput/BaseCalendar.vue'
import BaseDatePicker from '@/components/base/baseInput/BaseDatePicker.vue'
import BaseCombobox from '@/components/base/baseInput/BaseCombobox.vue'
import ModalBasis from '@/components/base/baseModal/ModalBasis.vue'
const app = createApp(App)
app.component('ModalBasis', ModalBasis)

app.component('BaseButton', BaseButton)
app.component('BaseSelectBox', BaseSelectBox)
app.component('BaseInput', BaseInput)
app.component('BaseCalendar', BaseCalendar)
app.component('BaseDatePicker', BaseDatePicker)
app.component('BaseCombobox', BaseCombobox)

app.use(createPinia())
app.use(router)

app.mount('#app')
