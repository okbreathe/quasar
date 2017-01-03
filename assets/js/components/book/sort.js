import React from "react"
import {
    Button,
    Menu,
    MenuItem,
    MenuDivider,
    Popover,
    Position
} from "@blueprintjs/core"

const humanizedFields = {
  title: "Title",
  inserted_at: "Created",
  updated_at: "Updated",
  asc: 'Ascending',
  desc: 'Descending',
}

export const Sort = (props) => {
  const { ui, onChange } = props

  const ToggleMenu = (
    <Menu>
      <MenuItem text={humanizedFields.title} onClick={_ => onChange('title')} />
      <MenuItem text={humanizedFields.inserted_at} onClick={_ => onChange('inserted_at')}/>
      <MenuItem text={humanizedFields.updated_at} onClick={_ => onChange('updated_at')}/>
      <MenuDivider />
      <MenuItem text={humanizedFields.asc} onClick={_ => onChange(null, 'asc')}/>
      <MenuItem text={humanizedFields.desc} onClick={_ => onChange(null, 'desc')}/>
    </Menu>
  )

  return (
    <div id='book-sort'>
      <Popover content={ToggleMenu} position={Position.BOTTOM}>
        <Button text={`Sort by ${humanizedFields[ui.field]}`} iconName={ui.direction == 'ASC' ? 'chevron-up' : 'chevron-down'} className="pt-minimal" />
      </Popover>
    </div>
  )
}
