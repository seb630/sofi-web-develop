import mirror, {actions, connect} from 'mirrorx'
import {globalConstants} from '@/_constants'
import OrganisationSettings from '../pages/Organisation/Settings'

// listen to route change,
// when is entering `/dashboard`, load data
mirror.hook((action, getState) => {
    const {routing: {location}, user: {me}} = getState()
    if (action.type === globalConstants.LOCATION_CHANGE && location.pathname.includes('/organisationSettings')) {
        me ?  fetchUserData (me) : actions.user.me().then(() => {
            fetchUserData (getState().user.me)
        })

    }
})

function fetchUserData (me){
    actions.user.getUserOrgs(me?.user_id)
    me?.authorities?.some(role=>role.includes('ADMIN')) && actions.organisation.fetchAllOrgs()
}

export default connect(state => state.setting) (OrganisationSettings)
