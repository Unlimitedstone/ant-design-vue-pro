<template>
  <a-card :bordered="false" class="card-area">
    <div class="table-page-search-wrapper">
      <a-form ref="dataForm" :model="Resources" layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="8" :sm="24">
            <a-form-item label="菜单名称">
              <a-input v-model="Resources.name" placeholder="请输入菜单名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery()">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => this.Resources = {}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <template>
      <a-button type="dash" icon="plus" @click="$refs.addForm.add()">新增菜单</a-button>
    </template>
    <a-table
      :rowkey="(record) => record.id"
      :columns="columns"
      :data-source="loadData"
      :bordered="true"
      :indentsize="13"
      :loading="loading"
      :defaultExpandAllRows="false"
    >
      <span slot="icon" slot-scope="text">
        <div v-if="text != null && text != ''">
          <a-icon :type="text"/>
        </div>
      </span>
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
            v-decorator="['id']"/>
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
            disabled="disabled"
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
            placeholder="起一个名字"
            v-decorator="['name']"
          />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="状态"
          hasFeedback
          validateStatus="warning"
        >
          <a-select v-decorator="['status', { initialValue: 1 }]">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="2">禁用</a-select-option>
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
            id="describe"
            v-decorator="['remark']"
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
import { getResourcesList } from '@/api/sys'
import { PERMISSION_ENUM } from '@/core/permission/permission'
import addForm from './addForm'
import editForm from './editForm'

const STATUS = {
  1: '启用',
  2: '禁用'
}

export default {
  components: {
    addForm,
    editForm
  },
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
      description: '菜单管理页面',
      // queryParam: { roleName: '' },
      loadData: [],
      // form.createForm 没有这个无法使用this.form.setFieldsValue
      form: this.$form.createForm(this),
      Resources: {
      },
      loading: false,
      permissions: [],
      expandedRowKeys: [],
      columns: [
        // {
        //   title: 'id',
        //   align: 'center',
        //   hidden: 'true'
        // },
        { title: '菜单名称', align: 'center', dataIndex: 'name', width: '20%', colspan: 0 },
        {
          title: '菜单类型',
          align: 'center',
          dataIndex: 'type',
          width: '10%',
          customRender: function (t, r, index) {
            return t === 0 ? '目录' : t === 1 ? '菜单' : '按钮'
          }
        },
        { title: '图标', align: 'center', dataIndex: 'icon', scopedSlots: { customRender: 'icon' }, width: '10%' },
        { title: '组件', align: 'center', dataIndex: 'component', width: '20%' },
        { title: '路由地址', align: 'center', dataIndex: 'router', width: '20%' },
        { title: '排序', align: 'center', dataIndex: 'sort', width: '10%' },
        { title: '操作', align: 'center', dataIndex: 'action', scopedSlots: { customRender: 'action' }, width: '10%' }

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
      getResourcesList().then(res => {
        // this.expandedRowKeys = res.result.data.map(item => item.id)
        console.log('res', res.data)
        this.removeEmptyChildren(res.data)
        this.loadData = res.data
      }).finally(() => {
        this.loading = false
      })
    },
    /**
     * 去掉无用的支节点
     */
    removeEmptyChildren (data) {
      if (data == null || data.length === 0) return
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (item.children != null && item.children.length === 0) {
          item.children = null
        } else {
          this.removeEmptyChildren(item.children)
        }
      }
    },
    handleEdit (record) {
      // this.visible = true
      // console.log('record', record)
      //
      // const checkboxGroup = {}
      // this.permissions = record.permissions.map(permission => {
      //   const groupKey = `permissions.${permission.permissionId}`
      //   checkboxGroup[groupKey] = permission.actionList
      //   const actionsOptions = permission.actionEntitySet.map(action => {
      //     return {
      //       label: action.describe,
      //       value: action.action,
      //       defaultCheck: action.defaultCheck
      //     }
      //   })
      //   return {
      //     ...permission,
      //     actionsOptions
      //   }
      // })
      //
      // this.$nextTick(() => {
      //   console.log('permissions', this.permissions)
      //   console.log('checkboxGroup', checkboxGroup)
      //
      //   this.form.setFieldsValue(pick(record, ['id', 'remark', 'status', 'describe', 'name']))
      //   this.form.setFieldsValue(checkboxGroup)
      // })
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
      getResourcesList(this.Role).then(res => {
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
.table-operator {
  margin-bottom: 18px;
}
</style>
