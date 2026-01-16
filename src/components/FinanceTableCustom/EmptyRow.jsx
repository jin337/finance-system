import { Empty } from '@arco-design/web-react'
import { IconPlusCircle } from '@arco-design/web-react/icon'
import { memo } from 'react'

const EmptyRow = memo(({ onAdd }) => (
  <tr>
    <td colSpan='24' className='empty'>
      <div className='operate'>
        <div className='btn'>
          <IconPlusCircle onClick={onAdd} />
        </div>
      </div>
      <Empty />
    </td>
  </tr>
))

EmptyRow.displayName = 'EmptyRow'

export default EmptyRow
