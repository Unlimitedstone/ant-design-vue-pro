import request from '@/utils/request'

export function getAllRoles () {
  return request({
    url: 'http://127.0.0.1:8080/icb/role/listnew',
    method: 'get'
  })
}

export function createRole (data) {
  return request({
    url: '/role/create',
    method: 'post',
    data
  })
}

export function updateRole (data) {
  return request({
    url: '/role/update',
    method: 'put',
    data
  })
}

export function deleteRole (data) {
  return request({
    url: '/role/del',
    method: 'delete',
    data
  })
}

export function getRoles (param) {
  return request({
    url: '/role/get',
    method: 'get',
    params: param
  })
}

export function getMenuByRoleId (param) {
  return request({
    url: 'http://127.0.0.1:8080/icb/role/menuById',
    method: 'get',
    params: { roleId: param }
  })
}
