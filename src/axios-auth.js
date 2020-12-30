import axios from 'axios';

// axiosのカスタムインスタンスを作る
const instance = axios.create({
  baseURL:''
});


export default instance;