import axios from 'axios';
var instance = axios.create({
  baseURL: 'http://localhost:3010/',
  timeout: 1000,
});

export default instance;
