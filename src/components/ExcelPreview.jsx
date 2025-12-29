import jsPreviewExcel from '@js-preview/excel'
import '@js-preview/excel/lib/index.css'
import { useEffect } from 'react'

const ExcelPreview = ({ url }) => {
  useEffect(() => {
    const myExcelPreviewer = jsPreviewExcel.init(document.getElementById('excel-preview'))
    myExcelPreviewer
      .preview(url)
      .then(() => {
        console.log('预览完成')
      })
      .catch((e) => {
        console.log('预览失败', e)
      })
  }, [url])

  return <div className='h-full w-full' id='excel-preview'></div>
}

export default ExcelPreview
