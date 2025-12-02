import { Component } from 'react'
import { actions } from 'mirrorx'
import { EditOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Button, Col, Descriptions, Input, message, Row } from 'antd'
import { globalConstants } from '@/_constants'
import PropTypes from 'prop-types'
import PhoneInput from 'react-phone-number-input'
import AccessDenied from '../../../../../components/AccessDeny'
import warnAboutUnsavedForm from '../../../../../components/WarnUnsavedForm'

const FormItem = Form.Item

class Profile extends Component {

    constructor(props) {
        super(props)
        this.state = {edit: false}
    }

    updateInfo = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const orgId = this.props.currentOrg.organization_id
                const payload = {
                    ...this.props.currentOrg,
                    ...values
                }
                actions.organisation.updateOrg({ orgId, payload }).then(() => {
                    message.success('organisation profile updated successfully')
                    this.props.onSave()
                    this.setState({edit: false})
                }, (error) => {
                    message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
                })
            }
        })
    }

    render() {
        const {form: { getFieldDecorator },currentOrg, readOnly, onFormChange} = this.props
        const {edit} = this.state
        return (
            <div className="contentPage">
                <Row type="flex">
                    <Col xs={24} lg={12}>
                        {readOnly && !edit ?
                            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_DETAILS">
                                <Descriptions title="Organisation Details" column={{xs:1, lg:2}}>
                                    <Descriptions.Item label="Organisation Name">{currentOrg?.name}</Descriptions.Item>
                                    <Descriptions.Item label="Website">{currentOrg?.website}</Descriptions.Item>
                                    <Descriptions.Item label="General Number">{currentOrg?.general_phone_number}</Descriptions.Item>
                                    <Descriptions.Item label="Contact Us Page">{currentOrg?.contact_link}</Descriptions.Item>
                                    <Descriptions.Item label="Support Phone Number">{currentOrg?.support_phone_number}</Descriptions.Item>
                                    <Descriptions.Item label="Support Page">{currentOrg?.support_link}</Descriptions.Item>
                                    <Descriptions.Item label="Organisation Description" >{currentOrg?.description}</Descriptions.Item>
                                </Descriptions>
                                <AccessDenied currentOrg={currentOrg} privilege="ORG_UPDATE_ORG_DETAILS" hasModal={false}>
                                    <Button icon={<EditOutlined />} onClick={()=>this.setState({edit:true})} type="primary">Edit</Button>
                                </AccessDenied>
                            </AccessDenied>

                            :
                            <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
                                <FormItem
                                    label="Organisation Name"
                                >
                                    {getFieldDecorator('name', {
                                        rules: [{
                                            required: true, message: 'Please input organisation name!',
                                        }], initialValue: currentOrg?.name
                                    })(
                                        <Input onChange={onFormChange}/>
                                    )}
                                </FormItem>

                                <FormItem
                                    label="Description"
                                >
                                    {getFieldDecorator('description', {
                                        rules: [{required: true, message: 'Please input the description!', whitespace: true}],
                                        initialValue: currentOrg?.description
                                    })(
                                        <Input onChange={onFormChange}/>
                                    )}
                                </FormItem>

                                <FormItem
                                    label="Organisation General Number"
                                >
                                    {getFieldDecorator('general_phone_number', {
                                        initialValue: currentOrg?.general_phone_number
                                    })(
                                        <PhoneInput
                                            flagsPath='https://flagicons.lipis.dev/flags/4x3/' country="AU" inputClassName="ant-input" onChange={onFormChange}/>
                                    )}
                                </FormItem>

                                <FormItem
                                    label="Organisation Contact Link"
                                >
                                    {getFieldDecorator('contact_link', {
                                        initialValue: currentOrg?.contact_link
                                    })(
                                        <Input onChange={onFormChange}/>
                                    )}
                                </FormItem>

                                <FormItem
                                    label="Organisation Support Number"
                                >
                                    {getFieldDecorator('support_phone_number', {
                                        initialValue: currentOrg?.support_phone_number
                                    })(
                                        <PhoneInput
                                            flagsPath='https://flagicons.lipis.dev/flags/4x3/' country="AU" inputClassName="ant-input" onChange={onFormChange}/>
                                    )}
                                </FormItem>

                                <FormItem
                                    label="Organisation Support Link"
                                >
                                    {getFieldDecorator('support_link', {
                                        initialValue: currentOrg?.support_link
                                    })(
                                        <Input onChange={onFormChange}/>
                                    )}
                                </FormItem>

                                <FormItem
                                    label="Website"
                                >
                                    {getFieldDecorator('website', {
                                        initialValue: currentOrg?.website
                                    })(
                                        <Input onChange={onFormChange}/>
                                    )}
                                </FormItem>
                                <AccessDenied currentOrg={currentOrg} privilege="ORG_UPDATE_ORG_DETAILS">
                                    <Button type="primary" onClick={this.updateInfo}>
                                        Update Information
                                    </Button>
                                </AccessDenied>
                            </Form>
                        }
                    </Col>
                </Row>
            </div>
        )
    }
}
Profile.defaultProps={
    readOnly: false
}

Profile.propTypes={
    currentOrg: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    onFormChange: PropTypes.func,
    onSave:PropTypes.func,
}
export default warnAboutUnsavedForm(Form.create({})(Profile))
