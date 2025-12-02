import { Form, Slider, Space, Typography } from 'antd'
import { globalConstants } from '@/_constants'

const WMContent = (props) => {
    const {selectedRowKeys, actionForm, handleSubmit} = props
    const interval = Form.useWatch('upload_interval', actionForm)

    return <Space direction="vertical">
        <Typography.Text strong>
            What changes do you want to make to selected {selectedRowKeys?.length} {globalConstants.PENDANT_GENERIC}s?
        </Typography.Text>

        <Form
            preserve={false}
            form={actionForm}
            onFinish={handleSubmit}
            initialValues={{
                upload_interval: 10,
            }}
        >
            <h4>Update frequency: {interval} minutes</h4>
            <Form.Item name="upload_interval">
                <Slider
                    min={1}
                    max={60}
                    tipFormatter={value => (`${value} minutes`)}
                    marks={{1: '1 min', 3:'', 5: '', 10:'', 15: '15 mins', 30:'', 45:'', 60: '60 mins'}}
                />
            </Form.Item>

        </Form>
    </Space>
}

export default WMContent
