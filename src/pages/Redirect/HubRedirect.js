import { Component } from 'react'
import { actions, connect, Redirect } from 'mirrorx'

const mapStateToProps = state => ({
    authenticated: !!(state.auth.authToken?.access_token),
    hubs: state.hub.hubs,
    location: state.routing.location,
})

class HubRedirect extends Component {

    constructor(props) {
        super(props)
        this.state={
            loading: true,
        }
    }

    componentDidMount() {
        actions.hub.getHubs().then(()=>this.setState({loading: false}))
    }

    render () {
        const {authenticated, hubs, match, location} = this.props
        const {loading} = this.state
        if (authenticated && !loading) {
            const selectedHub = hubs?.find(hub=>hub.hub_id==match.params.hubId)
            const page = match.params['0']
            selectedHub ? actions.hub.selectHub(selectedHub).then(()=>
                page? actions.routing.push(`/${page}`): actions.routing.push('/dashboard')) :
                actions.routing.push('/exception/403')
        }
        return !this.props.authenticated &&
            <Redirect
                to={{
                    pathname: location.pathname?.includes('login') ? '/login': `/login?path=${location.pathname}`,
                    state: { sourcePage: location.pathname}
                }}
            />
    }
}

export default connect(mapStateToProps,null)(HubRedirect)
