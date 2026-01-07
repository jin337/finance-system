import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

// 组件
import ExcelPreview from 'src/components/ExcelPreview'
const ExcelView = () => {
  const { id } = useParams()
  const [fileUrl, setFileUrl] = useState('')

  const init = async () => {
    setFileUrl('')

    const result = await Http.get('/excel/view/' + id, { responseType: 'blob' })
    const blob_excel = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    if (blob_excel) {
      const excel = URL.createObjectURL(blob_excel)
      setFileUrl(excel)
    }
  }

  useEffect(() => {
    if (!id) return
    init()
  }, [id])

  return <div className='h-screen w-screen'>{fileUrl && <ExcelPreview url={fileUrl} />}</div>
}
export default ExcelView
