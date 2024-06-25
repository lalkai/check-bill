import { createRouter, createWebHistory } from 'vue-router'
import PeopleView from '../views/PeopleView.vue'
import BillsView from '../views/BillsView.vue'
import PayerAmountsView from '../views/PayerAmountsView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'People-View',
      component: PeopleView
    },
    {
      path: '/',
      name: 'Bills-View',
      component: BillsView
    },
  {
      path: '/',
      name: 'PayerAmounts-View',
      component: PayerAmountsView
    }
    
  ]
})

export default router
