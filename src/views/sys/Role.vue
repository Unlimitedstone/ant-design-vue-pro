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
  </a-card>
</template>

<script>
import { getAllRoles, getRoles } from '@/api/role'
export default {
  components: { },
  name: 'Role',
  data () {
    return {
      description: '角色管理页面',
      // queryParam: { roleName: '' },
      loadData: [],
      Role: {
        name: ''
      },
      loading: false,
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
        { title: '角色编码', align: 'center', dataIndex: 'remark' },
        { title: '权限', align: 'center', dataIndex: 'roleType' },
        { title: '操作', align: 'center', dataIndex: 'action', scopedSlots: { customRender: 'action' } }

      ]
    }
  },
  computed: {
    // 非声明式渲染， 重新加载不会执行
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.loading = true
      getAllRoles().then(res => {
        // this.expandedRowKeys = res.result.data.map(item => item.id)
        this.loadData = res.result.data
      }).finally(() => {
        this.loading = false
      })
    },
    handleEdit (record) {
      console.log(record)
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
