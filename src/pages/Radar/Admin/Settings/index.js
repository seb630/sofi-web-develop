import { Button, Card, Form, Input, message, notification, Select } from 'antd'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { actions } from 'mirrorx'
import { EditOutlined, SaveOutlined } from '@ant-design/icons'
import { globalConstants } from '@/_constants'

const RadarSettingAdminCard = (props) => {
    const { settings } = props
    const [editing, setEditing] = useState(false)
    const [form] = Form.useForm()

    const formItemLayout = {
        labelCol: {
            xs: {
                span: 24,
            },
            sm: {
                span: 6,
            },
        },
        wrapperCol: {
            xs: {
                span: 24,
            },
            sm: {
                span: 18,
            },
        },
    }

    const onFinish = (values) => {
        return actions.radar.updateradarConfig(values).then(()=>{
            successNotification()
            setEditing(false)
        }).catch(err=>{
            message.error(`Validate Failed: ${err.error_message}`)
        })
    }

    const successNotification = () =>{
        notification.success({
            key:'1',
            duration: 6,
            message: 'Update success!',
            description: `We will restart your ${globalConstants.RADAR_HOBA} in 60 seconds for these changes to take effect.`,
            btn: (<Button type="primary" size="small" onClick={() => {
                notification.close('1')
                actions.radar.rebootRadar(settings.id).then(()=>message.success('Restart success!'))
            }}>
                Restart Now
            </Button>)
        })
    }

    const renderExtraButton = (isEditing) => (
        isEditing ? <Button
            type="primary"
            onClick={()=>form.submit()}
            icon={<SaveOutlined/>}
        >Save</Button> : <Button
            type="primary"
            disabled
            onClick={()=>setEditing(true)}
            icon={<EditOutlined/>}
        >Edit</Button>
    )

    return (<Card
        className="beacon-card"
        title={`${globalConstants.RADAR_HOBA} All Settings`}
        extra={renderExtraButton(editing)}
    >
        <Form
            form={form}
            onFinish={onFinish}
            initialValues={settings}
            {...formItemLayout}

        >
            {Object.keys(settings)?.map((field, i) => {
                return (
                    <Form.Item
                        name={field}
                        label={field}
                        key={i}
                    >
                        {field==='alarm_type' ? <Select id={field} disabled={!editing} style={{width: '300px'}}>
                            <Select.Option key='NO_ALARM' value='NO_ALARM'>NO_ALARM</Select.Option>
                            <Select.Option key='FALL_ALARM' value='FALL_ALARM'>FALL_ALARM</Select.Option>
                        </Select> :
                            <Input id={field} disabled={!editing || field==='radar_id'} style={{width: '300px'}} />
                        }
                    </Form.Item>
                )
            })}
        </Form>

    </Card>)

}

RadarSettingAdminCard.propTypes = {
    settings: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.string]),
}

export default (RadarSettingAdminCard)
