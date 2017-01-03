import React from "react"

let timeout

export class Search extends React.Component {
  onChange = (e) => {
    const { time = 250, minLength = 2, onChange } = this.props
    const val = e.target.value

    if (val && val.length < minLength) return

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(function(){
      timeout = null
      onChange(val)
    }.bind(this), time)
  }

  render(){
    return (
      <div className="pt-input-group">
        <span className="pt-icon pt-icon-search"></span>
        <input className="pt-input" type="text" placeholder="Search..." onChange={this.onChange} />
      </div>
    )
  }
}
