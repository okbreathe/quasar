import React from "react"
import { Button, EditableText } from "@blueprintjs/core"
import { Editor, Preview, Status } from './'

export const Editable = (props) => {
  const { page, revision, field, form, status, onMount, onScroll, onUpload, onUpdate, onCancel, ui, column, onRevisions, dirty } = props
  return (
    <div>
      <header>
        <EditableText id='page-title' {...field("title")} onConfirm={onUpdate} onCancel={onCancel} placeholder="Untitled Page" />
        <Button iconName="history" className="pt-minimal" onClick={onRevisions} />
        <Status status={status.update} dirty={dirty} onClick={onUpdate} />
      </header>
      { (!revision && (column === 0 || column === 2)) && <Editor {...field("content")} onMount={onMount} onScroll={onScroll} column={column} ui={ui.settings} onDrop={onUpdate} onSave={onUpdate} onUpload={onUpload} /> }
      { (!revision && (column === 1 || column === 2)) && <Preview id='page-view' ui={ui.settings} onScroll={onScroll} content={form.state().content} /> }
      { revision && <Preview id='revision-view' ui={ui.settings} onScroll={onScroll} content={page.attributes.content} />}
      { revision && <Preview id='page-view' ui={ui.settings} onScroll={onScroll} content={revision.attributes.content} />}
    </div>
  )
}
