import { connect, Redirect, Route } from 'mirrorx'
import { bool, func, object, oneOfType } from 'prop-types'

const mapStateToProps = state => ({
    authenticated: !!(state.auth.authToken?.access_token),
})

const props = {
    component:  oneOfType([object, func]),
    authenticated: bool,
}

const _PrivateRoute = ({ component: Component, authenticated, ...rest }) => {
    return (
        <Route {...rest} render={props => (
            authenticated ?
                <Component {...props} {...rest}/>
                : <Redirect to={{
                    pathname: '/login',
                    state: { from: props.location.pathname }
                }}/>
        )}/>
    )
}

const _Route = ({ component: Component, ...rest }) => {
    return (
        <Route {...rest} render={props => (
            <Component {...props} {...rest}/>
        )}/>
    )
}

const _NonPrivateRoute = ({ component: Component, authenticated, ...rest }) => {
    return (
        <Route {...rest} render={props => (
            authenticated ?
                <Redirect to={{
                    pathname: '/deviceSelection',
                    state: { from: props.location.pathname }
                }}/>:
                <Component {...props} {...rest} />
        )}/>
    )
}

_PrivateRoute.propTypes = props
_NonPrivateRoute.propTypes = props
_Route.propTypes = props

export const PrivateRoute = connect(mapStateToProps)(_PrivateRoute)
export const NonPrivateRoute = connect(mapStateToProps)(_NonPrivateRoute)
export const AllRoute = connect(mapStateToProps)(_Route)
