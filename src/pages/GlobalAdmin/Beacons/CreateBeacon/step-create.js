import { Fragment, useEffect, useRef, useState } from 'react'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'
import { Alert, Button, Divider, Form, Input, message, Modal, notification, Select, Spin, Switch } from 'antd'
import PhoneInput from 'react-phone-number-input'
import { globalConstants } from '@/_constants'
import Media from 'react-media'
import { getExpireStorage, retrieveJSONData, setExpireStorage, storeJSONData } from '@/utility/Storage'
import { buildTimezoneOptions } from '@/utility/Countries'
import { titleCase } from 'change-case'
import ContractOptions from '@/pages/Subscription/ContractDetailForm'

const CreateBeaconCreateForm = (props) => {
    const { onCancel, open, width, beaconModels, APNs, subscriptionStatus } = props
    const [imeiWarning, setImeiWarning] = useState(false)
    const [prefillName, setPrefillName] = useState(true)
    const [form] = Form.useForm()
    // const statusValue = Form.useWatch('subscription_status', form)
    const [statusValue, setStatusValue] = useState('')

    const inputRef = useRef(null)

    useEffect(() => setTimeout(() => inputRef?.current?.focus(), 1000), [open, inputRef])

    const onValuesChange = (changedValues) => {
        changedValues?.subscription_status && setStatusValue(changedValues.subscription_status)
    }

    /** reset modal */
    const resetModal = () => {
        form.resetFields()
        setImeiWarning(false)
        setPrefillName(true)

    }

    /** handle IMEI blur */
    const handleIMEIBlur = () => {
        const values = form.getFieldsValue()
        setImeiWarning(values.imei?.length < globalConstants.IMEI_MAX_LENGTH)
    }

    /** handle Save */
    const handleSave = (gotoDevice) => {
        const { onNext } = props
        form.validateFields().then(async values => {
            try {
                values.oobe_state = values.oobe_state ? 'reset' : 'claim'
                values.archived = false
                var resp = await actions.sofiBeacon.createBeacon(values)
                console.log(resp)
                actions.sofiBeacon.fetchAllBeacons()
                resetModal()
                onNext(resp, values, gotoDevice)
            } catch (err) {
                console.log(err)
                err.global_errors?.length > 0 ? err.global_errors.map(item => {
                    message.error(`${item}`)
                }) : notification.error({ message: 'Create Failed', description: err.status === 409 ? 'IMEI exists' : '' })
            }
        }).catch((info) => {
            message.error('Validate Failed:', info)
        })

    }

    const buildOrgOptions = () => {
        const { orgs } = props
        const defaultOption = <Select.Option key={null} value={null}>Do not add to an organisation</Select.Option>
        return [defaultOption].concat(orgs?.map(org => <Select.Option key={org.organization_id} value={org.organization_id}>{org.name}</Select.Option>))
    }

    const timezones = buildTimezoneOptions()

    const organisations = buildOrgOptions()

    const beaconModelOptions = beaconModels?.map(model => (
        <Select.Option key={model.name} value={model.name}>{model.name}</Select.Option>
    ))

    let apnOptions = APNs?.map(apn => (
        <Select.Option key={apn.id} value={apn.id}>{apn.apn_name}</Select.Option>
    ))

    apnOptions?.unshift(<Select.Option key={'null'} value={null}>Not Set</Select.Option>)

    let subscriptionOptions = subscriptionStatus?.map(status => (
        <Select.Option key={status} value={status}>{status}</Select.Option>
    ))

    subscriptionOptions?.unshift(<Select.Option key={'null'} value={null}>Not Set</Select.Option>)

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 8 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        }
    }

    const checkBoxItemLayout = {
        labelCol: {
            span: 8
        },
        wrapperCol: {
            span: 8
        }
    }

    const footer = (<Media query="(max-width: 768px)">
        {(isMobile) => {
            return isMobile ? (<Fragment>
                <div style={{ marginBottom: '5px' }}> <Button block key="SaveAndCancel" id="btnSaveAndCancel" type="primary" onClick={() => handleSave(false)}>Save and Close</Button> </div>
                <div style={{ marginBottom: '5px' }}>
                    <Button block key="SaveAndAdd" id="btnSaveAndAdd" type="primary" onClick={() => handleSave(true)}>
                        Save and go to device
                    </Button> </div>
                <div style={{ marginBottom: '5px' }}> <Button block key="back" onClick={onCancel}>Cancel</Button> </div>
            </Fragment>)
                : (<div className="d-flex justify-content-between">
                    <Button key="back" onClick={onCancel}>Cancel</Button>
                    <div>
                        <Button key="SaveAndCancel" id="btnSaveAndCancel" type="primary" onClick={() => handleSave(false)}>Save and Close</Button>
                        <Button key="SaveAndAdd" id="btnSaveAndAdd" type="primary" onClick={() => handleSave(true)}>Save and go to device</Button>
                    </div>
                </div>)
        }}
    </Media>)

    return (
        <Modal
            width={width}
            open={open}
            onCancel={onCancel}
            title={`Create a new ${globalConstants.PENDANT_GENERIC}`}
            destroyOnClose
            footer={footer}>
            <p>Step 1: Create a {globalConstants.PENDANT_GENERIC} </p>
            <Spin spinning={false}>
                <Form
                    labelWrap
                    form={form}
                    onValuesChange={onValuesChange}
                    initialValues={{
                        prefix: retrieveJSONData('beaconPrefix') || 'Pendant',
                        phone: '+61400000000',
                        model: getExpireStorage('beaconModel') || 'ev07bl',
                        apn: getExpireStorage('beaconAPN') || null,
                        oobe_state: getExpireStorage('!beaconOOBE') ? !getExpireStorage('!beaconOOBE') : true,
                        subscription_status: getExpireStorage('beaconSubscription') || null,
                        timezone: getExpireStorage('timezone') || null,
                        organisation: getExpireStorage('organisation') || null,
                        archived: false,
                        condition: 'NONE',
                        contract: 12,
                    }}
                    {...formItemLayout}
                >
                    <Form.Item label="Name Prefix" name="prefix" >
                        <Input
                            maxLength={globalConstants.INPUT_MAX_LENGTH}
                            onChange={(e) => storeJSONData('beaconPrefix', e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item
                        validateTrigger="onChange"
                        label="IMEI"
                        name="imei"
                        rules={[
                            { required: true, message: 'Please enter IMEI number!' },
                            { max: globalConstants.IMEI_MAX_LENGTH, message: 'IMEI has maximum of 15 characters.' },
                            { pattern: new RegExp(/^\d+$/), message: 'IMEI is only digits.' }
                        ]}
                    >
                        <Input
                            ref={inputRef}
                            maxLength={globalConstants.INPUT_MAX_LENGTH}
                            onBlur={handleIMEIBlur}
                            onChange={e => {
                                prefillName && form.setFieldsValue({ display_name: form.getFieldValue('prefix') + ' ' + e.target.value })
                            }}
                            autoFocus
                        />
                    </Form.Item>
                    {
                        imeiWarning && <Alert showIcon={true} style={{ marginTop: '15px' }} message={globalConstants.ADD_IMEI_WARNING} type="warning" />
                    }
                    <Form.Item label={`${titleCase(globalConstants.PENDANT_GENERIC)} Name`} name="display_name" rules={[{ required: true, message: `Please enter ${globalConstants.PENDANT_GENERIC} name!` }]}>
                        <Input
                            maxLength={globalConstants.INPUT_MAX_LENGTH}
                            onChange={() => setPrefillName(false)}
                        />
                    </Form.Item>

                    <Form.Item label="Phone" name="phone" rules={[{ required: true, message: 'Please enter phone number!' }]}>
                        <PhoneInput
                            flagsPath='https://flagicons.lipis.dev/flags/4x3/'
                            inputClassName="ant-input"
                            country={globalConstants.DEFAULT_COUNTRY}
                        />
                    </Form.Item>

                    <Form.Item label="Model Number" name="model" rules={[{ required: true, message: 'Please select the model!' }]}>
                        <Select
                            onChange={v => setExpireStorage('beaconModel', v, globalConstants.LOCAL_STORAGE_EXPIRE)}
                        >
                            {beaconModelOptions}
                        </Select>
                    </Form.Item>

                    <Form.Item label="APN (internet connection)" name="apn">
                        <Select
                            onChange={v => setExpireStorage('beaconAPN', v, globalConstants.LOCAL_STORAGE_EXPIRE)}
                        >
                            {apnOptions}
                        </Select>
                    </Form.Item>

                    <Form.Item label="OOBE" name="oobe_state" valuePropName="checked" {...checkBoxItemLayout}>
                        <Switch
                            onChange={v => setExpireStorage('!beaconOOBE', !v, globalConstants.LOCAL_STORAGE_EXPIRE)}
                        />
                    </Form.Item>

                    <Form.Item label="Subscription state" name="subscription_status">
                        <Select
                            onChange={v => setExpireStorage('beaconSubscription', v, globalConstants.LOCAL_STORAGE_EXPIRE)}
                        >
                            {subscriptionOptions}
                        </Select>
                    </Form.Item>

                    {(statusValue === 'CONTRACT' || statusValue?.includes('PERIOD')) && <ContractOptions form = {form} {...props}/>}

                    <Form.Item label="Timezone" name="timezone">
                        <Select
                            onChange={v => setExpireStorage('timezone', v, globalConstants.LOCAL_STORAGE_EXPIRE)}
                            showSearch
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                            {timezones}
                        </Select>
                    </Form.Item>
                    <Divider />
                    <Form.Item label="Add to organisation?" name="organisation">
                        <Select
                            onChange={v => setExpireStorage('organisation', v, globalConstants.LOCAL_STORAGE_EXPIRE)}
                            showSearch
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                            {organisations}
                        </Select>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    )
}

CreateBeaconCreateForm.propTypes = {
    width: PropTypes.number,
    open: PropTypes.bool.isRequired,
    onNext: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    context: PropTypes.object,
    beaconModels: PropTypes.array,
    subscriptionStatus: PropTypes.array,
}
export default CreateBeaconCreateForm
