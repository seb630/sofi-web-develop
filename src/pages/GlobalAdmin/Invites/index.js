import { connect } from 'mirrorx'
import InviteTable from '../../../components/InviteTable'

const mapStateToProps = state => ({
    allInvitation: state.user.allInvitation,
    allBeaconInvitation: state.user.allBeaconInvitation,
    allRadarInvitation: state.user.allRadarInvitation

})

export const HubInvite =  connect(mapStateToProps, null) ((props) => <InviteTable invites={props.allInvitation} searchInput={true} type="Hub"/>)

export const BeaconInvite =  connect(mapStateToProps, null) ((props) => <InviteTable invites={props.allBeaconInvitation} searchInput={true} type="Beacon"/>)

export const RadarInvite =  connect(mapStateToProps, null) ((props) => <InviteTable invites={props.allRadarInvitation} searchInput={true} type="Radar"/>)
