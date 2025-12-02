import { Form } from '@ant-design/compatible'
import { Button, Col, Input, message, Row } from 'antd'
import { globalConstants } from '@/_constants'
import _ from 'lodash'
import { actions } from 'mirrorx'
import { isLife, isWatch } from '@/utility/Common'

const userStep = (selectedBeacon, form, next, prev) =>{
    const { getFieldDecorator } = form
    let loading = false
    const save = () => {
        form.validateFields((err, values) => {
            if (!err) {
                let data = _.extend({}, selectedBeacon, {
                    display_name: values.display_name,
                    first_name: values.first_name,
                    last_name: values.last_name
                })
                loading = true
                actions.sofiBeacon.saveBeaconInfor(data).then(() => {
                    loading = false
                    next()
                    message.success('Saved successfully !!', 3)
                }).catch(err => {
                    loading = false
                    err.global_errors.forEach(e => {
                        message.error(e.message, 3)
                    })
                })
            }
        })
    }

    const title = `${globalConstants.PENDANT_GENERIC} User`
    const name =  isLife(selectedBeacon) ? globalConstants.LIFE_SOFIHUB : 
        isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB
    const content = <div className="wizardContent">
        <div>Who is going to be using the {name}?</div>
        <Form layout="inline">
            <Form.Item >
                {
                    getFieldDecorator('first_name', {
                        rules: [{ required: true, message: globalConstants.REQUIRED_FIRSTNAME },],
                        initialValue: selectedBeacon && selectedBeacon.first_name
                    })(
                        <Input placeholder="First name" className="margin-bottom firstnameInput"/>
                    )
                }
            </Form.Item>
            <Form.Item>
                {
                    getFieldDecorator('last_name', {
                        rules: [{ required: true, message: globalConstants.REQUIRED_LASTNAME },],
                        initialValue:  selectedBeacon && selectedBeacon.last_name
                    })(
                        <Input placeholder="Last name" className="margin-bottom firstnameInput"/>
                    )
                }
            </Form.Item>

            <div>What should the {name} display name be?</div>

            <Form.Item>
                {
                    getFieldDecorator('display_name', {
                        rules: [{ required: true, message: globalConstants.REQUIRED_BEACON_NAME },],
                        initialValue: selectedBeacon && selectedBeacon.display_name
                    })(
                        <Input placeholder={`${name} display name`} className="margin-bottom displayNameInput"/>
                    )
                }
            </Form.Item>

            <p>The {name} &quot;display name&quot; is what you&#39;ll see when you try to find the device on the portal.
                SOFIHUB recommends the display name should look something like &quot;Mary Smith&#39;s Pendant&quot; so that you can easily find.
            </p>
        </Form>
    </div>

    const action = <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={prev}>
        Previous
    </Button>
    <Button
        type="primary"
        onClick={save}
        disabled = {loading}
        className="floatRight">Next</Button></Col>
    </Row>

    return {title,content, action}
}

export default userStep
