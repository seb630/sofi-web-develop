import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Row, Col, DatePicker, Card, Button, Checkbox, Switch, Divider } from 'antd'
import moment from 'moment'
import Media from 'react-media'
import './alert.scss'
import {globalConstants} from '@/_constants'

class Filter extends Component {

    /** handle search history */
    handleRangePickerChanged = (value) => {
        actions.hub.save({anomalyMonth: value})
        const { selectedHub } = this.props
        const hubId = selectedHub.hub_id
        actions.hub.getDetailedAnomalies({hubId,
            fromTime: value.clone().startOf('month'),
            toTime: value.clone().endOf('month'),
            size: globalConstants.TIMELINE_SIZE, page: 0 })
    }

    /** handle moving arrow
     * @param : {number} forward {-1,1}
     */
    handleMovingArrow = (forward) => {
        const { selectedHub } = this.props
        let date = this.props.anomalyMonth
        const hubId = selectedHub.hub_id
        date = moment(date).add(forward,'month')
        const fromTime = date.clone().startOf('month')
        const toTime = date.clone().endOf('month')
        actions.hub.save({anomalyMonth: date})

        actions.hub.getDetailedAnomalies({hubId, fromTime, toTime, size: globalConstants.TIMELINE_SIZE, page: 0 })
    }

    /** disable date */
    disabledDate(current) {
        return current && current > moment().endOf('day')
    }

    render() {
        const typeList = ['Late to bed', 'Late to wake','Bathroom too long']
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

        const typeFilter = <Fragment>
            <Col>
                <strong>Type: </strong>
            </Col>
            <Col>
                <Checkbox.Group options={typeList} defaultValue={typeList} onChange={this.props.handleTypeFilter} />
            </Col>
        </Fragment>

        const testFilter = <Fragment>
            <Col>
                <strong>Show Testing Notifications: </strong>
                <Switch checked={this.props.learningMode} onChange={this.props.switchView}/>
            </Col>
        </Fragment>
        return (
            <Card
                bodyStyle={{ padding: '10px'}}
                className="card-shadow card-radius"
                bordered={false}
                title="Filters"
                size="small"
                extra={<a href={'/settings/anomaly'}>Settings</a>}
            >
                <Media query="(max-width: 768px)">
                    {matches =>
                        matches ?
                            <Fragment>
                                <Row type="flex" align="middle" gutter={12}>
                                    {lgFilter}
                                </Row>
                                <Row type="flex" align="middle" gutter={12}>
                                    {typeFilter}
                                </Row>
                                <Row type="flex" align="middle" gutter={12}>
                                    {testFilter}
                                </Row>
                            </Fragment>
                            :
                            <Row type="flex" align="middle" gutter={12} >
                                {lgFilter}
                                <Divider type="vertical"/>
                                {typeFilter}
                                <Divider type="vertical"/>
                                {testFilter}
                            </Row>
                    }
                </Media>
            </Card>
        )
    }
}

export default Filter
