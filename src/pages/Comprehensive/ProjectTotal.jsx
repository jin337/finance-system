import { useEffect, useState } from 'react'

import { Button, Form, Layout, Select } from '@arco-design/web-react'
import { useSelector } from 'react-redux'

// 公共方法
import { downloadFile } from 'src/utils/common'
// 组件
import ExcelPreview from 'src/components/ExcelPreview'

const ProjectTotal = () => {
  const [selectItem, setSelectItem] = useState(null)
  const { currentCompany, pageHeight } = useSelector((state) => state.commonReducer)
  const [projectList, setProjectList] = useState([])

  const [fileUrl, setFileUrl] = useState(null)

  // 导出
  const onExport = async () => {
    const params = {
      groupid: currentCompany.id,
      project_code: selectItem.code,
      project_name: selectItem.name,
      htmoney: selectItem.htmoney,
    }
    const result = await Http.post('/query/performance/export', params, { responseType: 'blob' })
    downloadFile(result, '项目总台账_' + selectItem.name, 'xlsx')
  }

  // 查询
  const onSearch = async () => {
    if (selectItem.code) {
      const params = {
        groupid: currentCompany.id,
        project_code: selectItem.code,
        project_name: selectItem.name,
        htmoney: selectItem.htmoney,
      }
      const result = await Http.post('/query/performance/export', params, { responseType: 'blob' })

      const blob_excel = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      if (blob_excel) {
        const excel = URL.createObjectURL(blob_excel)
        setFileUrl(excel)
      }
    }
  }

  const onChangeSelect = (e) => {
    const item = projectList.find((item) => item.value === e)
    setSelectItem(item)
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

  useEffect(() => {
    if (currentCompany) {
      getProjectList()
    }
  }, [currentCompany])

  return (
    <Layout>
      <Layout.Header className='px-5 pt-5 pb-3'>
        <Form autoComplete='off' layout='inline' size='small'>
          <Form.Item label='综合查询'>
            <Select
              options={projectList}
              allowClear
              placeholder='请选择'
              style={{ width: 250 }}
              onChange={(e) => onChangeSelect(e)}
            />
          </Form.Item>
          <Form.Item>
            <Button type='primary' onClick={() => onSearch()}>
              查询
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type='primary' onClick={() => onExport()} disabled={!selectItem}>
              导出
            </Button>
          </Form.Item>
          <Form.Item>
            <div>{selectItem?.htmoney ? '合同金额:' + selectItem?.htmoney : null}</div>
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
export default ProjectTotal
