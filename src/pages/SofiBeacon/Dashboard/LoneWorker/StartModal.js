import { Col, InputNumber, Modal, Radio, Row, Typography } from 'antd'
import { useState } from 'react'

const StartModal = (props) => {
    const {open, onOk, onCancel, extend} = props
    const [session, setSession] = useState()
    const [custom, setCustom] = useState(15)

    const onRadioChange = (e)=> {
        setSession(e.target.value)
    }
    const handleSubmit = () => {
        onOk(session === 'custom' ? custom : session)
    }

    const handleCancel = () => {
        setSession()
        setCustom(15)
        onCancel()
    }

    return <Modal
        destroyOnClose
        width={300}
        open={open}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={extend? 'Extend' :'Start'}
        title={extend? null :'Start Lone Worker Session'}
    >
        <Typography.Paragraph>{extend ? 'How long should we extend for?' : 'How long would you like your session to end?'}</Typography.Paragraph>
        <Radio.Group onChange={onRadioChange} value={session}>
            <Row gutter={[8,8]}>
                <Col span={12}>
                    <Radio.Button value={30}>30 minutes</Radio.Button>
                </Col>
                <Col span={12}>
                    <Radio.Button value={60}>60 minutes</Radio.Button>
                </Col>
                <Col span={12}>
                    <Radio.Button value={90}>90 minutes</Radio.Button>
                </Col>
                <Col span={12}>
                    <Radio.Button value={120}>120 minutes</Radio.Button>
                </Col>
                <Col span={24}>
                    <Radio.Button value="custom">Custom:  {
                        session === 'custom' ? <InputNumber
                            bordered={false}
                            size="small"
                            value={custom}
                            formatter={value => `${value} minutes`}
                            parser={(value) => value.replace(' minutes', '')}
                            onChange={(v)=>setCustom(v)}
                            style={{ width: 120, marginLeft: 10 }} /> : null
                    }</Radio.Button>
                </Col>
            </Row>
        </Radio.Group>
    </Modal>
}

export default StartModal
