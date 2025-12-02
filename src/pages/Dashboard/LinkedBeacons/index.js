import { Component, Fragment } from 'react'
import { connect } from 'mirrorx'
import moment from 'moment-timezone'
import BeaconComponent from './BeaconComponent'

const mapStateToProps = state => ({
    hubBeaconHeadstates: state.hub.hubBeaconHeadstates,
    selectedHub: state.hub.selectedHub,
    timezone: state.user.useHubTimeZone && state.setting.settings?.preferences?.timezone,
    selectedHubBeacons: state.hub.selectedHubBeacons
})


class LinkedBeacons extends Component{

    render(){
        const { timezone, selectedHub, hubBeaconHeadstates} = this.props
        timezone && moment.tz.setDefault(this.props.timezone)

        return(
            selectedHub && hubBeaconHeadstates ?
                <Fragment>
                    {hubBeaconHeadstates.map((headState,i)=>
                        <div key={i}>
                            <BeaconComponent
                                headState={headState}
                                {...this.props}
                            />
                        </div>
                    )}
                </Fragment>
                : null
        )
    }

}

export default connect(mapStateToProps, null)(LinkedBeacons)
