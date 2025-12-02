import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Collapse, Divider, Popconfirm, Row, Table, Tooltip } from 'antd'
import { sortString } from '@/utility/Common'
import AssociateOrgModal from './AssociateOrgModal'
import PropTypes from 'prop-types'
import InviteTable from '../../../../../components/InviteTable'

const mapStateToProps = state => ({
    userOrgs: state.user.userOrgs,
    allOrgs: state.organisation.orgs,
    receivedOrgInvitation: state.user.receivedOrgInvitation
})

class UserOrgs extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            orgs: props.userOrgs,
        }
    }

    componentDidMount() {
        actions.user.getUserOrgs(this.props.currentUser.user_id)
        actions.user.getOrgInvitationByInvitee(this.props.currentUser.user_id)

        !this.props.allOrgs  && actions.organisation.fetchAllOrgs()
    }

    componentDidUpdate(prevProps) {
        prevProps.userOrgs !== this.props.userOrgs && this.setState({orgs: this.props.userOrgs})
    }

    handleClose = () => {
        this.setState({ modal: false })
    }

    handleOpen = () => {
        this.setState({modal: true})
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef
    }

    disassociate = (org, e) => {
        e.stopPropagation()
        const payload = {
            user_id: this.props.currentUser.user_id,
            organization_id: org.organization.organization_id
        }
        actions.organisation.disassociateOrgUser(payload)
    }

    handleSearch = (value) => {
        const { userOrgs } = this.props
        if (value === ''){
            this.setState ({orgs: userOrgs})
        }else{
            this.setState({orgs: userOrgs.filter(
                record=> record.name && record.name.toLowerCase().includes(value.toLowerCase()) ||
                    record.description && record.description.toLowerCase().includes(value.toLowerCase())) })
        }
    }

    render(){
        const { orgs } = this.state
        const { userOrgs,allOrgs, currentUser, receivedOrgInvitation } = this.props
        const columns = [
            {
                title: 'Organisation',
                dataIndex: ['organization','name'],
                key: 'name',
                sorter: (a, b) => sortString(a,b,'name'),
                render: (text, record) =>
                    <a onClick= {() => {
                        actions.routing.push(`/globalAdmin/organisation/${record.organization.organization_id}`)
                    }
                    }>
                        {text}
                    </a>
            },
            {
                title: 'Description',
                dataIndex: ['organization','description'],
                key: 'description'
            },
            {
                title: 'Website',
                dataIndex: ['organization','website'],
                key: 'website'
            },
            {
                title: 'General Phone Number',
                dataIndex: ['organization','general_phone_number'],
                key: 'general_phone_number'
            },
            {
                title: 'Contact Link',
                dataIndex: ['organization','contact_link'],
                key: 'contact_link'
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, org) => (
                    <Popconfirm
                        title="Are you sure disassociate this organisation?"
                        onConfirm={(e)=>this.disassociate(org, e)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a><Tooltip title="Disassociate this organisation">
                            <DeleteOutlined />
                        </Tooltip></a>
                    </Popconfirm>

                ),
            },
        ]
        return (
            <div className="contentPage">
                <Table scroll={{x: true}} className="table" loading={ userOrgs == null}
                    dataSource={orgs || userOrgs}
                    columns={columns}
                    rowKey="organization_user_id"
                />
                <Row>
                    <Col span={6}>
                        <Button
                            style={{ marginTop: '16px'}} type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>
                            Add Organisation
                        </Button>
                    </Col>
                </Row>
                <Divider />
                <Collapse>
                    <Collapse.Panel header="Pending user table" key={0}>
                        <Card>
                            <InviteTable
                                type="Org"
                                invites={receivedOrgInvitation}
                                searchInput={true}/>
                        </Card>
                    </Collapse.Panel>
                </Collapse>
                <AssociateOrgModal
                    currentUser= {currentUser}
                    userOrgs = {userOrgs}
                    allOrgs = {allOrgs}
                    open = {this.state.modal}
                    onCancel={this.handleClose}
                    wrappedComponentRef={this.saveFormRef}
                />
            </div>
        )
    }
}

UserOrgs.propTypes={
    currentUser: PropTypes.object.isRequired,
}


export default connect(mapStateToProps, null) (UserOrgs)
