import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Col, Input, Row, Table } from 'antd'
import { sortString } from '@/utility/Common'
import Register from './Organisations/CreateOrgModal'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    allOrgs: state.organisation.orgs
})

class Organisations extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            orgs: props.allOrgs,
            showingCount: props.allOrgs?.length,
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.allOrgs !== this.props.allOrgs && this.setState({orgs: this.props.allOrgs,
            showingCount: this.props.allOrgs.length,})
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

    handleSearch = (value) => {
        const { allOrgs } = this.props
        if (value === ''){
            this.setState ({orgs: allOrgs, showingCount: allOrgs.length})
        }else{
            const filtered = allOrgs.filter(
                record=> record.name && record.name.toLowerCase().includes(value.toLowerCase()) ||
                    record.description && record.description.toLowerCase().includes(value.toLowerCase()))
            this.setState({orgs: filtered, showingCount: filtered.length   })
        }
    }

    renderHeader = () => {
        return (<Fragment><Row justify="space-between" gutter={15} align="middle" className="margin-bottom">
            <Col xs={24} lg={12}>
                <Input.Search
                    style={{ width: 200, marginRight: 24 }}
                    placeholder="Search here ..."
                    onSearch={value => this.handleSearch(value)}
                    enterButton
                    autoFocus = {!isMobile}
                />
                <Button type="primary"  icon={<PlusOutlined />} onClick={this.handleOpen} >Create Organisation</Button>
            </Col>
            <Col xs={24} lg={12} className="text-right"><b>Showing {this.state.showingCount} organisations out of total {this.props.allOrgs?.length}</b></Col>
        </Row>
        </Fragment>)
    }



    render(){
        const { orgs } = this.state
        const { allOrgs } = this.props
        const columns = [
            {
                title: 'Organisation',
                dataIndex: 'name',
                key: 'name',
                sorter: (a, b) => sortString(a,b,'name'),
                render: (text, record) =>
                    <a onClick= {() => {
                        actions.organisation.save({
                            orgHubs: null,
                            orgBeacons: null,
                            orgRadars: null,
                            orgUsers: null,
                            orgTPs: null,
                            orgAPNs: null,
                            contacts: null,
                            orgInvitation: null,
                            orgContactType: null,
                            orgDeviceGroups: null,
                            orgDeviceGroupDevices: null,
                            orgUserGroups: null,
                            orgUserGroupUsers: null,
                            orgUserGroupRoles: null,
                            orgUserRoles: null,
                            allUserGroupUsers: null,
                            allDeviceGroupDevices: null,
                        })
                        actions.permission.save({
                            orgRoles: null,
                            orgProfiles: null
                        })
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
                title: 'Active',
                dataIndex: 'active',
                key: 'active',
                render: (value) => value ? 'Yes' : 'No'
            },
        ]
        return (
            <Fragment>
                <Table
                    scroll={{x: true}}
                    className="table"
                    loading={ allOrgs == null}
                    dataSource={orgs || allOrgs}
                    columns={columns}
                    rowKey="organization_id"
                    title={this.renderHeader}
                />
                <Register
                    open = {this.state.modal}
                    onCancel={this.handleClose}
                    wrappedComponentRef={this.saveFormRef}
                />
            </Fragment>
        )
    }
}


export default connect(mapStateToProps, null) (Organisations)
