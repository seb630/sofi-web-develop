import { createContext, Component } from 'react'
import { Form } from '@ant-design/compatible'
import { Input, Select, Switch } from 'antd'
import { globalConstants } from '@/_constants'
import { connect } from 'mirrorx'
import PhoneInput from 'react-phone-number-input'
import beaconService from '../services/Beacon'

const mapStateToProps = state => ({
    hubSpaces: state.hub.hubSpaces,
})


const FormItem = Form.Item
export const EditableContext = createContext()

const EditableRow = ({ form, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
)

export const EditableFormRow = Form.create()(EditableRow)

class EditableCell extends Component {

    constructor(props) {
        super(props)

    }

    getInput = (dataIndex, form, record) => {
        const emergencyNumbers = globalConstants.EMERGENCY_CALL_NUMBERS
        const isEmergencyServices = record?.name === 'Emergency Services'

        if (dataIndex==='kind') {
            return (
                <Select style={{width: '180px'}}>
                    {globalConstants.SPACES.map(space => (
                        <Select.Option key={space} value={space}>
                            {space}
                        </Select.Option>)
                    )}
                </Select>
            )
        } else if (dataIndex === 'space_id') {
            return (
                <Select  style={{width: '180px'}}>
                    {this.props.hubSpaces.map(space => (
                        <Select.Option key={space.space_id} value={space.space_id}>
                            {space.name}
                        </Select.Option>)
                    )}
                </Select>
            )
        } else if (dataIndex === 'number') {
            if (isEmergencyServices) {
                return (
                    <Select style={{ width: '100%' }} onSelect={(e) => this.save(e, form)}>
                        {emergencyNumbers.map(number => (
                            <Select.Option key={number} value={number}>
                                {number}
                            </Select.Option>
                        ))}
                    </Select>
                )
            }
            return (
                <PhoneInput
                    flagsPath='https://flagicons.lipis.dev/flags/4x3/'
                    displayInitialValueAsLocalNumber
                    inputClassName="ant-input phoneInput"
                    country={this.props.defaultCountry}
                    placeholder="Enter phone number"
                    onBlur={(e)=>this.save(e,form)}
                />
            )
        } else if (dataIndex === 'name') {
            return (
                <Input
                    onPressEnter={(e)=>this.save(e,form)}
                    onBlur={(e)=>this.save(e,form)}
                    disabled={isEmergencyServices ? true : false}
                />
            )
        } else if (dataIndex === 'accept_sms' || dataIndex === 'accept_phone') {
            if (!isEmergencyServices) {
                return (
                    <Switch
                        checkedChildren="On"
                        unCheckedChildren="Off"
                        onClick={(checked,e)=>this.save(e,form)}
                    />
                )
            }
            return <></>
        }
        return <Input />
    }

    save = (e,form) => {
        const { record, handleSave } = this.props
        form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return
            }
            handleSave && handleSave({ ...record, ...values })
        })
    };

    render() {
        const {
            editing,
            dataIndex,
            title,
            record,
            valuePropName,
            ...restProps
        } = this.props
        return (
            <EditableContext.Consumer>
                {(form) => {
                    const { getFieldDecorator } = form
                    return (
                        <td>
                            {editing ? (
                                <FormItem style={{ margin: 0 }}>
                                    {getFieldDecorator(dataIndex, {
                                        rules: [{
                                            required: !valuePropName,
                                            message: `Please Input ${title}!`,
                                        }],
                                        initialValue: record[dataIndex],
                                        valuePropName: valuePropName || 'value'
                                    })(this.getInput(dataIndex, form, record))}
                                </FormItem>
                            ) : restProps.children}
                        </td>
                    )
                }}
            </EditableContext.Consumer>
        )
    }
}
export default connect(mapStateToProps, null) (EditableCell)
