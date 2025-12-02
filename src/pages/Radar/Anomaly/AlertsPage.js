import { Component, createRef } from 'react'
import Alert from './Alert'
import moment from 'moment-timezone'
import { actions, connect } from 'mirrorx'
import { Col, Divider, List, Row, Spin } from 'antd'
import Filter from './Alert/Filter'
import { sortDateTime } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedRadar: state.radar.selectedRadar,
    anomalies: state.radar.anomalies,
    activeAnomalies: state.radar.activeAnomalies,
    anomalyMonth: state.radar.anomalyMonth,
    loading: state.radar.loading
})

class AlertsPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            anomalies: props.anomalies,
            date: moment().startOf('month'),
        }
        this.formRef = createRef()
    }

    componentDidUpdate (prevProps) {
        prevProps.anomalies !== this.props.anomalies && this.setState({anomalies: this.props.anomalies})
    }

    onPageChange = (page, pageSize) => {
        const fromTime = this.props.anomalyMonth.clone().startOf('month')
        const toTime = this.props.anomalyMonth.clone().endOf('month')

        actions.radar.getRadarAnomalies({
            radarId:this.props.selectedRadar.id,
            page,
            pageSize,
            fromTime,
            toTime
        })
    }

    render() {
        const { selectedRadar, anomalyMonth, loading, activeAnomalies } = this.props
        const timezone = selectedRadar?.timezone
        const { anomalies } = this.state
        let active = activeAnomalies?.content.filter(result => !result?.ack_at).sort((a,b)=>sortDateTime(b.alarm_at,a.alarm_at)) || []
        let resolved = anomalies?.content.filter(result => result?.ack_at).sort((a,b)=>sortDateTime(b.alarm_at,a.alarm_at)) || []
        return (
            <Spin spinning={loading} >
                <div className="contentPage">
                    <Row>
                        <Col span={24}>
                            <Filter
                                selectedRadar={selectedRadar}
                                anomalyMonth={anomalyMonth}
                            />
                        </Col>
                    </Row>
                    <Divider/>
                    <Row>
                        <Col span={24}>
                            <Row
                                justify="space-between"
                                style={{ fontSize: '20px', fontWeight: 700, paddingBottom: '15px' }}
                            >
                                <Col>Current Active Events</Col>
                            </Row>
                            {active.length > 0 ? active.map((anomaly, i) =>
                                <Alert
                                    key={i}
                                    alert={anomaly}
                                    radarId={selectedRadar?.id}
                                    timezone={timezone}
                                />) :
                                <span>
                                    There are currently no active anomalies. You can see resolved anomalies below, and filter by month.
                                </span>
                            }
                            <Divider/>
                            <div style={{ fontSize: '20px', fontWeight: 700, paddingBottom: '15px' }}>Recent events</div>
                            {resolved.length > 0 ? <List
                                dataSource={resolved}
                                pagination={{
                                    style: {marginRight: 16, marginBottom: 24},
                                    total: anomalies?.total_elements - active?.length,
                                    showSizeChanger: true,
                                    hideOnSinglePage: true,
                                    onChange: this.onPageChange,
                                    position: 'both'
                                }}
                                renderItem={(anomaly, i) =>
                                    <Alert
                                        key={i}
                                        alert={anomaly}
                                        radarId={selectedRadar?.id}
                                        timezone={timezone}
                                    />} />
                                :
                                <span>
                                    No events for {moment(anomalyMonth).format('MMMM YYYY')}, You can check older events by selecting previous months in the filter above.
                                </span>
                            }
                        </Col>
                    </Row>
                </div>
            </Spin>
        )
    }
}

export default connect(mapStateToProps, null) (AlertsPage)
