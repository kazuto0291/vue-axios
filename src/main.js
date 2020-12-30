import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import { MAX_SAFE_INTEGER } from 'core-js/fn/number';

Vue.config.productionTip = false

axios.defaults.baseURL ="https://firestore.googleapis.com/v1/projects/vue-http-7gagdcd2gaf0/databases/(default)/documents";
// axios.defaults.headers.common["Authorization"] = "flajflajlfjaf";
// axios.defaults.headers.get["Accept"] = "application/json"

new Vue({
  render: h => h(App),
}).$mount('#app')
