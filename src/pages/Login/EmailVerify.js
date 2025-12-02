import { Component } from 'react'
import { actions } from 'mirrorx'
import 'url-search-params-polyfill'
import './LoginPage.scss'
import queryString from 'query-string'
import Logo from '../../images/logo.svg'

export default class emailVerify extends Component {

    componentDidMount() {
        const parsed = queryString.parse(this.props.location.search)
        actions.user.verifyEmail(parsed.token).then(()=>{
            actions.routing.push({
                pathname: '/login',
                state: {verified: true}
            })
        }).catch((error)=>{
            actions.routing.push({
                pathname: '/login',
                state: {error: error, token: parsed.token}
            })
        })
    }

    render() {

        return(
            <div className="loginPage-form">
                <div className="loginPage-form__logo">
                    <Logo width={230} height={120}/>
                </div>
            </div>
        )
    }
}
