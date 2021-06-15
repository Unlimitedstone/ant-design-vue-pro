<template>
  <a-card :bordered="false" class="card-area">
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="8" :sm="24">
            <a-form-item label="角色名称">
              <a-input placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary">查询</a-button>
              <a-button style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <a-table
      ref="table"
      size="middle"
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
      @change="handleTableChange">

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
// import { createRole, deleteRole, getRoles, updateRole } from '@/api/role'
import { STable } from '@/components'

export default {
  components: { STable },
  name: 'Role',
  data () {
    return {
      description: '角色管理页面',
      queryParam: { roleName: '' },
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
        { title: '角色名称', align: 'center', dataIndex: 'roleName' },
        { title: '角色编码', align: 'center', dataIndex: 'roleCode' },
        { title: '创建时间', align: 'center', dataIndex: 'createTime' },
        { title: '操作', align: 'center', dataIndex: 'action' }
      ]
    }
  }
}
</script>

<style scoped>

</style>
