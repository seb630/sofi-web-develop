import { Component, Fragment } from 'react'
import NoticeIcon from '../../../components/NoticeIcon/index'
import { BankOutlined, BellOutlined } from '@ant-design/icons'
import { Button, Divider } from 'antd'
import { MyIcon } from '../Common'
import RadarNotification from '@/images/radar_notification.svg'
import { globalConstants } from '@/_constants'
import { actions, connect } from 'mirrorx'
import moment from 'moment'
import TCModal from '../../../components/TCModal/AcceptTCModal'
import AcceptOrgModal from '../../../components/InviteOrgModal/AcceptOrgModal'
import DownTime from '../../../_constants/downtime'

const latestDownTime = DownTime[DownTime.length - 1]
const start = moment(latestDownTime.outageDateTimeStart)
const end = moment(latestDownTime.outageDateTimeEnd)
const blockAccess = latestDownTime.blockPortalAccess

const mapStateToProps = state => ({
    receivedInvitation: state.user.receivedInvitation,
    me: state.user.me,
})


class NotificationIcon extends Component {

    constructor(props) {
        super(props)
        this.state = {
            tcModal: false,
            orgModal: false,
            orgName: '',
            inviteId: null,
            type: ''
        }
    }

    componentDidMount() {
        actions.user.getInvitationByInvitee(this.props.me.user_id)
        this.fetchInvitation = setInterval(() => {
            if (moment().isBetween(start, end) && blockAccess) {
                actions.routing.push('/offline')
            }
            actions.user.getInvitationByInvitee(this.props.me.user_id)

        }, globalConstants.GENERAL_AUTO_REFRESH_TIME * 100)
    }

    componentWillUnmount() {
        clearInterval(this.fetchInvitation)
    }

    handleTCModal = (state) => {
        this.setState({ tcModal: state })
    }

    handleOrgModal = (state) => {
        this.setState({ orgModal: state })
    }

    handleTCModalSubmit = () => {
        this.handleTCModal(false)
        this.handleOrgModal(false)
        this.state.type === 'beacon' ?
            actions.user.acceptBeaconInvite({ inviteId: this.state.inviteId, userId: this.props.me.user_id })
                .then(() => window.location.reload()) :
            this.state.type === 'radar' ?
                actions.user.acceptRadarInvite({ inviteId: this.state.inviteId, userId: this.props.me.user_id })
                    .then(() => window.location.reload()) :
                this.state.type === 'hub' ?
                    actions.user.acceptInvite({ inviteId: this.state.inviteId, userId: this.props.me.user_id })
                        .then(() => window.location.reload()) :
                    actions.organisation.acceptInvite({ inviteId: this.state.inviteId, userId: this.props.me.user_id })
                        .then(() => window.location.reload())
    }

    decline = (inviteId, type) => {
        type === 'beacon' ? actions.user.declineBeaconInvite({ inviteId, userId: this.props.me.user_id }) :
            type === 'hub' ? actions.user.declineInvite({ inviteId, userId: this.props.me.user_id }) :
                type === 'radar' ? actions.user.declineRadarInvite({ inviteId, userId: this.props.me.user_id }) :
                    actions.organisation.declineOrgInvite({ inviteId, userId: this.props.me.user_id })
    }

    accept = (inviteId, type, orgName) => {
        // console.log(this.props)
        this.setState({ inviteId, type, orgName })
        type === 'org' ? this.handleOrgModal(true) : this.handleTCModal(true)
    }

    generateTitle = (invite, type) => {
        if (type === 'org') {
            return <div>You&#39;re invited to be a user of {invite.organization_name}</div>
        } else {
            const firstName = type === 'beacon' ? invite.beacon_user_firstname : type === 'radar' ? invite.inviter_firstname : invite.hub_user_firstname
            const lastName = type === 'beacon' ? invite.beacon_user_lastname : type === 'radar' ? invite.inviter_lastname : invite.hub_user_lastname
            const hubName = type === 'beacon' ? invite.beacon_display_name : type === 'radar' ? invite.radar_display_name : invite.hub_display_name
            // const device = type === 'beacon' ? globalConstants.BEACON_SOFIHUB : type === 'radar' ? globalConstants.RADAR_HOBA : globalConstants.HUB_SOFIHUB
            const device = 'pendant'
            if (firstName && lastName) {
                return <div>{firstName} {lastName} invited you to be a account manager for a {device}</div>
            } else if (firstName) {
                return <div>{firstName} invited you to be a account manager for a {device}</div>
            } else if (hubName) {
                return <div>You&#39;re invited to be a account manager for a {device} called: {hubName}</div>
            } else {
                return <div>You&#39;re invited to be a account manager for a {device}</div>
            }
        }
    }

