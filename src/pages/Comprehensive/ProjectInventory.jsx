import { useEffect, useState } from 'react'

import { Button, Form, Input, Layout, Select } from '@arco-design/web-react'
import { useSelector } from 'react-redux'

// 公共方法
import { downloadFile } from 'src/utils/common'
// 组件
import ExcelPreview from 'src/components/ExcelPreview'

const ProjectInventory = () => {
  const [selectItem, setSelectItem] = useState({
    search_type: '1',
  })
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)

  const [projectList, setProjectList] = useState([])
  const [supplierList, setSupplierList] = useState([])

  const [fileUrl, setFileUrl] = useState(null)

  // 导出
  const onExport = async () => {
    const params = {
      groupid: currentCompany.id,
      code: selectItem.code,
      name: selectItem.name,
      search_type: Number(selectItem.search_type),
    }
    const result = await Http.post('/query/stock/export', params, { responseType: 'blob' })
    downloadFile(result, '项目总台账_' + selectItem.name, 'xlsx')
  }

  // 查询
  const onSearch = async () => {
    if (selectItem.code) {
      const params = {
        groupid: currentCompany.id,
        code: selectItem.code,
        name: selectItem.name,
        search_type: Number(selectItem.search_type),
      }
      const result = await Http.post('/query/stock/export', params, { responseType: 'blob' })

      const blob_excel = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      if (blob_excel) {
        const excel = URL.createObjectURL(blob_excel)
        setFileUrl(excel)
      }
    }
  }

  // 获取项目列表
  const getProjectList = async () => {
    const params = {
      groupid: currentCompany.id,
    }
    const { code, data } = await Http.post('/query/project/list', params)
    if (code === 200) {
      const dataList = data?.list?.map((item) => ({
        ...item,
        label: item.name,
        value: item.code,
      }))
      setProjectList(dataList)
    }
  }

  // 获取供应商列表
  const getSupplierList = async () => {
    const params = {
      groupid: currentCompany.id,
    }
    const { code, data } = await Http.post('/query/supplier/list', params)
    if (code === 200) {
      const dataList = data?.list?.map((item) => ({
        ...item,
        label: item.name,
        value: item.code,
      }))
      setSupplierList(dataList)
    }
  }

  useEffect(() => {
    if (currentCompany) {
      getProjectList()
      getSupplierList()
    }
  }, [currentCompany])

  return (
    <Layout>
      <Layout.Header className='px-5 pt-5 pb-3'>
        <Form autoComplete='off' layout='inline' size='small'>
          <Form.Item>
            <Input.Group compact style={{ width: 400 }}>
              <Select
                defaultValue={selectItem.search_type}
                showSearch
                style={{ width: '25%' }}
                onChange={(e) => setSelectItem({ search_type: e })}>
                <Select.Option value='1'>项目</Select.Option>
                <Select.Option value='2'>供应商</Select.Option>
              </Select>
              <Select
                options={selectItem?.search_type === '1' ? projectList : supplierList}
                allowClear
                value={selectItem?.name}
                onChange={(e) =>
                  setSelectItem({
                    search_type: selectItem.search_type,
                    code: e,
                    name:
                      selectItem?.search_type === '1'
                        ? projectList.find((item) => item.code === e)?.name
                        : supplierList.find((item) => item.code === e)?.name,
                  })
                }
                placeholder='请选择'
                style={{ width: '75%' }}
              />
            </Input.Group>
          </Form.Item>
          <Form.Item>
            <Button type='primary' onClick={() => onSearch()}>
              查询
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type='primary' onClick={() => onExport()} disabled={!selectItem.code}>
              导出
            </Button>
          </Form.Item>
        </Form>
      </Layout.Header>
      <Layout.Content className='px-5'>
        <div className='overflow-y-auto border border-neutral-200' style={{ height: pageHeight - 84 }}>
          {fileUrl ? (
            <ExcelPreview url={fileUrl} />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-neutral-400'>暂无数据</div>
          )}
        </div>
      </Layout.Content>
    </Layout>
  )
}
export default ProjectInventory
