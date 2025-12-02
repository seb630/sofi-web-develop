import { Input, Modal } from 'antd'
import { useEffect, useState } from 'react'

const UpdateSubscriptionHistoryDescription = (props) => {

    const {open, onOk, onCancel, historyRecord} = props
    const [desc, setDesc] = useState(historyRecord?.event_description)
    useEffect(()=>setDesc(historyRecord?.event_description),[historyRecord])

    return (<Modal
        open={open}
        onCancel={onCancel}
        onOk={()=>onOk(desc)}
        title="Update subscription history description"
    >
        <Input.TextArea
            rows={4}
            value={desc}
            onChange={e=>setDesc(e.target.value)}
        />
    </Modal>)

}

export default UpdateSubscriptionHistoryDescription
