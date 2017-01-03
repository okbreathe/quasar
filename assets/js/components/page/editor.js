import React, { PropTypes } from "react"
import DropZone from 'react-dropzone'
import AceEditor from 'react-ace'
import 'brace/ext/language_tools'
import 'brace/mode/markdown'
import 'brace/keybinding/vim'
import 'brace/keybinding/emacs'
import "brace/theme/ambiance"
import "brace/theme/chaos"
import "brace/theme/chrome"
import "brace/theme/clouds_midnight"
import "brace/theme/eclipse"
import "brace/theme/github"
import "brace/theme/idle_fingers"
import "brace/theme/mono_industrial"
import "brace/theme/monokai"
import "brace/theme/pastel_on_dark"
import "brace/theme/solarized_dark"
import "brace/theme/solarized_light"
import "brace/theme/terminal"
import "brace/theme/textmate"
import "brace/theme/tomorrow"
import "brace/theme/tomorrow_night"
import "brace/theme/tomorrow_night_blue"
import "brace/theme/tomorrow_night_bright"
import "brace/theme/tomorrow_night_eighties"
import "brace/theme/twilight"
import "brace/theme/vibrant_ink"
import "brace/theme/xcode"
import { Position, Toaster } from "@blueprintjs/core"

import { StyleUnits } from '../../constants'

const Toast = Toaster.create({
  position: Position.TOP_CENTER,
})

const uploadText = (files, length = 20, ellipsis = "...") => {
  const [first, ...rest] = files,
        file_name = first.name,
        str_length = (length - ellipsis.length),
        [name, ext] = file_name.split(".")
  return `${name.length > str_length  ? name.slice(0, str_length) + ellipsis + ext : file_name }${rest.length ? " and " + rest.length + " others" : ""}`
}

const generateLinks = (included) => included.map(f => generateLink(f.attributes)).join("\n")

function generateLink(attrs){
  const { file: { file_name }, urls: { original }, uploaded_as } = attrs
  return `![${uploaded_as || file_name}](${encodeURI(original)})`
}

function getRatio(editor) {
  const renderer  = editor.renderer,
        maxTop    = renderer.layerConfig.maxHeight - renderer.$size.scrollerHeight + renderer.scrollMargin.bottom,
        scrollTop = editor.getSession().getScrollTop()
  return scrollTop / maxTop
}

export class Editor extends React.Component {
  componentWillMount() {
    if (this.props.ui) this.applyStyles(this.props.ui)
  }

  componentDidMount(){
    const { onMount, onSave } = this.props
    if (onMount) onMount(this.refs.editor.editor)
    // Bind :w to save
    const ace = require("brace")
    const Vim = ace.acequire('ace/keyboard/vim').CodeMirror.Vim
    Vim.defineEx('write', 'w', (cm, input) => onSave())
  }

  applyStyles(ui){
    const stylesheet = this.stylesheet(),
          rules = []

    Object.keys(ui).forEach(k => {
      if (/^editor\./.test(k)) {
        const [id, property, children] = k.split(".")
        const val = ui[k]
        const unit  = StyleUnits[property] || ''
        const value = typeof unit == "function" ? unit(val) : `${val}${unit}`
        if (!children) rules.push(`${property.replace("_", "-")}: ${value};`)
      }
    })

    stylesheet.sheet.addRule("#editor", rules.join(" "), 0)
  }

  stylesheet() {
    let stylesheet = document.getElementById('editor-style')

    if (stylesheet) document.head.removeChild(stylesheet)

    stylesheet = document.createElement('style')
    stylesheet.id = "editor-style"
    stylesheet.type = "text/css"

    document.head.appendChild(stylesheet)

    return stylesheet
  }

  componentWillReceiveProps(props) {
    if (props.id != this.props.id)         this.refs.editor.editor.getSession().setScrollTop(0)
    if (props.column != this.props.column) this.refs.editor.editor.resize()
    if (props.ui != this.props.ui)         this.applyStyles(props.ui)
  }

  onDrop(acceptedFiles, _rejectedFiles) {
    const fd = new FormData()
    const { onUpload, onDrop } = this.props
    const { editor } = this.refs.editor
    const key = Toast.show({ message: `Uploading ${uploadText(acceptedFiles)}`, className: "pt-dark", timeout: 0 })

    acceptedFiles.forEach(f => fd.append("upload[file][]", f, f.name))

    onUpload(fd)
      .then(resp => {
        const { payload: { included } } = resp
        if (editor) editor.session.insert(editor.selection.getCursor(), generateLinks(included))
        setTimeout(function(){ Toast.dismiss(key) }, 1000)
        if (onDrop) onDrop()
      })
  }

  render(){
    const { value, ui, onScroll, onChange, width = "100%", height = "100%" } = this.props
    const keyboard = {}
    // There is no "normal" mode
    if (ui.editor_mode) keyboard['keyboardHandler'] = ui.editor_mode

    return (
      <div id='page-edit' className='page-panel'>
        <DropZone ref='dropzone' id='editor-container' className='editor-container' onDrop={(a,b) => this.onDrop(a,b)} disableClick={true}>
          <AceEditor
            {...this.props}
            theme={ ui.theme || "monokai" }
            {...keyboard}
            ref="editor"
            onChange={onChange}
            wrapEnabled={!!ui.line_wrap}
            showGutter={!!ui.gutter}
            showPrintMargin={!!ui.print_margin}
            highlightActiveLine={!!ui.highlight_line}
            enableBasicAutocompletion={ui.autocompletion == "1" || ui.autocompletion == "2"}
            enableLiveAutocompletion={ui.autocompletion == "2"}
            tabSize={parseInt(ui.tab_size || 4)}
            name="editor"
            mode="markdown"
            onScroll={e => onScroll(e, getRatio(e))}
            editorProps={{$blockScrolling: Infinity}}
            value={value}
            width={width}
            height={height}
          />
        </DropZone>
      </div>
    )
  }
}

Editor.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onDrop: PropTypes.func,
  onUpload: PropTypes.func,
  ui: PropTypes.object.isRequired,
}
