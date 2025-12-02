import { Form, Select, Space, Switch, Typography } from 'antd'
import { globalConstants } from '@/_constants'
import { autoAnswerInfo, hangUpInfo, inboundInfo } from '@/pages/SofiBeacon/Setting/CallSettings/CallSettingsModals'

const PSContent = (props) => {
    const {selectedRowKeys, actionForm, handleSubmit} = props
    const autoAnswer = Form.useWatch('auto_answer', actionForm)

    const buildRingsCountOptions = () => {
        const counts = [1,2,3,4,5]
        return counts.map((count)=> <Select.Option value={count} key={count}>{count===1? '1 Ring' : `${count} Rings`}</Select.Option>)
    }

    return <Space direction="vertical">
        <Typography.Text strong>
            What changes do you want to make to selected {selectedRowKeys?.length} {globalConstants.PENDANT_GENERIC}s?
        </Typography.Text>

        <Form
            preserve={false}
            form={actionForm}
            onFinish={handleSubmit}
            initialValues={{
                only_auth_number_call: false,
                only_auth_number_sms: false,
                button_hang_up: false,
                auto_answer: false
            }}
        >
            <Form.Item>
                <Space>
                    <Form.Item name="only_auth_number_call" valuePropName="checked" noStyle>
                        <Switch className="margin-right"/>
                    </Form.Item>
                    <span>Restrict inbound calls to emergency contacts only <a onClick={inboundInfo}>(What&#39;s this?)</a></span>
                </Space>
            </Form.Item>
            <Form.Item>
                <Space>
                    <Form.Item name="only_auth_number_sms" valuePropName="checked" noStyle>
                        <Switch className="margin-right"/>
                    </Form.Item>
                    <span>Restrict inbound SMS to emergency contacts only</span>
                </Space>
            </Form.Item>
            <Form.Item>
                <Space>
                    <Form.Item name="button_hang_up" valuePropName="checked" noStyle>
                        <Switch className="margin-right"/>
                    </Form.Item>
                    <span>Allow {globalConstants.BEACON_SOFIHUB} to hang up by button press <a onClick={hangUpInfo}>(What&#39;s this?)</a></span>
                </Space>
            </Form.Item>
            <Form.Item>
                <Space>
                    <Form.Item name="auto_answer" valuePropName="checked" noStyle>
                        <Switch className="margin-right"/>
                    </Form.Item>
                    <span>Auto answer inbound calls <a onClick={autoAnswerInfo}>(What&#39;s this?)</a></span>
                </Space>
            </Form.Item>
            { autoAnswer &&
            <Form.Item name="rings_before_answer" label="Auto answer after" initialValue={3}>
                <Select style={{width: 130}}>
                    {buildRingsCountOptions()}
                </Select>
            </Form.Item>
            }
        </Form>
    </Space>
}

export default PSContent
