import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
/* 面包屑导航 */
import Nav from './components/nav/Header.vue'
/* 导入icon图标 */
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
Vue.component('nav-header', Nav)

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
