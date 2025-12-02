import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Popconfirm, Row, Table, Tooltip } from 'antd'
import { sortString } from '@/utility/Common'
import DirectAddModal from './DirectAddModal'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubOrgs: state.hub.hubOrgs,
    allOrgs: state.organisation.orgs,
    isAdmin: state.user.me ? state.user.me.authorities.some(role=>role.includes('ADMIN')) : false,
})

class HubOrgs extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
        }
    }

    handleClose = () => {
        this.setState({ modal: false })
    }

    handleOpen = () => {
        this.setState({modal: true})
    }

    disassociate = (org, e) => {
        e.stopPropagation()
        const payload = {
            type: 'HUB',
            device_id_ref: this.props.selectedHub.hub_id,
            organization_id: org.organization_id
        }
        actions.organisation.disassociateOrgDevice(payload).then(()=>{
            actions.hub.getHubOrgs(this.props.selectedHub.hub_id)
        })
    }

    render(){
        const { hubOrgs, allOrgs, selectedHub, isAdmin } = this.props
        const columns = [
            {
                title: 'Organisation',
                dataIndex: 'name',
                key: 'name',
                sorter: (a, b) => sortString(a,b,'name'),
                render: (text, record) =>
                    <a onClick= {() => {
                        actions.routing.push(`/globalAdmin/organisation/${record.organization_id}`)
                    }
                    }>
                        {text}
                    </a>
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description'
            },
            {
                title: 'Website',
                dataIndex: 'website',
                key: 'website'
            },
            {
                title: 'General Phone Number',
                dataIndex: 'general_phone_number',
                key: 'general_phone_number'
            },
            {
                title: 'Contact Link',
                dataIndex: 'contact_link',
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
                <Table scroll={{x: true}}
                    className="table"
                    loading={ hubOrgs == null}
                    dataSource={hubOrgs}
                    columns={columns}
                    rowKey="organization_id"
                />
                {isAdmin && <Row>
                    <Col span={6}>
                        <Button
                            style={{ marginTop: '16px'}} type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>
                            Add Organisation
                        </Button>
                    </Col>
                </Row>}
                <DirectAddModal
                    currentDevice= {selectedHub}
                    deviceOrgs = {hubOrgs}
                    allOrgs = {allOrgs}
                    open = {this.state.modal}
                    onCancel={this.handleClose}
                    type="HUB"
                />
            </div>
        )
    }
}

export default connect(mapStateToProps, null) (HubOrgs)
