import Vue from 'vue';
import Vuex from 'vuex';
import axios from '../axios-auth';
import router from '../router';
import axiosRefresh from '../axios-refresh';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    idToken: null
  },
  getters: {
    idToken: state => state.idToken
  },
  mutations: {
    updateIdToken(state, idToken) {
      state.idToken = idToken;
    }
  },
  actions: {
     async autoLogin({dispatch}) {
      const idToken = localStorage.getItem('idToken');
      if (!idToken) return;
      const now = new Date();
      const expiryTimeMs = localStorage.getItem('expiryTimeMs');
      // 有効期限が切れているか？ = 今の時間が有効期限の時間より大きい
      const isExpired = now.getTime() >= expiryTimeMs;
      const refreshToken = localStorage.getItem('refreshToken');
      if (isExpired) {
        // 有効期限切れていたら、リフレッシュトークンを使ってidToken更新する
        await dispatch('refreshIdToken', refreshToken);
      } else {
        // 有効期限が切れていなかったらの処理
        // autoLoginして残りのidTokenの期限を取得する
        // 有効期限の残り時間 = 未来の期限が切れる時間 - 今の時間
        const expiresInMs = expiryTimeMs - now.getTime();
        setTimeout(() => {
          dispatch('refreshIdToken', refreshToken);
        }, expiresInMs)
        this.commit('updateIdToken', idToken);
      }
    },
    login({ dispatch }, authData) {
      axios.post(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDtRVsU0Scbfku9UkUFbDoRoeTopnSdFb8',
        {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true
        }
      ).then(response => {
        dispatch('setAuthData', {
          idToken: response.data.idToken,
          expiresIn: response.data.expiresIn,
          refreshToken: response.data.refreshToken
        });
        router.push('/')
        console.log(response);
      })
    },
    logout({ commit }) {
      commit('updateIdToken', null);
      localStorage.removeItem('idToken');
      localStorage.removeItem('expiryTimeMs');
      localStorage.removeItem('refreshToken');
      router.replace('/login');
    },
    async refreshIdToken({ dispatch }, refreshToken) {
      await axiosRefresh.post('/token?key=AIzaSyDtRVsU0Scbfku9UkUFbDoRoeTopnSdFb8',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }
      ).then(response => {
        dispatch('setAuthData', {
          idToken: response.data.id_token,
          expiresIn: response.data.expires_in,
          refreshToken: response.data.refresh_token
        });
      })
    },
    register({ dispatch }, authData) {
      axios.post(
        '/accounts:signUp?key=AIzaSyDtRVsU0Scbfku9UkUFbDoRoeTopnSdFb8',
        {
          email: authData.email,
          password: authData.password,
          returnSecureToken : true
        }
      ).then(response => {
        dispatch('setAuthData', {
          idToken: response.data.idToken,
          expiresIn: response.data.expiresIn,
          refreshToken: response.data.refreshToken
        });        router.push('/');
        console.log(response)
      })
    },
    setAuthData({commit ,dispatch}, authData) {
      // 現時点の時間
      const now = new Date();
      // 有効期限が切れる時 = 今の時間(1970/1/1から何秒経過したか) + １時間後の秒数
      const expiryTimeMs = now.getTime() + authData.expiresIn * 1000;
      commit('updateIdToken', authData.idToken);
      // ローカルストレージに保存 --setItem(名前, 渡したい値)
      localStorage.setItem('idToken', authData.idToken);
      // ローカルストレージに有効期限が切れる時を保存する
      localStorage.setItem('expiryTimeMs', expiryTimeMs);
      // ローカルストレージにリフレッシュトークンを有効期限が切れていたら更新できるために保存する
      localStorage.setItem('refreshToken', authData.refreshToken)
      setTimeout(() => {
        dispatch('refreshIdToken', authData.refreshToken);
      }, authData.expiresIn * 1000);
    }
  }
});