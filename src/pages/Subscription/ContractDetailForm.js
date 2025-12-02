import moment from 'moment'
import { DatePicker, Form, Input, InputNumber, Radio, Select, Space } from 'antd'
import { set } from 'lodash'
import { Fragment, useEffect, useState } from 'react'

const SUB_CONDITION_NONE = 'NONE'
const SUB_CONDITION_CAA = 'CAA'

const ContractOptions = (props) => {
    const {subscriptionConditions, subscription, form} = props
    const statusValue = Form.useWatch('subscription_status', form)
    const conditionValue = Form.useWatch('condition', form) ?? form.getFieldValue('condition') ?? SUB_CONDITION_NONE
    const contractValue = Form.useWatch('contract', form) ?? form.getFieldValue('contract') ?? 'custom'
    const periodRequire = props.periodRequire ?? (statusValue === 'CONTRACT' || statusValue?.includes('PERIOD'))
    const isContract = props.isContract ?? statusValue === 'CONTRACT'

    let condOptions = subscriptionConditions?.map(cond=>(
        <Select.Option key={cond.name} value={cond.name}>{cond.value}</Select.Option>
    ))

    useEffect(()=> {
        const data = {}
        if (statusValue === 'CONTRACT') {
            const duration = moment.duration(subscription?.period || 12, 'months')
            data.condition = subscription?.condition ?? SUB_CONDITION_NONE
            data.contract = subscription?.contract ?? 'custom'
            data.days = duration?.asDays()
        } else {
            data.condition = SUB_CONDITION_NONE
            data.contract = 12
            data.customDate = subscription?.contract_end_date ? moment(subscription.contract_end_date) : null
        }
        form.setFieldsValue(data)
    }, [statusValue, subscription, form])
    return <Space direction="vertical" className="large-margin-bottom">
        {isContract &&  
        <Form.Item name="condition" rules={[{required: true, message: 'Please select an option'}]} wrapperCol={{span: 18}}>
            <Radio.Group style={{marginLeft: 18}}>
                <Radio value={SUB_CONDITION_NONE}>
                    <span style={{ fontWeight: 'bold' }}>End Contract precisely after/on date:</span>
                </Radio>
                <Radio value={SUB_CONDITION_CAA}><div>
                    <div style={{ fontWeight: 'bold' }}>Start Contract After Claim/activation</div>
                    {conditionValue === SUB_CONDITION_CAA && <div style={{ whiteSpace: 'nowrap' }}>After the device is claimed, start a contract with the following time period:</div>}
                </div></Radio>
            </Radio.Group>
        </Form.Item>
        }
        {conditionValue === SUB_CONDITION_NONE && 
        <Form.Item name="contract" label="Period" rules={[{required: periodRequire, message: 'Please select contract period'}]} labelCol={{span: 6}} wrapperCol={{span: 18}}>
            <Radio.Group>
                <Radio value={1200}>Never end (100yrs)</Radio>
                <Radio value={12}>12 months</Radio>
                <Radio value={24}>24 months</Radio>
                <Radio value={36}>36 months</Radio>
                <Radio value="custom">Custom</Radio>
            </Radio.Group>
        </Form.Item>
        }
        {conditionValue === SUB_CONDITION_NONE && contractValue === 'custom' && <Form.Item name="customDate" rules={[ {
            required: conditionValue === SUB_CONDITION_NONE && contractValue === 'custom',
            message: 'Please select the end date',
        },]}>
            <DatePicker autoFocus/>
        </Form.Item>
        }
        {conditionValue === SUB_CONDITION_CAA &&
        <Form.Item name="contract" label="Period" rules={[{required: periodRequire, message: 'Please select contract period'}]} labelCol={{span: 6}} wrapperCol={{span: 18}}>
            <Radio.Group>
                <Radio value={12}>12 months</Radio>
                <Radio value={24}>24 months</Radio>
                <Radio value={36}>36 months</Radio>
                <Radio value="custom">
                    <Form.Item name="days" noStyle rules={[{
                        required: conditionValue === SUB_CONDITION_CAA && contractValue === 'custom2',
                        message: 'Please input days!',
                    }]}>
                        <InputNumber min={1} style={{ width: 80, marginRight: 8 }} />
                    </Form.Item>
                    days
                </Radio>
            </Radio.Group>
        </Form.Item>
        }
        {isContract && <Fragment>
            <Form.Item name="contract_email" label="Requested by (email)" rules={[{
                type: 'email', message: 'The input is not valid E-mail!',
            }]}>
                <Input />
            </Form.Item>

            <Form.Item name="contract_company" label="Requested company NDIS/Home Care Provider" >
                <Input />
            </Form.Item>

            <Form.Item name="contract_finance_ref" label="SOFIHUB Finance Reference ID" >
                <Input />
            </Form.Item>

            <Form.Item name="admin_notes" label="Notes">
                <Input.TextArea />
            </Form.Item>
        </Fragment>}
    </Space>
}

ContractOptions.defalutProps = {
    isContract: true,
    periodRequire: false,
}

export default ContractOptions
