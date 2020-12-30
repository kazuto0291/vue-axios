import axios from 'axios';

// axiosのカスタムインスタンスを作る
const instance = axios.create({
  baseURL:'https://identitytoolkit.googleapis.com/v1'
});


export default instance;