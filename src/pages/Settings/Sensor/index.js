import Sensor from './Sensor'
import Space from './Space'
import Radar from './Radar'
import NewSensor from './NewSensor'
import { Divider, Tabs } from 'antd'
import { connect } from 'mirrorx'
import { removeDuplicateDevices } from '@/utility/Common'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    hubDevices: state.hub.hubDevices,
    hubSpaces: state.hub.hubSpaces,
    hubNewDevices: state.hub.hubNewDevices,
    hubRadars: state.hub.hubRadars,
    radars: removeDuplicateDevices(state.user.dashboardOverview.radars),
    hubUsers: state.hub.hubUsers,
    hubRadarUsers: state.hub.hubRadarUsers,
})

const People = (props) =>{
    return (
        props.selectedHub && <Tabs>
            <Tabs.TabPane tab="Sensors" key="Sensor">
                <Sensor/>
                <Divider />
                <NewSensor />
            </Tabs.TabPane>
            {/*<Tabs.TabPane tab={`${globalConstants.RADAR_HOBA}s`} key="Radars">*/}
            {/*    <Radar {...props} />*/}
            {/*</Tabs.TabPane>*/}
            <Tabs.TabPane tab="Spaces" key="Spaces">
                <Space/>
            </Tabs.TabPane>
        </Tabs>
    )
}

export default connect(mapStateToProps, null) (People)
