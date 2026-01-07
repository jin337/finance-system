import { Message, Modal, Upload } from '@arco-design/web-react'
import { useEffect, useState } from 'react'

const UploadModal = ({ visible, title, params, onOk, onCancel, accept = 'image/*,application/pdf,.xlsx,.docx' }) => {
  const [uploadList, setUploadList] = useState([])

  // 上传文件
  const submitUpload = async (e) => {
    if (uploadList.length > 0) {
      e.stopPropagation()

      const formData = new FormData()
      uploadList.forEach((item) => {
        const name = item.uid + '#name' + item.name
        formData.append('files', item.originFile, name)
      })

      formData.append('file_info', JSON.stringify(params))

      const result = await Http.post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (result.code === 200) {
        Message.success('上传成功')
        onOk && onOk()
      } else {
        Message.error('上传失败')
      }
    } else {
      Message.error('请选择文件')
    }
  }

  // 关闭时清空文件列表
  useEffect(() => {
    if (!visible) {
      setUploadList([])
    }
  }, [visible])

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={(e) => submitUpload(e)}
      onCancel={onCancel}
      okText='确认上传'
      autoFocus={false}
      focusLock={true}>
      <div className='h-[calc(100vh/4)] overflow-y-auto'>
        <Upload
          multiple
          imagePreview
          listType='picture-card'
          fileList={uploadList}
          autoUpload={false}
          action='/'
          accept={accept}
          onChange={(files) => setUploadList(files)}
          onProgress={(file) => setUploadList((files) => files.map((x) => (x.uid === file.uid ? file : x)))}
          onRemove={(file) => setUploadList(uploadList.filter((item) => item.uid !== file.uid))}
        />
      </div>
    </Modal>
  )
}

export default UploadModal
