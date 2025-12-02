import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import { Button, Col, Input, message, Modal, Popconfirm, Row, Select, Table, Tooltip, } from 'antd'
import { hasAccess, sortString } from '@/utility/Common'
import PhoneInput from 'react-phone-number-input'
import { globalConstants } from '@/_constants'
import AccessDenied from '../../../../../components/AccessDeny'

const FormItem = Form.Item

const mapStateToProps = state => ({
    contacts: state.organisation.contacts,
    myPrivileges: state.user.myPrivileges,
    admin: state.user.me ?.authorities.some(role=>role.includes('ADMIN')),
})

class OrgContacts extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
        }
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = () =>{
        const {currentOrg, myPrivileges, admin} = this.props
        if (hasAccess('ORG_VIEW_ORG_CONTACT', currentOrg,myPrivileges, admin)) {
            actions.organisation.fetchOrgContacts(currentOrg.organization_id)
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.currentOrg!==this.props.currentOrg && this.fetchData()
    }

    handleClose = () => {
        this.setState({ modal: false})
    }

    handleOpen = () => {
        this.setState({modal: true})
    }

    handleSave = async() => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                actions.organisation.createContact({orgId: this.props.currentOrg.organization_id, payload:values}).then(() => {
                    message.success('Contact Added')
                    this.props.form.resetFields()
                    this.setState({ modal: false})
                }, (error) => {
                    message.error(globalConstants.WENT_WRONG + '(' + error.message+')')
                })
            }
        })
    }

    remove = (contact, e) => {
        e.stopPropagation()
        actions.organisation.deleteContact({orgId: this.props.currentOrg.organization_id, contactId:contact.organization_contact_id}).then(()=>{
            message.success('Contact Deleted')
        })
    }

    buildTypeOptions = () => {
        const types = ['SECURITY', 'BILLING', 'TECHNICAL']
        return types.map(type => (
            <Select.Option key={type} value={type}>{type}</Select.Option>
        ))
    }

    render(){
        const { contacts, form, currentOrg } = this.props
        const { getFieldDecorator } = form
        const typeOptions = this.buildTypeOptions()
        const dataSource = contacts
        const columns = [
            {
                title: 'Name',
                dataIndex: 'full_name',
                key: 'full_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
            },
            {
                title: 'Mobile',
                dataIndex: 'phone_number',
                key: 'phone_number',
            },
            {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, contact) => (
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_DELETE_ORG_CONTACT" hasModal={false}>
                        <Popconfirm
                            title="Are you sure remove this contact?"
                            onConfirm={(e)=>this.remove(contact, e)}
                            okText="Yes"
                            cancelText="No"
                            onClick={e => {e.stopPropagation()}}
                        >
                            <a><Tooltip title="Remove this contact">
                                <DeleteOutlined />
                            </Tooltip></a>
                        </Popconfirm>
                    </AccessDenied>
                ),
            },
        ]
        return (
            <AccessDenied currentOrg={currentOrg} privilege="ORG_VIEW_ORG_CONTACT">
                <div className="contentPage">
                    <Table scroll={{x: true}} className="table"
                        dataSource={dataSource}
                        columns={columns}
                        rowKey="organization_contact_id"
                    />
                    <AccessDenied currentOrg={currentOrg} privilege="ORG_CREATE_ORG_CONTACT" hasModal={false}>
                        <Row>
                            <Col span={6}>
                                <Button style={{ marginTop: '16px'}} type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>
                                Add a new contact
                                </Button>
                            </Col>
                        </Row>
                    </AccessDenied>
                    <Modal
                        destroyOnClose
                        okText="Save"
                        open={this.state.modal} onCancel={this.handleClose}
                        onOk={this.handleSave}
                        centered={false} title="Add Contact"  style={{height: '300px'}}
                    >
                        <Form layout="vertical">
                            <FormItem
                                label="Email"
                            >
                                {getFieldDecorator('email', {
                                    rules: [{
                                        type: 'email', message: 'The input is not valid E-mail!',
                                    }, {
                                        required: true, message: 'Please input your E-mail!',
                                    }],
                                })(
                                    <Input autoComplete="off"   data-lpignore="true"/>
                                )}
                            </FormItem>
                            <FormItem
                                label="Full Name"
                            >
                                {getFieldDecorator('full_name', {})(
                                    <Input />
                                )}
                            </FormItem>
                            <FormItem
                                label="Phone"
                            >
                                {getFieldDecorator('phone_number', {})(
                                    <PhoneInput
                                        flagsPath='https://flagicons.lipis.dev/flags/4x3/' country="AU"  inputClassName="ant-input"/>
                                )}
                            </FormItem>
                            <FormItem
                                label="Type"
                            >
                                {getFieldDecorator('type', {})(
                                    <Select>
                                        {typeOptions}
                                    </Select>
                                )}
                            </FormItem>
                        </Form>
                    </Modal>
                </div>
            </AccessDenied>
        )
    }
}


export default connect(mapStateToProps, null) (Form.create()(OrgContacts))
