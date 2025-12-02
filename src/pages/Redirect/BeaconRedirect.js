import { Component } from 'react'
import { actions, connect, Redirect } from 'mirrorx'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    authenticated: !!(state.auth.authToken?.access_token),
    beacons: state.sofiBeacon.beacons.beacons,
    location: state.routing.location,
})

class BeaconRedirect extends Component {

    constructor(props) {
        super(props)
        this.state={
            loading: true,
        }
    }

    componentDidMount() {
        actions.sofiBeacon.fetchBeaconByUser().then(()=>this.setState({loading: false}))
    }

    render () {
        const {authenticated, beacons, match, location} = this.props
        const {loading} = this.state
        const isUUID = globalConstants.UUID_REGEX.test(match.params.beaconId)

        if (authenticated && !loading && isUUID) {
            const selectedBeacon = beacons?.find(beacon => beacon.pub_id == match.params.beaconId.toLowerCase())
            const page = match.params['0']
            selectedBeacon ? actions.sofiBeacon.selectBeacon(selectedBeacon).then(() =>
                page ? actions.routing.push(`/beacon/${page}`) : actions.routing.push('/beacon/dashboard')) :
                actions.routing.push('/exception/403')

        }
        return !this.props.authenticated &&
            <Redirect
                to={{
                    pathname: location.pathname?.includes('login') ? '/login': `/login?path=${location.pathname}`,
                    state: { sourcePage:  location.pathname}
                }}
            />
    }
}

export default connect(mapStateToProps,null)(BeaconRedirect)
