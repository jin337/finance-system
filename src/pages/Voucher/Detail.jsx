import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

const VoucherDetail = () => {
  const params = useParams()
  const { id } = params
  const [info, setInfo] = useState({})

  const getInfo = async (id) => {
    const { code, data } = await Http.post(`/proof/info/${id}`)
    if (code === 200) {
      setInfo(data || {})
    }
  }

  useEffect(() => {
    if (id !== 'create') {
      getInfo(id)
    }
  }, [id])

  return <>VoucherDetail</>
}
export default VoucherDetail