    handleInvites = (invites, type) => {
        return invites?.map(invite => {
            let newInvite = { ...invite }
            newInvite.datetime = <div>Expires on: {moment(newInvite.expiry).format('DD-MM-YYYY')}</div>
            if (type === 'hub') {
                // transform id to item key
                if (newInvite.hub_carer_invitation_id) {
                    newInvite.key = newInvite.hub_carer_invitation_id
                }
                newInvite.description = <div>
                    <Button
                        size="small" title="Decline invite"
                        onClick={() => this.decline(newInvite.hub_carer_invitation_id, 'hub')}>Decline</Button>
                    <Divider type="vertical" />
                    <Button
                        size="small" type='primary' title="Accept invite"
                        onClick={() => this.accept(newInvite.hub_carer_invitation_id, 'hub')}>
                        Accept</Button>
                </div>
                newInvite.avatar = <MyIcon type="icon-hub_icon_in_circle1" />
                newInvite.title = this.generateTitle(newInvite, 'hub')
            } else if (type === 'beacon') {
                if (newInvite.id) {
                    newInvite.key = newInvite.id
                }
                newInvite.description = <div>
                    <Button
                        size="small" title="Decline invite"
                        onClick={() => this.decline(newInvite.id, 'beacon')}>Decline</Button>
                    <Divider type="vertical" />
                    <Button
                        size="small" type='primary' title="Accept invite"
                        onClick={() => this.accept(newInvite.id, 'beacon')}>
                        Accept</Button>
                </div>
                newInvite.avatar = <MyIcon type="icon-beacon_icon_in_circle1" />
                newInvite.title = this.generateTitle(newInvite, 'beacon')
            } else if (type === 'radar') {
                if (newInvite.product_carer_invitation_id) {
                    newInvite.key = newInvite.product_carer_invitation_id
                }
                newInvite.description = <div>
                    <Button
                        size="small" title="Decline invite"
                        onClick={() => this.decline(newInvite.product_carer_invitation_id, 'radar')}>Decline</Button>
                    <Divider type="vertical" />
                    <Button
                        size="small" type='primary' title="Accept invite"
                        onClick={() => this.accept(newInvite.product_carer_invitation_id, 'radar')}>
                        Accept</Button>
                </div>
                newInvite.avatar = <RadarNotification style={{ fontSize: 50 }} />
                newInvite.title = this.generateTitle(newInvite, 'radar')
            } else {
                if (newInvite.id) {
                    newInvite.key = newInvite.organization_user_invitation_id
                }
                newInvite.description = <div>
                    <Button
                        size="small" title="Decline invite"
                        onClick={() => this.decline(newInvite.organization_user_invitation_id, 'org')}>Decline</Button>
                    <Divider type="vertical" />
                    <Button
                        size="small" type='primary' title="Accept invite"
                        onClick={() => this.accept(newInvite.organization_user_invitation_id, 'org', newInvite.organization_name)}>
                        Accept</Button>
                </div>
                newInvite.avatar = <BankOutlined />
                newInvite.title = this.generateTitle(newInvite, 'org')
            }

            return newInvite
        })

    }

    getInvites = (invites) => {
        const hubInvites = invites.hubs?.length !== 0 ? this.handleInvites(invites.hubs, 'hub') : []
        const beaconInvites = invites.beacons?.length !== 0 ? this.handleInvites(invites.beacons, 'beacon') : []
        const radarInvites = invites.products?.length !== 0 ? this.handleInvites(invites.products, 'radar') : []
        const orgInvites = invites.organizations && invites.organizations.length !== 0 ? this.handleInvites(invites.organizations, 'org') : []
        return hubInvites.concat(beaconInvites, radarInvites, orgInvites)
    }

    render() {
        const invites = this.getInvites(this.props.receivedInvitation)

        return (
            <Fragment>
                <NoticeIcon
                    bell={<BellOutlined />}
                    className="noticeButton"
                    count={invites.length}
                >
                    <NoticeIcon.Tab
                        tabKey="Invite"
                        list={invites}
                        title="Invite"
                        emptyText={<div>
                            <p>No Invitations</p>
                            <p>Missing an invite?</p>
                            <span>Invitations expire from time to time, or are removed. If you think there is a missing
                                invitation please get in touch with account manager for that {globalConstants.HUB_SOFIHUB} or {globalConstants.BEACON_SOFIHUB}.</span>
                        </div>}
                        showClear={false}
                    />
                </NoticeIcon>
                <TCModal
                    handleModalstate={this.handleTCModal}
                    handleSubmit={this.handleTCModalSubmit}
                    modal={this.state.tcModal}
                />
                <AcceptOrgModal
                    handleModalstate={this.handleOrgModal}
                    handleSubmit={this.handleTCModalSubmit}
                    modal={this.state.orgModal}
                    orgName={this.state.orgName}
                />
            </Fragment>

        )
    }
}

export default connect(mapStateToProps, null)(NotificationIcon)
