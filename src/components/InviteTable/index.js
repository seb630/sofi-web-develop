import { Component } from 'react'
import { actions } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { Col, Input, Popconfirm, Row, Table, Tooltip } from 'antd'
import { isWatch, sortDateTime, sortString } from '@/utility/Common'
import PropTypes from 'prop-types'
import moment from 'moment'
import { globalConstants } from '@/_constants'

class InviteTable extends Component{
    constructor(props) {
        super(props)
        this.state = {
            invites: this.props.invites,
        }
    }

    componentDidUpdate(prevProps){
        prevProps.invites!==this.props.invites && this.setState({invites: this.props.invites})
    }

    renderHeader = () =>
        <Row type="flex" gutter={15} align="middle">
            <Col>
                <Input.Search
                    placeholder="Search here ..."
                    onSearch={value => this.handleSearch(value)}
                    style={{ width: 200 }}
                    enterButton
                    autoFocus
                />
            </Col>
        </Row>

    handleSearch = (value) => {
        if (value===''){
            this.setState ({invites: this.props.invites})
        }else{
            if (this.props.type==='Beacon'){
                this.setState({invites: this.props.invites.filter(
                    record=> record.email?.includes(value.toLowerCase()) ||
                    record.beacon_display_name?.toLowerCase().includes(value.toLowerCase())||
                    record.beacon_user_firstname?.toLowerCase().includes(value.toLowerCase())||
                    record.beacon_user_lastname?.toLowerCase().includes(value.toLowerCase()))})
            }else if (this.props.type==='Hub'){
                this.setState({invites: this.props.invites.filter(
                    record=> record.email?.includes(value.toLowerCase())||
                            record.hub_display_name?.toLowerCase().includes(value.toLowerCase())||
                            record.hub_user_firstname?.toLowerCase().includes(value.toLowerCase())||
                            record.hub_user_lastname?.toLowerCase().includes(value.toLowerCase()))})
            }else if (this.props.type==='Radar'){
                this.setState({invites: this.props.invites.filter(
                    record=> record.email?.includes(value.toLowerCase())||
                            record.product_display_name?.toLowerCase().includes(value.toLowerCase())||
                            record.inviter_firstname?.toLowerCase().includes(value.toLowerCase())||
                            record.inviter_lastname?.toLowerCase().includes(value.toLowerCase()))})
            }else {
                this.setState({invites: this.props.invites.filter(
                    record=> record.email && record.email.toLowerCase().includes(value.toLowerCase())||
                    record.organization_name?.toLowerCase().includes(value.toLowerCase())||
                    record.inviter_firstname?.toLowerCase().includes(value.toLowerCase())||
                    record.inviter_lastname?.toLowerCase().includes(value.toLowerCase()))})
            }

        }
    }

    delete = (invite) => {
        if (this.props.type==='Beacon'){
            actions.user.declineBeaconInvite({inviteId: invite.id, userId: 'admin', beaconId: this.props.beaconId})
        }else if (this.props.type==='Hub'){
            actions.user.declineInvite({inviteId: invite.hub_carer_invitation_id, userId: 'admin', hubId: this.props.hubId})
        }else if (this.props.type==='Radar'){
            actions.user.declineRadarInvite({inviteId: invite.product_carer_invitation_id, userId: 'admin', radarId: this.props.radarId})
        } else {
            actions.organisation.declineOrgInvite({inviteId: invite.organization_user_invitation_id, userId: 'admin', orgId: this.props.orgId})
        }
    }

    render(){
        const dataSource = this.state.invites
        const columns = [
            {
                title: 'Invitee Email',
                dataIndex: 'email',
                key: 'email',
                sorter: (a, b) => sortString(a,b,'email'),
            },
            {
                title: 'Inviter First Name',
                dataIndex: this.props.type==='Beacon' ? 'beacon_user_firstname' :
                    this.props.type ==='Hub' ? 'hub_user_firstname': 'inviter_firstname',
                key: 'hub_user_firstname',
                sorter: (a, b) => sortString(a,b,this.props.type==='Beacon' ? 'beacon_user_firstname' :
                    this.props.type ==='Hub' ? 'hub_user_firstname': 'inviter_firstname',),
            },
            {
                title: 'Inviter Last Name',
                dataIndex: this.props.type==='Beacon'?'beacon_user_lastname' :
                    this.props.type ==='Hub' ? 'hub_user_lastname': 'inviter_lastname',
                key: 'hub_user_lastname',
                sorter: (a, b) => sortString(a,b,this.props.type==='Beacon'?'beacon_user_lastname' :
                    this.props.type ==='Hub' ? 'hub_user_lastname':'inviter_lastname'),

            },
            {
                title: `${this.props.type==='Beacon'? 'Beacon' : this.props.type == 'Watch' ? 'Watch' : this.props.type ==='Hub' ? 'Hub' : this.props.type ==='Radar' ? 'Radar' : 'Organisation'} Name`,
                dataIndex: this.props.type==='Beacon'? 'beacon_display_name' :
                    this.props.type ==='Hub' ? 'hub_display_name': this.props.type ==='Radar' ? 'product_display_name':'organization_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,this.props.type==='Beacon'? 'beacon_display_name' :
                    this.props.type ==='Hub' ? 'hub_display_name': this.props.type ==='Radar' ? 'product_display_name':'organization_name'),
            },
            {
                title: 'Expire Time',
                dataIndex: 'expiry',
                key: 'expiry',
                render: (text) => moment(text).format('DD-MM-YYYY HH:mm'),
                sorter: (a, b) => sortDateTime(a.expiry,b.expiry),
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, invite) => (
                    <Popconfirm
                        title={`Are you sure you want to delete the invite to ${invite.email}`}
                        onConfirm={()=>this.delete(invite)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a><Tooltip title="Delete this invite"><DeleteOutlined /></Tooltip></a>
                    </Popconfirm>
                ),
            },

        ]
        return (
            <Row>
                <Col span={24}>
                    <Table scroll={{x: true}}
                        loading={this.props.invites===null}
                        dataSource={dataSource}
                        columns={columns}
                        rowKey={this.props.type==='Beacon'? 'id': this.props.type ==='Hub'? 'hub_carer_invitation_id':this.props.type ==='Radar'? 'product_carer_invitation_id':'organization_user_invitation_id'}
                        title={this.props.searchInput ? this.renderHeader : this.props.otherTitle}
                        footer={this.props.footer}
                    />
                </Col>
            </Row>
        )
    }
}

InviteTable.propTypes= {
    type: PropTypes.oneOf(['Hub', 'Beacon','Org', 'Radar']),
    hubId: PropTypes.string,
    beaconId: PropTypes.string,
    radarId: PropTypes.number,
    orgId: PropTypes.number,
    invites: PropTypes.array,
    searchInput: PropTypes.bool,
    otherTitle: PropTypes.func,
    footer: PropTypes.func,
}

InviteTable.defaultProps= {
    searchInput: false,
    otherTitle: null,
    footer: null,
}

export default InviteTable
