import { cloneElement } from 'react'
const CustomizeIcon = ({ icon, color }) => {
  return cloneElement(icon, {
    fill: color,
    stroke: color,
    style: {
      ...icon.props.style,
      fill: color,
      stroke: color,
      color: color,
    },
    className: `${icon.props.className || ''} !text-[${color}]`.trim(),
  })
}
export default CustomizeIcon
