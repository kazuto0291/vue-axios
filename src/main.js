import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';
import router from './router';
import store from './store'

Vue.config.productionTip = false

axios.defaults.baseURL ="https://firestore.googleapis.com/v1/projects/vue-http-7c2f0/databases/(default)/documents";
// axios.defaults.headers.common["Authorization"] = "flajflajlfjaf";
// axios.defaults.headers.get["Accept"] = "application/json"

// axiosがサーバにリクエストを送る前に行う処理--２つのコールバックの引数を取る
const interceptorsRequest = axios.interceptors.request.use(
  config => {
    // ログインの認証でトークンをつける
    console.log('interceptors request', config);
    return config;
  },
  error => {
    // promise.rejectを返してApp.vueのcreatedでchachする。
    // App.vueのcatchの前の処理を共通化できる。（おしゃれなUIをだすなど）
    return Promise.reject(error)
  }
);
// axiosがサーバーにとってきたレスポンスをthenに渡す前に行う処理
const interceptorsResponse = axios.interceptors.response.use(
  response => {
    console.log('interceptors response', response);
    return response;
  },
  error => {
    // promise.rejectを返してApp.vueのcreatedでchachする。
    return Promise.reject(error)
  }
);

console.log(interceptorsRequest, 'interceptorsRequest')
console.log(interceptorsResponse, 'interceptorsResponse')

// eject--引き抜く、取り消す、底の部分なくす意味
// 取り除きたい処理を書く
axios.interceptors.request.eject(interceptorsRequest);
axios.interceptors.response.eject(interceptorsResponse);

// 最初にJsが読み込まれたときにautoLoginを実行しvueインスタンスにアクセスする.
store.dispatch('autoLogin').then(() => {
  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app')
})

