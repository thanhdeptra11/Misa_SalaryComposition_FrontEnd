import { createRouter, createWebHistory } from 'vue-router'
import MainLayoutRecruitPage from '@/components/layout/MainLayoutRecruit.vue'
import SalaryCompositionList from '@/views/salaryComposition/salaryCompositionList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/payroll',
      component: MainLayoutRecruitPage,
      children: [
        {
          path: 'salarycomposition',
          name: 'Salarycompositions',
          component: SalaryCompositionList,
        },
      ],
    },
  ],
})

export default router
