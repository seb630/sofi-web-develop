import { Component } from 'react'
import Anomalies from './Anomalies'
import RadarStatus from './Status'
import { actions, connect } from 'mirrorx'
import DownTime from '@/_constants/downtime'
import moment from 'moment'
import RadarMapCard from '@/pages/Radar/Dashboard/Map'
import { Spin } from 'antd'
import { ExpiryBanner } from '@/pages/Common/Banner'

const latestDownTime = DownTime[DownTime.length - 1]
const start = moment(latestDownTime.outageDateTimeStart)
const end = moment(latestDownTime.outageDateTimeEnd)

const mapStateToProps = state => ({
    selectedRadar: state.radar.selectedRadar,
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    radarStateHistory: state.radar.radarStateHistory,
    selectedStateHistoryPersons: state.radar.selectedStateHistoryPersons,
    radarConfig: state.radar.radarConfig,
    allAnomalies: state.radar.allAnomalies,
    activeAnomalies: state.radar.activeAnomalies,
    loading: state.radar.loading,
    showXYZData: state.radar.showXYZData,
    showFallLayer: state.radar.showFallLayer,
    showLive: state.radar.showLive,
    subscription: state.billing.subscription,
    radarSurrounds: state.radar.radarSurrounds
})

class DashboardPage extends Component {

    componentDidMount () {
        if (moment().isBetween(start,end)){
            actions.routing.push('/offline')
        }
    }


    render() {
        const { selectedRadar, loading, radarConfig, subscription, radarSurrounds, activeAnomalies } = this.props
        return (
            <Spin spinning={loading} >
                {selectedRadar && <Anomalies selectedRadar={selectedRadar}/>}
                <ExpiryBanner subscription={subscription}/>
                {selectedRadar && <RadarStatus radar={selectedRadar} activeAnomalies={activeAnomalies}/>}

                {selectedRadar?.persons && radarConfig && !loading && radarSurrounds && <RadarMapCard {...this.props} />}
            </Spin>
        )
    }
}

export default connect(mapStateToProps, null) (DashboardPage)
