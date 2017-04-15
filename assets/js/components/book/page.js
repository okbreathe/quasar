import React from "react"
import format from 'date-fns/format'
import { Link } from 'react-router'

import { Formats } from '../../constants'
import { pathFor } from '../../lib'

export const Page = (props) => {
  const { page, tag } = props
  const attrs = page.attributes
  return(
    <li className='page-title'>
      <Link to={pathFor(`/tags/${typeof(tag) == "object" ? tag.id : tag}/pages/${page.id}`)} activeClassName="active">
        {attrs.title || "Untitled Page"}
        <div className='meta'>
          <time>{format(attrs.inserted_at, Formats.DATE_MDY)}</time>
        </div>
      </Link>
    </li>
  )
}
