import request from '@/utils/request'
// import axios from '@/utils/axios'

/* const api = {
  resourcesList: '/request/listnew'
} */

export function getResourcesList (parameter) {
  return request({
    url: 'http://127.0.0.1:8080/icb/resource/listnew',
    type: 'post',
    data: parameter
  })
}
