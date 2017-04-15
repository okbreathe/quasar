import React, { PropTypes } from "react"
import { Link } from 'react-router'
import { Button } from "@blueprintjs/core"

import { pathFor } from '../lib/'

export class Library extends React.Component {
  render(){
    const { tags = [], onSettings } = this.props
    return (
      <section id='library' className='col'>
        <header>
          <h1>Quasar</h1>
          <Button iconName="menu" className="pt-minimal" onClick={onSettings} />
        </header>
        <div id='library-books'>
          <ul>
            <li>
              <Link to={pathFor("/tags/recent")} activeClassName="active">
                <span className="pt-icon pt-icon-time"/>
                Recent
              </Link>
            </li>
            <li>
              <Link to={pathFor("/tags/favorites")} activeClassName="active">
                <span className="pt-icon pt-icon-star-empty"/>
                Favorites
              </Link>
            </li>
            <li>
              <Link to={pathFor("/tags/trash")} activeClassName="active">
                <span className="pt-icon pt-icon-trash"/>
                Trash
              </Link>
            </li>
            <li>
              <Link to={pathFor("/tags/all")} activeClassName="active">
                <span className="pt-icon pt-icon-box"/>
                All Notes
              </Link>
            </li>
          </ul>
        </div>
        <div id='library-tags'>
          <ul>{
            tags.map(t => {
              return (
                <li key={t.id}>
                  <Link to={pathFor(`/tags/${t.id}`)} activeClassName="active">
                    <span className="pt-icon pt-icon-book"/>
                    {t.attributes.name}
                  </Link>
                </li>
              )
            })
          }</ul>
        </div>
      </section>
    )
  }
}

Library.propTypes = {
  tags: PropTypes.array.isRequired,
  onSettings: PropTypes.func.isRequired,
}
