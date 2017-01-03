import React, { PropTypes } from "react"
import { bindActionCreators } from 'redux'
import { connect }  from 'react-redux'
import {
  Button,
  Slider,
  Switch,
  Tab2,
  Tabs2,
} from "@blueprintjs/core"
import equal from 'deep-equal'
// import { CirclePicker } from 'react-color'

import resourceActions from '../actions/resources'
import uiActions from '../actions/ui'
import {
  AutoCompletion,
  BrightThemes,
  DarkThemes,
  EditorColumns,
  EditorModes,
  Fonts,
  TabSizes,
} from '../constants'

const Input = (props) => {
  const { label = "Label", type = "text", value = "", placeholder = "", onChange = f => f, error } = props
  return (
    <div className={`pt-form-group${error ? ' pt-intent-danger' : ''}`}>
      <label className="pt-label">
        {label}
      </label>
      <div className="pt-form-content">
        <div className={`pt-input-group${error ? ' pt-intent-danger' : ''}`}>
          <input className="pt-input" onChange={onChange} type={type} value={value} placeholder={placeholder} />
        </div>
        { error && <div className="pt-form-helper-text">{error}</div> }
      </div>
    </div>
  )
}

const TypographySlider = (props) => {
  const {
    field,
    title,
    min,
    max,
    ui,
    step = 1,
    onSlide,
    onChange,
  } = props
  return (
    <div>
      <label>{title}</label>
      <Slider
        min={min}
        max={max}
        value={ui[field] || min + Math.round((max - min) / 2)}
        renderLabel={false}
        stepSize={step}
        onChange={val => onSlide(field, val)}
        onRelease={val => onChange(field, val)}
      />
      <br/>
    </div>
  )
}

const Typography = (props) => {
  const { onChange, onSlide, type, ui, full = false, fonts = Fonts} = props
  return (
    <div>
      <label className="pt-label">
        Font
        <div className="pt-select">
          <select onChange={e => onChange(`${type}.font_family`, e.target.value)} value={ui[`${type}.font_family`]}>
            {fonts.map((t,i) => <option key={i} value={t.value}>{t.name}</option>)}
          </select>
        </div>
      </label>
      <TypographySlider ui={ui} min={8} max={20} title="Font Size" field={ `${type}.font_size` } onChange={onChange} onSlide={onSlide} />
      <TypographySlider ui={ui} min={0.5} max={3} step={0.25} title="Line Height" field={ `${type}.line_height` } onChange={onChange} onSlide={onSlide} />
      { full && <TypographySlider ui={ui} min={0} max={40} title="Line Width" field={ `${type}.padding` } onChange={onChange} onSlide={onSlide} /> }
      { full && <TypographySlider ui={ui} min={0.5} max={4} step={0.25} title="Paragraph Spacing" field={ `${type}.margin_bottom.p,ul,blockquote` } onChange={onChange} onSlide={onSlide} /> }
    </div>
  )
}

const SettingsSwitch = (props) => {
  const value = props.ui[props.field]
  return <Switch label={props.label} checked={!!value} onChange={e => props.onChange(props.field, !value)}/>
}

const General = (props) => {
  const { ui, onChange } = props
  return (
    <div className='panel'>
      <SettingsSwitch label="Scroll Sync" field="scroll_sync" ui={ui} onChange={onChange} />
      <SettingsSwitch label="Line Wrap" field="line_wrap" ui={ui} onChange={onChange} />
      <SettingsSwitch label="Show Gutter" field="gutter" ui={ui} onChange={onChange} />
      <SettingsSwitch label="Show Print Margin" field="print_margin" ui={ui} onChange={onChange} />
      <SettingsSwitch label="Highlight Active Line" field="highlight_line" ui={ui} onChange={onChange} />
      <label className="pt-label">
        Auto-Completion
        <div className="pt-select">
          <select onChange={e => onChange('autocompletion', e.target.value)} value={ui.autocompletion}>
            {AutoCompletion.map((t,i) => <option key={i} value={t.value}>{t.name}</option>)}
          </select>
        </div>
      </label>
      <label className="pt-label">
        Tab Size
        <div className="pt-select">
          <select onChange={e => onChange('tab_size', e.target.value)} value={ui.tab_size}>
            {TabSizes.map((t,i) => <option key={i} value={t.value}>{t.name}</option>)}
          </select>
        </div>
      </label>
      <label className="pt-label">
        Default View
        <div className="pt-select">
          <select onChange={e => onChange('editor_column', e.target.value)} value={ui.editor_column}>
            {EditorColumns.map((t,i) => <option key={i} value={t.value}>{t.name}</option>)}
          </select>
        </div>
      </label>
      <label className="pt-label">
        Editor Mode
        <div className="pt-select">
          <select onChange={e => onChange('editor_mode', e.target.value)} value={ui.editor_mode}>
            {EditorModes.map((t,i) => <option key={i} value={t.value}>{t.name}</option>)}
          </select>
        </div>
      </label>
      {/* <label className="pt-label"> */}
      {/*   Color Palette */}
      {/*   <div className="pt-select"> */}
      {/*     <select onChange={e => onChange('palette', e.target.value)} value={ui.palette}> */}
      {/*       {Palettes.map((t,i) => <option key={i} value={t.value}>{t.name}</option>)} */}
      {/*     </select> */}
      {/*   </div> */}
      {/* </label> */}
      {/* <label className="pt-label"> */}
      {/*   UI Color */}
      {/* </label> */}
      {/* The color widget mutates the color */}
      {/* <CirclePicker onChange={(c) => onChange('ui_color', c.rgb)} color={{ ...ui.ui_color }} colors={Colors[ ui.palette ? ui.palette : 'default' ]} /> */}
    </div>
  )
}

