import { actions } from 'mirrorx'
import {Card, Form, Modal, Select, Switch, Button, Space, Row} from 'antd'
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'
import { autoAnswerInfo, hangUpInfo, inboundInfo } from '@/pages/SofiBeacon/Setting/CallSettings/CallSettingsModals'
import { RouterPrompt } from '@/components/RouterPrompt'
import { isLife, isWatch } from '@/utility/Common'

const CallsSettingsCard = (props) => {
    const {settings, selectedBeacon, history, admin} = props
    const [form] = Form.useForm()
    const [formData, setFormData] = useState({})
    const [submitIsDisable, setSubmitIsDisable] = useState(true)

    const [showRingCount, setShowRingCount] = useState(settings?.ps_auto_answer_enabled)

    useEffect(()=> {
        const data = settings
        form.setFieldsValue(data)
        setFormData(data)
    },[settings,  form])


    const handleSubmit = (data) => {
        setSubmitIsDisable(true)
        setFormData(data)
        let payload = {}
        payload.beacon_id = selectedBeacon.pub_id
        payload.auto_answer = data.ps_auto_answer_enabled
        payload.only_auth_number_call = data.ps_only_call_from_authorised
        payload.only_auth_number_sms = data.ps_only_sms_from_authorised
        payload.button_hang_up = data.ps_button_hangup_enabled
        payload.rings_before_answer = Number.parseInt(data.ps_rings_before_auto_answer)
        // do whatever else
        actions.sofiBeacon.saveBeaconPhoneSwitches(payload).then(()=>{
            Modal.success({
                content: 'These settings may take up to 10 minutes to be applied accepted by the pendant. During this time the settings page will reflect the pendants older settings'
            })
        })
    }

    const handleChange = (changed, allValues) => {
        const currentValue_JSON = JSON.stringify(allValues)
        const formData_JSON = JSON.stringify(formData)

        if (currentValue_JSON !== formData_JSON) {
            setSubmitIsDisable(false)
        } else {
            setSubmitIsDisable(true)
        }
        setShowRingCount(allValues?.ps_auto_answer_enabled)


    }

    const onReset = () => {
        form.resetFields()
        setSubmitIsDisable(true)
    }


    const buildRingsCountOptions = () => {
        const counts = [1,2,3,4,5]
        return counts.map((count)=> <Select.Option value={count} key={count}>{count===1? '1 Ring' : `${count} Rings`}</Select.Option>)
    }

    const deviceType = isLife(selectedBeacon) ?
        globalConstants.LIFE_SOFIHUB :
        isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB

    return (
        <Card className="advanced_block" title={admin ? isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : 'Pendant Call/SMS Settings': 'Call Settings'}>
            <RouterPrompt
                when={!submitIsDisable}
                history={history}
                title="You've got unsaved changes!"
                content={'You haven\'t saved your call settings, did you want to save or go back?'}
                cancelText="Go Back"
                okText="Discard and Continue"
                onOK={() => true}
                onCancel={() => false}
            />
            <Form
                form={form}
                initialValues={formData}
                onValuesChange={handleChange}
                onFinish={handleSubmit}
            >
                {admin && <Form.Item>
                    <Space>
                        <Form.Item name="ps_only_sms_from_authorised" valuePropName="checked" noStyle>
                            <Switch className="margin-right"/>
                        </Form.Item>
                        <Row>
                            <span>Restrict inbound SMS to emergency contacts only.</span><br/>
                            <span className="dangerTitle">IMPORTANT: If you turn this setting on, the support team will be unable to debug this device in the future.</span>
                        </Row>
                    </Space>
                </Form.Item>
                }

                <Form.Item>
                    <Space>
                        <Form.Item name="ps_only_call_from_authorised" valuePropName="checked" noStyle>
                            <Switch className="margin-right"/>
                        </Form.Item>
                        <span>Restrict inbound calls to emergency contacts only <a onClick={()=>inboundInfo(selectedBeacon)}>(What&#39;s this?)</a></span>
                    </Space>
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Form.Item name="ps_button_hangup_enabled" valuePropName="checked">
                            <Switch className="margin-right"/>
                        </Form.Item>
                        <span>Allow {deviceType} to hang up by button press <a onClick={()=>hangUpInfo(selectedBeacon)}>(What&#39;s this?)</a></span>
                    </Space>
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Form.Item name="ps_auto_answer_enabled" valuePropName="checked" noStyle>
                            <Switch className="margin-right"/>
                        </Form.Item>
                        <span>Auto answer inbound calls <a onClick={autoAnswerInfo}>(What&#39;s this?)</a></span>
                    </Space>
                </Form.Item>
                {(showRingCount || form.getFieldValue('ps_auto_answer_enabled')) &&
                <Form.Item name="ps_rings_before_auto_answer" label="Auto answer after">
                    <Select style={{width: 130}}>
                        {buildRingsCountOptions()}
                    </Select>
                </Form.Item>
                }
                <Form.Item >
                    <Space className="floatRight">
                        <Button htmlType="button" onClick={onReset} disabled={submitIsDisable}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" disabled={submitIsDisable}>
                            Save
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    )
}

CallsSettingsCard.propTypes = {
    selectedBeacon: PropTypes.object.isRequired,
    settings: PropTypes.oneOfType([PropTypes.object,PropTypes.string])
}

CallsSettingsCard.defaultProps = {
    admin: false
}

export default CallsSettingsCard
