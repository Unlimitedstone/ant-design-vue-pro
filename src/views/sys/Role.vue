<template>
  <a-card :bordered="false" class="card-area">
    <div class="table-page-search-wrapper">
      <a-form ref="dataForm" :model="Role" layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="8" :sm="24">
            <a-form-item label="角色名称">
              <a-input v-model="Role.name" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery()">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => this.Role = {}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <a-table
      size="middle"
      row-key="id"
      :columns="columns"
      :data-source="loadData"
      :pagination="{ pageSize: 20 }"
      bordered
      :loading="loading"
      :expandedRowKeys="expandedRowKeys"
    >

      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />

        <a-dropdown>
          <a class="ant-dropdown-link">
            更多 <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a @click="handlePerssion(record.id)">授权</a>
            </a-menu-item>
            <a-menu-item>
              <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                <a>删除</a>
              </a-popconfirm>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </span>

    </a-table>

    <a-modal
      title="操作"
      style="top: 20px;"
      :width="800"
      v-model="visible"
      @ok="handleOk"
    >
      <a-form class="permission-form" :form="form">
        <a-form-item>
          <a-input
            hidden="hidden"
            v-decorator="['id']" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="角色名称"
          hasFeedback
          validateStatus="success"
        >
          <a-input
            placeholder="角色名称"
            v-decorator="['name']"
          />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="角色编码"
          hasFeedback
          validateStatus="success"
        >
          <a-input
            placeholder="起一个名字(唯一)"
            disabled="disabled"
            v-decorator="['code']"
          />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="状态"
          hasFeedback
          validateStatus="warning"
        >
          <a-select v-decorator="['status', { initialValue: 0 }]">
            <a-select-option :value="0">启用</a-select-option>
            <a-select-option :value="1">禁用</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="描述"
          hasFeedback
        >
          <a-textarea
            :rows="5"
            placeholder="..."
            id="description"
            v-decorator="['description']"
          />
        </a-form-item>

        <a-divider>拥有权限</a-divider>
        <template v-for="permission in permissions">
          <a-form-item
            class="permission-group"
            v-if="permission.actionsOptions && permission.actionsOptions.length > 0"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            :key="permission.permissionId"
            :label="permission.permissionName"
          >
            <a-checkbox>全选</a-checkbox>
            <a-checkbox-group
              v-decorator="[`permissions.${permission.permissionId}`]"
              :options="permission.actionsOptions" />
          </a-form-item>
        </template>

      </a-form>
    </a-modal>

  </a-card>
</template>

<script>
import { getAllRoles, getRoles, getMenuByRoleId } from '@/api/role'
import { PERMISSION_ENUM } from '@/core/permission/permission'
import pick from 'lodash.pick'

const STATUS = {
  1: '启用',
  2: '禁用'
}

export default {
  components: {},
  name: 'Role',
  data () {
    return {
      visible: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      description: '角色管理页面',
      // queryParam: { roleName: '' },
      loadData: [],
      // form.createForm 没有这个无法使用this.form.setFieldsValue
      form: this.$form.createForm(this),
      Role: {
        name: ''
      },
      loading: false,
      permissions: [],
      expandedRowKeys: [],
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          }
        },
        { title: '角色名称', align: 'center', dataIndex: 'name' },
        { title: '角色编码', align: 'center', dataIndex: 'code' },
        {
          title: '权限',
          align: 'center',
          dataIndex: 'roleLevel'
        },
        {
          title: '是否启用',
          align: 'center',
          dataIndex: 'status',
          customRender: function (v, r, index) {
            return v === 0 ? <font color='red'>启用</font> : <font color='#a9a9a9'>禁用</font>
          }
        },
        { title: '操作', align: 'center', dataIndex: 'action', scopedSlots: { customRender: 'action' } }

      ]
    }
  },
  computed: {
    // 非声明式渲染， 重新加载不会执行
  },
  filters: {
    statusFilter (key) {
      return STATUS[key]
    },
    permissionFilter (key) {
      const permission = PERMISSION_ENUM[key]
      return permission && permission.label
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.loading = true
      getAllRoles().then(res => {
        // this.expandedRowKeys = res.result.data.map(item => item.id)
        this.loadData = res.data
      }).finally(() => {
        this.loading = false
      })
    },
    handleEdit (record) {
      this.visible = true
      console.log('record', record)
      getMenuByRoleId(record.id).then(res => {
        record.permission = res.data
      })
      const checkboxGroup = {}
      this.permissions = record.permissions.map(permission => {
        console.log('permission', permission)
        const groupKey = `permissions.${permission.permissionId}`
        console.log('permissions.{permission.permissionId}', groupKey)
        checkboxGroup[groupKey] = permission.actionList
        const actionsOptions = permission.actionEntitySet.map(action => {
          return {
            label: action.describe,
            value: action.action,
            defaultCheck: action.defaultCheck
          }
        })
        return {
          ...permission,
          actionsOptions
        }
      })

      this.$nextTick(() => {
        // console.log('permissions', this.permissions)
        console.log('checkboxGroup', checkboxGroup)
        this.form.setFieldsValue(pick(record, ['id', 'code', 'status', 'description', 'name']))
        this.form.setFieldsValue(checkboxGroup)
      })
    },
    handleOk (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        console.log(err, values)
        this.visible = false
      })
    },
    searchQuery () {
      this.loading = true
      getRoles(this.Role).then(res => {
        console.log(this.Role)
        this.loadData = res.result.data
      }).finally(() => {
        this.loading = false
      })
    }
  }

}
</script>

<style scoped>

</style>
