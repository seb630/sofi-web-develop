import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Card, Col, DatePicker, Row } from 'antd'
import moment from 'moment'
import Media from 'react-media'
import { globalConstants } from '@/_constants'

class Filter extends Component {

    /** handle search history */
    handleRangePickerChanged = (value) => {
        actions.radar.save({anomalyMonth: value})
        const { selectedRadar } = this.props
        const radarId = selectedRadar.id
        actions.radar.getRadarAnomalies({radarId,
            fromTime: value.clone().startOf('month'),
            toTime: value.clone().endOf('month'),
            size: globalConstants.TIMELINE_SIZE, page: 1 })
    }

    handleMovingArrow = (forward) => {
        const { selectedRadar, anomalyMonth } = this.props
        let date = anomalyMonth
        const radarId = selectedRadar.id
        date = moment(date).add(forward,'month')
        const fromTime = date.clone().startOf('month')
        const toTime = date.clone().endOf('month')
        actions.radar.save({anomalyMonth: date})

        actions.radar.getRadarAnomalies({radarId, fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: 1 })
    }

    /** disable date */
    disabledDate(current) {
        return current && current > moment().endOf('day')
    }

    render() {
        const date = this.props.anomalyMonth
        const lgFilter = (<Fragment>
            <Col>
                <strong> Month: </strong>
            </Col>
            <Col>
                <Button className="filter-history__arrow " onClick={this.handleMovingArrow.bind(this,-1)} type="primary">
                    <LeftOutlined />
                </Button>
            </Col>
            <Col>
                <DatePicker.MonthPicker
                    className="short-input"
                    placeholder="Select month"
                    allowClear={false}
                    value={date}
                    onChange={this.handleRangePickerChanged}
                    disabledDate={this.disabledDate} />
            </Col>
            <Col>
                <Button className="filter-history__arrow " disabled={date.isSameOrAfter(moment(),'month') } onClick={this.handleMovingArrow.bind(this,1)} type="primary">
                    <RightOutlined />
                </Button>
            </Col>
        </Fragment>)

        return (
            <Card
                bodyStyle={{ padding: '10px'}}
                className="card-shadow card-radius"
                bordered={false}
                title="Filters"
                size="small"
            >
                <Media query="(max-width: 768px)">
                    {matches =>
                        matches ?
                            <Fragment>
                                <Row type="flex" align="middle" gutter={12}>
                                    {lgFilter}
                                </Row>
                            </Fragment>
                            :
                            <Row type="flex" align="middle" gutter={12} >
                                {lgFilter}
                            </Row>
                    }
                </Media>
            </Card>
        )
    }
}

export default Filter