const Preview = (props) => {
  const { ui, onChange, onSlide } = props
  return (
    <div className='panel'>
      <Typography full={true} ui={ui} type='preview' onChange={onChange} onSlide={onSlide} />
    </div>
  )
}

const Editor = (props) => {
  const { ui, onChange, onSlide } = props
  return (
    <div className='panel'>
      <label className="pt-label">
        Theme
        <div className="pt-select">
          <select onChange={e => onChange('theme', e.target.value)} value={ui.theme}>
            <optgroup label="Bright">
              {BrightThemes.map((t,i) => <option key={i} value={t.value}>{t.name}</option>)}
            </optgroup>
            <optgroup label="Dark">
              {DarkThemes.map((t,i) => <option key={i} value={t.value}>{t.name}</option>)}
            </optgroup>
          </select>
        </div>
      </label>
      <Typography ui={ui} type='editor' onChange={onChange} onSlide={onSlide} fonts={Fonts.filter(f => f.monospace)} />
    </div>
  )
}

const Account = (props)  => {
  const { form: { field, errors }, onSave } = props
  const error = errors('update')
  return (
    <div className='panel'>
      <Input label="Name" {...field('name')}  error={error.name} required />
      <Input label="Email" {...field('email')} type="email"  error={error.email} required />
      <Input label="Password"  {...field('password')} type="password" error={error.Password} />
      <Input label="Confirm Password" {...field('password_confirmation')} type="password"  error={error.password_confirmation} />
      <Button className="pt-minimal" iconName="tick" text="Update Account" onClick={() => onSave()} />
    </div>
  )
}

class Menu extends React.Component {
  constructor(props){
    super(props)
    this.state = { ...props.ui.settings }
  }

  componentWillMount() {
    this.props.form.init(this.props.current_user)
  }

  componentWillReceiveProps(props) {
    const { current_user, form } = this.props

    if (!equal(props.ui, this.props.ui)) {
      this.setState({ ...props.ui.settings })
    }

    if (!equal(props.current_user, current_user)) {
      form.init(props.current_user)
    }
  }

  onStateChange = (key, value) => this.setState({ [key] : value })

  onTabChange = tabId => this.setState({ tabId })

  render(){
    const { ui, uiActions, userActions, form } = this.props
    const updateUI = uiActions.change
    const only = (obj, keys) => keys.reduce((acc, k) => { acc[k] = obj[k]; return acc  }, {})
    const updateUser = () => userActions.update({ user: only(form.state(), ['name', 'email', 'password', 'password_confirmation']) })

    return (
      <div id='settings' className='offscreen'>
        {
          process.env.TRANSIENT
          ? <Button iconName="log-out" text="Logout" type="submit" className="pt-minimal" onClick={require('../lib/backends/transient').clearTransientStorage} />
          : <form id='logout' action="/sessions" method="POST">
              <input name="_method" type="hidden" value="delete" />
              <input type="hidden" name="_csrf_token" value={document.querySelector("#csrf").content} />
              <Button iconName="log-out" text="Logout" type="submit" className="pt-minimal" />
            </form>
        }

        <hr/>
        <Tabs2 animate={true} id='menu-nav' onChange={this.onTabChange} selecedTabId={this.state.tabId}>
          <Tab2 id="general" panel={ <General ui={ui.settings} onChange={updateUI} /> }>
            General
          </Tab2>
          <Tab2 id="editor" panel={ <Editor ui={this.state} onChange={updateUI} onSlide={this.onStateChange } /> }>
            Editor
          </Tab2>
          <Tab2 id="preview" panel={ <Preview ui={this.state} onChange={updateUI} onSlide={this.onStateChange } /> }>
            Preview
          </Tab2>
          <Tab2 id="account" panel={ <Account ui={this.state} form={form} onSave={updateUser} /> }>
            Account
          </Tab2>
        </Tabs2>
      </div>
    )
  }
}

export default connect(
  (state, _props) => ({
    ui: state.ui,
    current_user: state.current_user.entities
  }),
  dispatch => {
    const userActions = bindActionCreators(resourceActions.current_user, dispatch)
    return { form: userActions.formFor(), uiActions: bindActionCreators(uiActions, dispatch), userActions }
  }
)(Menu)
