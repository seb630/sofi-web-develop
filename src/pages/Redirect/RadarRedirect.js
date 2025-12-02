import { Component } from 'react'
import { actions, connect, Redirect } from 'mirrorx'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    authenticated: !!(state.auth.authToken?.access_token),
    radars: state.radar.radars,
    location: state.routing.location,
})

class RadarRedirect extends Component {

    constructor(props) {
        super(props)
        this.state={
            loading: true,
        }
    }

    componentDidMount() {
        actions.radar.fetchAllRadars().then(()=>this.setState({loading: false}))
    }

    render () {
        const {authenticated, radars, match, location} = this.props
        const {loading} = this.state
        const isUUID = globalConstants.UUID_REGEX.test(match.params.radarId)

        if (authenticated && !loading && isUUID) {
            const selectedRadar = radars?.find(radar=>radar.pub_id==match.params.radarId)
            const page = match.params['0']

            selectedRadar ? actions.radar.selectRadar(selectedRadar).then(()=>
                page ? actions.routing.push(`/radar/${page}`) : actions.routing.push('/radar/dashboard')) :
                actions.routing.push('/exception/403')
        }
        return !this.props.authenticated &&
            <Redirect
                to={{
                    pathname: location.pathname?.includes('login') ? '/login': `/login?path=${location.pathname}`,
                    state: { from:  location.pathname}
                }}
            />
    }
}

export default connect(mapStateToProps,null)(RadarRedirect)
