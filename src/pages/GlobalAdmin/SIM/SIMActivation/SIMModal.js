import { Component, createRef, Fragment } from 'react'
import { actions } from 'mirrorx'
import { AutoComplete, DatePicker, Divider, Form, Input, message, Modal, Select, Spin, Switch } from 'antd'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import PropTypes from 'prop-types'
import { storeJSONData } from '@/utility/Storage'
import PhoneInput from 'react-phone-number-input'
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input'
import en from 'react-phone-number-input/locale/en.json'
import { titleCase } from 'change-case'

/** APN Modal HoC
 * @param {React.Component} ActionComponent
 * @return {React.Component}
*/
function withSIMModal (ActionComponent) {
    class SIMForm extends Component {
        constructor(props) {
            super(props)
            this.state = {
                isEditable: !!props.model,
                open: false,
                submitting : false,
                selectedCountry: '',
                sim_carrier: '',
                iccid:'',
            }
            this.formRef = createRef()
        }

        /** handle close Modal */
        handleClose = () => {
            this.formRef.current?.resetFields()
            this.setState({
                open: false,
                selectedCountry: '',
                sim_carrier: '',
                iccid:'',
            })
        }

        /** handle open Modal */
        handleOpen = () => {
            this.setState({ open: true })
        }

        /** handle saving */
        handleSave = (values) => {
            const { model } = this.props
            const { isEditable } = this.state
            this.setSubmit(true)
            const action = []
            const payload = isEditable ? {...model, ...values}: values
            payload.product_mac_or_imei = values.product_mac_or_imei?.trim()
            payload.country_code = values.country_code.startsWith('+') ? values.country_code: '+'+getCountryCallingCode(values.country_code)
            action.push(isEditable ?
                actions.SIM.updateActivation(payload):
                actions.SIM.createActivation(payload))
            Promise.all(action).then(()=>{
                message.success(isEditable ? 'Record Updated' : 'Record Created')
                actions.SIM.fetchSIMByProduct({
                    type: values.product_type,
                    macOrImei: values.product_mac_or_imei })
                this.setSubmit(false)
                this.handleClose()
            }).catch (err=> {
                this.setSubmit(false)
                err.global_errors?.length>0 ? err.global_errors.map(item => {
                    message.error(`${item}`)
                }) : message.error(globalConstants.SERVER_ERROR_MESSAGE)
            })
        }

        handleProviderChange = (value) => {
            value && actions.SIM.fetchCarriers(value)
            value && actions.SIM.fetchICCIDs(value)
            storeJSONData('simProvider',value)
        }

        setSubmit = (value) => {
            this.setState({ submitting: value })
        }

        checkMACorIMEI = (_, value) => {
            const form = this.formRef.current
            const trimed = value?.trim()
            if (globalConstants.NUMBER_ONLY_REGEX.test(trimed) && form?.getFieldValue('product_type')==='HUB') {
                return Promise.reject(new Error(`Detected IMEI number, not MAC address for "${globalConstants.HUB_GENERIC}"`))
            }else if (!globalConstants.NUMBER_ONLY_REGEX.test(trimed) && form?.getFieldValue('product_type')==='BEACON') {
                return Promise.reject(new Error(`Detected MAC address, not IMEI for "${globalConstants.PENDANT_GENERIC}"`))
            }else{
                return Promise.resolve()
            }
        }

        selectICCID = (value) =>{
            const form  = this.formRef.current
            this.setState({iccid: value})
            if (value.startsWith('8961')){
                form?.setFieldsValue({country_code: 'AU'})
                this.setState({selectedCountry: 'AU'})
            } else if (value.startsWith('8901')) {
                form?.setFieldsValue({country_code: 'US'})
                this.setState({selectedCountry: 'US'})
            }
        }

        render() {
            const { model, providers, carriers, iccids, device } = this.props
            const { submitting , open , isEditable, selectedCountry } = this.state
            const formItemLayout = {
                labelCol: { xs: 24, sm: 10 },
                wrapperCol: { xs: 24, sm: 14 },
            }

            const providerOptions = providers?.map(provider => (
                <Select.Option key={provider?.name} value={provider?.name}>{provider?.label}</Select.Option>
            ))

            const countryCodeOption = getCountries().map(country => (
                <Select.Option key={country} value={country}>
                    {`${en[country]} +${getCountryCallingCode(country)}`}
                </Select.Option>
            ))

            const carrierOptions = carriers?.map(carrier => (
                <Select.Option key={carrier?.name} value={carrier?.name}>{carrier?.label}</Select.Option>
            ))

            const iccidOptions = iccids?.map(iccid => ({value: iccid, label: iccid}))

            return (<Fragment>
                <ActionComponent onClick={this.handleOpen} />
                <Modal
                    okText="Save"
                    open={open} onCancel={this.handleClose}
                    onOk={() => {this.formRef.current?.validateFields().then((values) => {
                        this.handleSave(values)
                    })}}
                    okButtonProps={{disabled: submitting || !this.formRef.current?.getFieldValue('country_code')}}
                    centered={false}
                    title={isEditable ? `Edit SIM Record: ${model.id}` : 'Create new SIM Record'}
                    width={700}
                >
                    <Spin spinning={submitting}>
                        <Form
                            ref={this.formRef}
                            layout="horizontal"
                            scrollToFirstError
                            initialValues={{
                                sim_provider: model?.sim_provider,
                                sim_carrier: model?.sim_carrier,
                                iccid_full: model?.iccid_full,
                                sim_status: model ? model.sim_status : 'NOT_ACTIVE',
                                country_code: model?.country_code,
                                msisdn: model?.msisdn,
                                msisdn_full: model?.msisdn_full,
                                product_type: model ? model.product_type : device? device.type: 'HUB',
                                product_mac_or_imei: model? model.product_mac_or_imei : device ? device.mac_or_imei : undefined,
                                skip_activation: model?.skip_activation,
                                last_updated_by: model?.last_updated_by,
                                last_updated_at: model && moment(model.last_updated_at),
                                errors: model?.errors,
                                request_type: model?.request_type,
                                request_status: model?.request_status,
                                request_raised_at: model && moment(model.request_raised_at)
                            }}
                            {...formItemLayout}
                        >
                            <h4>1. SIM Card Details</h4>
                            <Form.Item
                                label="SIM Provider"
                                name="sim_provider"
                                rules={[{ required: true, message: 'Please select SIM card provider!' }]}
                            >
                                <Select
                                    disabled={model?.sim_status==='ACTIVE'|| model?.request_status==='PENDING'}
                                    onChange={this.handleProviderChange}
                                >
                                    {providerOptions}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="SIM Carrier"
                                name="sim_carrier"
                                rules={[{ required: true, message: 'Please select SIM card carrier!' }]}
                            >
                                <Select
                                    disabled={model?.sim_status==='ACTIVE'|| model?.request_status==='PENDING'}
                                    onSelect={value => this.setState({sim_carrier: value})}
                                >
                                    {carrierOptions}
                                </Select>
                            </Form.Item>

                            { (model || this.state.sim_carrier) && <Fragment>
                                <Form.Item
                                    label="ICCID"
                                    name="iccid_full"
                                    dependencies={['sim_carrier']}
                                    rules={[
                                        { required: true, message: 'Please select ICCID!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (value.startsWith('896101') && getFieldValue('sim_carrier')==='OPTUS'){
                                                    return Promise.reject(new Error('It looks like you\'ve typed in a Telstra ICCID number, but you\'ve selected Optus as the carrier, please double check your input.'))
                                                }else if (value.startsWith('896102') && getFieldValue('sim_carrier'==='TELSTRA')){
                                                    return Promise.reject(new Error('It looks like you\'ve typed in an Optus ICCID number, but you\'ve selected Telstra as a carrier, please double check your input.'))
                                                }else{
                                                    return Promise.resolve()
                                                }
                                            }, warningOnly: true
                                        })
                                    ]}
                                >
                                    <AutoComplete
                                        onSelect={this.selectICCID}
                                        options={iccidOptions}
                                        filterOption={(input, option) =>
                                            option.value.indexOf(input) >= 0
                                        }
                                    />
                                </Form.Item>
                                { (model || this.state.sim_carrier && this.state.iccid) && <Fragment>

                                    <Form.Item
                                        label="Country Code"
                                        name="country_code"
                                        rules={[{ required: true, message: 'Please select country code!' }]}
                                    >
                                        <Select
                                            showSearch
                                            onChange={(v)=>this.setState({selectedCountry: v })}
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {countryCodeOption}
                                        </Select>
                                    </Form.Item>
                                    { (model || this.state.sim_carrier && this.state.iccid && this.state.selectedCountry) && <Fragment>
                                        <Form.Item
                                            label="Unformatted Mobile Number"
                                            name="msisdn"
                                        ><Input /></Form.Item>

                                        <Form.Item
                                            label="Formatted Mobile Number"
                                            name="msisdn_full"
                                        >
                                            <PhoneInput
                                                flagsPath='https://flagicons.lipis.dev/flags/4x3/'
                                                country={selectedCountry}
                                                displayInitialValueAsLocalNumber={true}
                                                inputClassName="ant-input"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="SIM status"
                                            name="sim_status"
                                            rules={[{ required: true, message: 'Please select SIM status!' }]}
                                        >
                                            <Select
                                                disabled={model?.sim_status==='ACTIVE'|| model?.request_status==='PENDING'}
                                            >
                                                <Select.Option key='active' value='ACTIVE'>Active</Select.Option>
                                                <Select.Option key='not_active' value='NOT_ACTIVE'>Not Active</Select.Option>
                                            </Select>
                                        </Form.Item>

                                        <Divider />
                                        <h4>2. What device does this apply to?</h4>
                                        <Form.Item
                                            label="Product Type"
                                            name="product_type"
                                            rules={[{ required: true, message: 'Please select product type!' }]}
                                        >
                                            <Select>
                                                <Select.Option key='hub' value='HUB'>{titleCase(globalConstants.HUB_GENERIC)}</Select.Option>
                                                <Select.Option key='beacon' value='BEACON'>{titleCase(globalConstants.PENDANT_GENERIC)}</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            label="Product MAC or IMEI"
                                            name="product_mac_or_imei"
                                            rules={[
                                                { required: true, message: 'Please select product MAC or IMEI!' },
                                                { validator: this.checkMACorIMEI }
                                            ]}
                                            validateTrigger="onBlur"
                                        >
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            label="Skip activation?"
                                            name="skip_activation"
                                            valuePropName="checked"
                                        >
                                            <Switch />
                                        </Form.Item>

                                        {model&& <div>
                                            <Form.Item
                                                label="Last Modified By"
                                                name="last_updated_by"
                                            >
                                                <Input disabled/>
                                            </Form.Item>

                                            <Form.Item
                                                label="Last Modified At"
                                                name="last_updated_at"
                                            >
                                                <DatePicker showTime disabled format="DD-MM-YYYY HH:mm:ss" />
                                            </Form.Item>

                                            <Form.Item
                                                label="Errors"
                                                name="errors"
                                            >
                                                <Input.TextArea disabled/>
                                            </Form.Item>

                                            {model?.request_type && !model.request_complete_at && <div>
                                                <Form.Item
                                                    label="Request type"
                                                    name="request_type"

                                                >
                                                    <Input disabled/>
                                                </Form.Item>

                                                <Form.Item
                                                    label="Request status"
                                                    name="request_status"
                                                >
                                                    <Input disabled/>
                                                </Form.Item>

                                                <Form.Item
                                                    label="Request raised at"
                                                    name="request_raised_at"
                                                >
                                                    <DatePicker showTime disabled format="DD-MM-YYYY HH:mm:ss" />
                                                </Form.Item>
                                            </div>}
                                        </div>}
                                    </Fragment>}
                                </Fragment>}
                            </Fragment>}
                        </Form>
                    </Spin>
                </Modal>
            </Fragment>)
        }
    }

    SIMForm.propTypes={
        providers: PropTypes.array,
        iccids: PropTypes.array,
        carriers: PropTypes.array,
        model: PropTypes.object,
        device: PropTypes.object
    }
    return SIMForm
}

export default withSIMModal
