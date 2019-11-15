import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import Vueaxios from 'vue-axios'

Vue.use(Vueaxios, axios)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
