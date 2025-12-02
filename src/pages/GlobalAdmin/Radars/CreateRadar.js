import { useEffect, useRef, useState } from 'react'
import {Button, Divider, Form, Input, message, Modal, notification, Select} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { actions } from 'mirrorx'
import { globalConstants } from '@/_constants'
import {getExpireStorage, retrieveJSONData, setExpireStorage, storeJSONData} from '@/utility/Storage'
import { buildTimezoneOptions } from '@/utility/Countries'
import { titleCase } from 'change-case'
import ContractOptions from '@/pages/Subscription/ContractDetailForm'
import { format4Api } from '@/utility/Locale'
import moment from 'moment'

const CreateRadarForm = ({ open, onCreate, onCancel, subscriptionStatus,...props }) => {
    const [form] = Form.useForm()
    // const statusValue = Form.useWatch('subscription_status', form)
    const [statusValue, setStatusValue] = useState('')
    const [prefillName, setPrefillName] = useState(true)
    let inputRef = useRef(null)

    const onValuesChange = (changedValues) => {
        changedValues?.subscription_status && setStatusValue(changedValues.subscription_status)
    }

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

    let subscriptionOptions = subscriptionStatus?.map(status=>(
        <Select.Option key={status} value={status}>{status}</Select.Option>
    ))

    const buildOrgOptions = () => {
        const {orgs} = props
        const defaultOption = <Select.Option key={null} value={null}>Do not add to an organisation</Select.Option>
        return [defaultOption].concat(orgs?.map(org=><Select.Option key={org.organization_id} value={org.organization_id}>{org.name}</Select.Option>))
    }

    subscriptionOptions?.unshift(<Select.Option key={'null'} value={null}>Not Set</Select.Option>)

    const timezoneOptions = buildTimezoneOptions()
    const orgOptions = buildOrgOptions()

    useEffect(()=>setTimeout(() => inputRef?.current?.focus(), 1000),[open, inputRef])

    return (
        <Modal
            open={open}
            title={`Create a new ${titleCase(globalConstants.RADAR_GENERIC)}`}
            okText="Create"
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {form.validateFields().then((values) => {
                form.resetFields()
                onCreate(values)
            })
                .catch((info) => {
                    message.error('Validate Failed:', info)
                })
            }}
        >
            <Form
                form={form}
                onValuesChange={onValuesChange}
                labelWrap
                {...formItemLayout}
                name="form_in_modal"
                initialValues={{
                    prefix: retrieveJSONData('radarPrefix') || 'Radar',
                    timezone: getExpireStorage('timezone') || null,
                    organisation: getExpireStorage('organisation') || null,
                    product_type: 'RADAR'
                }}
            >
                <Form.Item label="Name Prefix" name="prefix">
                    <Input
                        maxLength={globalConstants.INPUT_MAX_LENGTH}
                        onChange={(e)=>storeJSONData('radarPrefix',e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    name="ext_id"
                    label="External ID"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the External ID!',
                        },
                    ]}
                >
                    <Input
                        autoFocus
                        onChange={e=>{
                            prefillName && form.setFieldsValue({
                                display_name: form.getFieldValue('prefix')+ ' ' + e.target.value
                            })
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="display_name"
                    label="Display Name"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the display name!',
                        },
                    ]}
                >
                    <Input onChange={()=>setPrefillName(false)}/>
                </Form.Item>
                {/*<Form.Item label="Subscription state" name="subscription_status" {...formItemLayout}>*/}
                {/*    <Select>*/}
                {/*        {subscriptionOptions}*/}
                {/*    </Select>*/}
                {/*</Form.Item>*/}

                <Form.Item label="Product" name="product_type" {...formItemLayout}>
                    <Select disabled options={[{value: 'RADAR', label: 'RADAR'}]} />
                </Form.Item>

                {(statusValue==='CONTRACT' || statusValue?.includes('PERIOD'))  && <ContractOptions form={form} {...props}/>}

                <Form.Item
                    label="Timezone"
                    name="timezone"
                    rules={[
                        {
                            required: true,
                            message: 'Please select the timezone!',
                        },
                    ]}
                    {...formItemLayout}
                >
                    <Select
                        showSearch
                        onChange={v=>setExpireStorage('timezone',v, globalConstants.LOCAL_STORAGE_EXPIRE)}
                    >
                        {timezoneOptions}
                    </Select>
                </Form.Item>

                <Divider />

                <Form.Item label="Add to organisation?" name="organisation" {...formItemLayout}>
                    <Select
                        onChange={v=>setExpireStorage('organisation',v, globalConstants.LOCAL_STORAGE_EXPIRE)}
                        showSearch
                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                        {orgOptions}
                    </Select>
                </Form.Item>

            </Form>
        </Modal>
    )
}

const CreateRadarModal = (props) => {
    const [open, setOpen] = useState(false)

    const onCreate = (values) => actions.radar.createRadar(values).then((newRadar)=> {
        message.success('Create success!')
        if (values.organisation){
            let orgPayload = {}
            orgPayload.type='RADAR'
            orgPayload.organization_id = values.organisation
            orgPayload.device_id = newRadar.id
            orgPayload.mac_or_imei = newRadar.ext_id
            actions.organisation.associateOrgDevice(orgPayload)
                .then(() => {
                    message.success('Add to organisation success!')
                }).catch(() => message.error('Add to organisation failed! Please retry in organisation menu'))
                .finally(()=>setOpen(false))
        }
        if (values.subscription_status === 'CONTRACT' || values.subscription_status === 'LOAN_PERIOD' || values.subscription_status === 'GRACE_PERIOD'){
            const payload = {
                ...values,
                product_id: newRadar.pub_id,
            }
            if (values.subscription_status === 'CONTRACT'){
                payload.contract_end_date = values.contract === 'custom' ? format4Api(values.customDate) : format4Api(moment().add(values.contract,'month'))
            }else if  (values.subscription_status === 'LOAN_PERIOD') {
                payload.loan_period_end_date = values.contract === 'custom' ? format4Api(values.customDate) : format4Api(moment().add(values.contract,'month'))
            }else if  (values.subscription_status === 'GRACE_PERIOD') {
                payload.grace_period_end_date = values.contract === 'custom' ? format4Api(values.customDate) : format4Api(moment().add(values.contract,'month'))
            }
            actions.billing.updateSubscription({productId: payload.product_id,payload})
        }

    },(info) => {
        notification.error({message: 'Create Failed', description: info.status===409 ? 'MAC address exists':''})
    })

    return (
        <span>
            <Button
                icon={<PlusOutlined/>}
                type="primary"
                onClick={() => {
                    setOpen(true)
                }}
            >Create {titleCase(globalConstants.RADAR_GENERIC)}</Button>
            <CreateRadarForm
                {...props}
                open={open}
                onCreate={onCreate}
                onCancel={() => {
                    setOpen(false)
                }}
            />
        </span>
    )
}

export default CreateRadarModal
