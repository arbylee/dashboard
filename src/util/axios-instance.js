import axios from 'axios';
var instance = axios.create({
  baseURL: 'http://localhost:3010/',
  timeout: 10000,
});

export default instance;
