import React from "react"

export const Status = (props) => {
  const { status, dirty, onClick } = props
  const className = status.busy ? "saving" : (status.success === false ? "error" : "synced")
  return (
    <a id='sync-status' className={className} onClick={onClick}>
      {
        dirty
        ? <svg version="1.1" x="0px" y="0px" viewBox="776 416 368 248" >
          <path fill="#FFaaaa" d="M1065,506c-0.2,0-0.3,0-0.5,0c-4.8-50.5-47.3-90-99.1-90c-44,0-81.4,28.7-94.5,68.3c-1.7-0.1-3.3-0.1-5-0.1
            c-49.6,0-89.9,40.3-89.9,89.9c0,49.7,40.3,89.9,89.9,89.9h206v-0.3c40.4-3.5,72.1-37.4,72.1-78.7C1144,541.4,1108.6,506,1065,506z
             M1028.5,609.3c1.9,1.9,1.9,4.9,0,6.8l-18.6,18.6c-1.9,1.9-4.9,1.9-6.8,0L960,591.5l-43.1,43.1c-1.9,1.9-4.9,1.9-6.8,0L891.5,616
            c-1.9-1.9-1.9-4.9,0-6.8l43.1-43.1l-43.1-43.1c-1.9-1.9-1.9-4.9,0-6.8l18.6-18.6c1.9-1.9,4.9-1.9,6.8,0l43.1,43.1l43.1-43.1
            c1.9-1.9,4.9-1.9,6.8,0l18.6,18.6c1.9,1.9,1.9,4.9,0,6.8l-43.1,43.1L1028.5,609.3z"/>
          </svg>
        : <svg version="1.1" x="0px" y="0px" viewBox="0 0 368 248" >
            <path fill="#FFF" d="M289,90c-0.2,0-0.3,0-0.5,0c-4.8-50.5-47.3-90-99.1-90C145.4,0,108,28.7,94.9,68.3c-1.7-0.1-3.3-0.1-5-0.1
              C40.3,68.2,0,108.5,0,158.1C0,207.8,40.3,248,89.9,248h206v-0.3c40.4-3.5,72.1-37.4,72.1-78.7C368,125.4,332.6,90,289,90z
              M244.9,116.7l-83.6,83.1c-3.8,3.8-10.3,3.8-14.1,0L106.3,159c-3.8-3.8-3.8-10.3,0-14.1l9.9-9.9c3.8-3.8,10.3-3.8,14.1,0l24,24
              l66.2-66.2c3.8-3.8,10.3-3.8,14.1,0l9.9,9.9C248.6,106.4,248.6,112.9,244.9,116.7z"/>
          </svg>
      }
      <div className='loading' />
    </a>
  )
}


