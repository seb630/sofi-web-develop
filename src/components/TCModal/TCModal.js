import {Checkbox, Modal, Form, Typography} from 'antd'
import './tc.scss'
import PropTypes from 'prop-types'
import TCPage from '../TCPage'
import PrivacyPage from '@/components/TCPage/PrivacyPage'
import {useState} from 'react'

const TCModal = (props) => {
    const [form] = Form.useForm()

    const [tcOpen, setTcOpen] = useState(false)
    const [privacyOpen, setPrivacyOpen] = useState(false)
    const [buttonDisabled, setButtonDisabled] = useState(true)

    return <Modal
        className="TCModal"
        width={800}
        okText="OK"
        okButtonProps={{disabled: buttonDisabled}}
        open={props.modal}
        onCancel={()=>props.handleModalstate(false)}
        onOk={() => {form.validateFields().then(() => {
            form.resetFields()
            props.handleSubmit()
        })}}
        centered={true}
        title={props.title}
        destroyOnClose
    >
        <Form onFinish={props.handleSubmit} form={form}>
            {props.head}
            <Typography.Paragraph>
                You can read our <a onClick={()=>setPrivacyOpen(true)}>Privacy Policy here</a>, and you can read our <a onClick={()=>setTcOpen(true)}>Terms and Conditions here</a>.
            </Typography.Paragraph>
            <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                    {
                        validator: (_, value) =>
                            value ? Promise.resolve() : Promise.reject(new Error('Please agree the terms and conditions!')),
                    },
                ]}
            >
                <Checkbox onChange={e=>setButtonDisabled(!e.target.checked)}>I have read and agree to both the Privacy Policy and the Terms and Conditions.</Checkbox>
            </Form.Item>
            <TCPage open={tcOpen} onCancel={()=>setTcOpen(false)}/>
            <PrivacyPage open={privacyOpen} onCancel={()=>setPrivacyOpen(false)} />
        </Form>
    </Modal>
}


TCModal.propTypes = {
    title: PropTypes.string,
    head: PropTypes.node,
    content: PropTypes.node,
    handleSubmit: PropTypes.func.isRequired,
    modal: PropTypes.bool.isRequired,
    handleModalstate: PropTypes.func.isRequired,
}

export default TCModal
