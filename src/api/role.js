import request from '@/utils/request'

export function getAllRoles () {
  return request({
    url: '/role/all',
    method: 'get'
  })
}

export function createRole (data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

export function updateRole (data) {
  return request({
    url: '/role',
    method: 'put',
    data
  })
}

export function deleteRole (data) {
  return request({
    url: '/role',
    method: 'delete',
    data
  })
}

export function getRoles (param) {
  return request({
    url: '/role',
    method: 'get',
    params: param
  })
}
