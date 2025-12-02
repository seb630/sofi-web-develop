import { Fragment, useState } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Button, Card, Col, Input, message, Row, Select } from 'antd'
import { globalConstants } from '@/_constants'
import _ from 'lodash'
import { actions } from 'mirrorx'
import '../hubWelcomeWizard.scss'
import { buildCountryOptions, buildTimezoneOptions, getCountryCode, getTimeZone } from '@/utility/Countries'

const UserStepContent = (props) => {
    const [ctn, setCtn] = useState(false)
    const [autoChangeDisplayName, setAutoChangeDisplayName] = useState(false)
    const {selectedHub, form, settings, next, prev} = props
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form

    const saveName = () => {
        form.validateFields((err, values) => {
            if (!err) {
                let payload = {
                    display_name: values.display_name,
                    hub_id: selectedHub.hub_id
                }
                let data = _.cloneDeep(settings)
                data.resident_profile.first_name = values.first_name
                data.resident_profile.last_name = values.last_name
                let promises = []
                promises.push(actions.hub.updateHubName(payload))
                promises.push(actions.setting.saveSettings({hubId: selectedHub.hub_id, settings: data}))
                Promise.all(promises).then(() => {
                    setCtn(true)
                    message.success('Saved successfully !!', 3)
                }).catch(err => {
                    message.error(err.message, 3)
                })
            }
        })
    }

    const saveAddress = () => {
        form.validateFields((err, values) => {
            if (!err) {
                let data = _.cloneDeep(settings)
                data.location.country = values.country
                data.location.region = values.region
                data.location.city = values.city
                data.location.postcode = values.postcode
                data.preferences.speaker_spaces[0] = values.speaker_spaces
                data.preferences.timezone = values.timezone
                actions.setting.saveSettings({hubId: selectedHub.hub_id, settings: data}).then(() => {
                    setCtn(false)
                    next()
                    message.success('Saved successfully !!', 3)
                }).catch(err => {
                    err.global_errors.forEach(e => {
                        message.error(e.message, 3)
                    })
                })
            }
        })
    }

    const handleTimeZoneChange = (value) =>{
        setFieldsValue({country: getCountryCode(value)})
    }

    const handleCountryChange = (value) =>{
        setFieldsValue({timezone: getTimeZone(value)})
    }

    const changeDisplayName = () => {
        const displayName = getFieldValue('display_name')
        const macRegex = new RegExp('^([0-9A-Fa-f]{2}[:-]){2}([0-9A-Fa-f]{2})\\s+Hub$')
        if (macRegex.test(displayName) || autoChangeDisplayName){
            setAutoChangeDisplayName(true)
            setFieldsValue({
                display_name: `${getFieldValue('first_name')} ${getFieldValue('last_name')}'s Hub`
            })
        }
    }

    const checkName = (rule, value, callback) => {
        const nameRegex = new RegExp('^([0-9A-Fa-f]{2}){2}([0-9A-Fa-f]{2})$')
        if (value && nameRegex.test(value) || value?.toLowerCase() === 'default') {
            callback('You must update this value!')
        } else {
            callback()
        }
    }

    const renderNames = () => {
        return <div className="wizardContent">
            <div>Who is going to be using the hub?</div>
            <Form layout="inline">
                <Form.Item >
                    {
                        getFieldDecorator('first_name', {
                            rules: [
                                { required: true, message: globalConstants.REQUIRED_FIRSTNAME },
                                { validator: checkName},
                            ],
                            initialValue: settings && settings.resident_profile.first_name
                        })(
                            <Input
                                placeholder="First name"
                                className="margin-bottom firstnameInput"
                                onBlur={changeDisplayName}
                            />
                        )
                    }
                </Form.Item>
                <Form.Item>
                    {
                        getFieldDecorator('last_name', {
                            rules: [
                                {required: true, message: globalConstants.REQUIRED_LASTNAME },
                                { validator: checkName},
                            ],
                            initialValue: settings && settings.resident_profile.last_name
                        })(
                            <Input
                                placeholder="Last name"
                                className="margin-bottom firstnameInput"
                                onBlur={changeDisplayName}
                            />
                        )
                    }
                </Form.Item>

                <div>What should the hub be called?</div>

                <Form.Item>
                    {
                        getFieldDecorator('display_name', {
                            rules: [{ required: true, message: globalConstants.REQUIRED_BEACON_NAME },],
                            initialValue: selectedHub && selectedHub.display_name
                        })(
                            <Input
                                placeholder="Hub display name"
                                className="margin-bottom displayNameInput"
                                onChange={()=>setAutoChangeDisplayName(false)}
                            />
                        )
                    }
                </Form.Item>

                <p>This is the {globalConstants.HUB_SOFIHUB}&#39;s &quot;display name&quot; and this is what you&#39;ll see when you try to
                    find this device on the portal. SOFIHUB recommends the display name should include the person&#39;s first and last
                    name, example &quot;Mary Smith&#39;s Hub&quot;</p>
            </Form>
        </div>
    }

    const renderAddress = () => {
        const firstName = settings && settings.resident_profile.first_name
        const lastName = settings && settings.resident_profile.last_name
        const formItemLayout = {
            labelCol: { xs: 24, sm: 10 },
            wrapperCol: { xs: 24, sm: 14 },
        }
        const Option = Select.Option
        const countryOptions = buildCountryOptions()
        const timezoneOptions = buildTimezoneOptions()

        return (
            <Fragment>
                <h4>Tell us a bit more about {firstName+' '+lastName}...</h4>
                <Card title={`Where does ${firstName} live?`} size="small" className="margin-bottom">
                    <Row gutter={16}>
                        <Col xs={24} lg={12}>
                            <Form colon={false} {...formItemLayout} className="noBottomMargin">
                                <Form.Item label="What timezone?">
                                    {
                                        getFieldDecorator('timezone', {
                                            initialValue: settings?.preferences?.timezone
                                        })(
                                            <Select
                                                optionFilterProp="title"
                                                showSearch
                                                onChange={handleTimeZoneChange}
                                            >{timezoneOptions}
                                            </Select>
                                        )
                                    }
                                </Form.Item>

                                <Form.Item label="What country?">
                                    {
                                        getFieldDecorator('country', {
                                            initialValue: settings && settings.location.country
                                        })(
                                            <Select
                                                optionFilterProp="title"
                                                showSearch
                                                onChange={handleCountryChange}
                                            >{countryOptions}</Select>
                                        )
                                    }
                                </Form.Item>
                                <Form.Item label="What region/state?">
                                    {
                                        getFieldDecorator('region', {
                                            initialValue: settings && settings.location.region
                                        })(
                                            <Input placeholder="Region" />
                                        )
                                    }
                                </Form.Item>

                                <Form.Item label="What city?">
                                    {
                                        getFieldDecorator('city', {
                                            initialValue: settings && settings.location.city
                                        })(
                                            <Input placeholder="City" />
                                        )
                                    }
                                </Form.Item>

                                <Form.Item label="What's the post code?">
                                    {
                                        getFieldDecorator('postcode', {
                                            initialValue: settings && settings.location.postcode
                                        })(
                                            <Input placeholder="Postcode" />
                                        )
                                    }
                                </Form.Item>

                            </Form>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Row type="flex" gutter={16}>
                                <Col xs={6} lg={3}>
                                    <InfoCircleOutlined className="infoIconStep" />
                                </Col>
                                <Col xs={18} lg={21}>
                                    <span>Why do we need this information?</span>
                                    <p>{globalConstants.HUB_SOFIHUB} can provide weather reports based on your location. Additionally this information can help during calls
                                        with {globalConstants.HUB_SOFIHUB}.</p>
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </Card>
                <Card title="Where will the hub be in the home?"size="small" className="margin-bottom">
                    <Row gutter={16}>
                        <Col xs={24} lg={12}>
                            <Form colon={false} {...formItemLayout} className="noBottomMargin">
                                <Form.Item label="Which room?">
                                    {
                                        getFieldDecorator('speaker_spaces', {
                                            initialValue: settings && settings.preferences.speaker_spaces[0]
                                        })(
                                            <Select>
                                                <Option value="">Select a room</Option>
                                                <Option value="Kitchen">Kitchen</Option>
                                                <Option value="Lounge Room">Lounge Room</Option>
                                                <Option value="Bedroom">Bedroom</Option>
                                                <Option value="Bathroom">Bathroom</Option>
                                                <Option value="Spare Room">Spare Room</Option>
                                            </Select>
                                        )
                                    }
                                </Form.Item>

                            </Form>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Row type="flex" gutter={16}>
                                <Col xs={6} lg={3}>
                                    <InfoCircleOutlined className="infoIconStep" />
                                </Col>
                                <Col xs={18} lg={21}>
                                    <span>Where should you install the {globalConstants.HUB_SOFIHUB}?</span>
                                    <p>Sofihub recommends the {globalConstants.HUB_SOFIHUB} be placed in the kitchen or living room.</p>
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                </Card>
            </Fragment>
        )
    }

    return (
        <Fragment>
            {ctn ? renderAddress() : renderNames()}
            <Row><Col span={24}><Button style={{ marginLeft: 8 }} onClick={ ()=> {ctn ? setCtn(false) : prev() }}>
                Previous
            </Button>
            <Button
                type="primary"
                onClick={()=>{ctn? saveAddress(): saveName() }}
                className="floatRight">Next</Button>
            </Col>
            </Row>
        </Fragment>

    )
}

const userStep = (selectedHub, form, settings, next, prev) =>{
    const title = 'Hub User'
    const content = <UserStepContent form={form} selectedHub={selectedHub} settings={settings} next={next} prev={prev}/>
    return {title,content}
}

export default userStep
