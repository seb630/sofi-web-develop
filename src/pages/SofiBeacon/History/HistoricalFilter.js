import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Row, Col, DatePicker, Card, Button, Switch } from 'antd'
import moment from 'moment'
import Media from 'react-media'
import tinygradient from 'tinygradient'
import styled from '../../../scss/colours.scss'
import '../beacon.scss'

class HistoricalFilter extends Component {
    constructor(props) {
        super(props)

        this.state = {
            date: moment().hour(0).minute(0).second(0)
        }
    }

    /** handle search history */
    handleRangePickerChanged = (value) => {
        this.setState({date: value})
        const { selectedBeacon } = this.props
        actions.sofiBeacon.fetchBeaconGpsHistory({
            startDate: value.hour(0).minute(0).second(0).toDate() ,
            endDate: value.hour(23).minute(59).second(59).toDate(),
            beaconId: selectedBeacon && selectedBeacon.pub_id
        })
    }


    componentDidMount() {
        this.fetchBeaconHistory(this.props.selectedBeacon)
    }

    componentDidUpdate (prevProps) {
        !prevProps.selectedBeacon && prevProps.selectedBeacon !== this.props.selectedBeacon && this.fetchBeaconHistory(this.props.selectedBeacon)
    }

    fetchBeaconHistory = (selectedBeacon) => {
        let { date } = this.state
        if (selectedBeacon) {
            actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon.pub_id)
            actions.sofiBeacon.fetchBeaconGpsHistory({
                startDate: date.hour(0).minute(0).second(0).toDate() ,
                endDate: date.hour(23).minute(59).second(59).toDate(),
                beaconId: selectedBeacon && selectedBeacon.pub_id
            })
        }
    }


    handleMovingArrow = (forward) => {
        const { selectedBeacon } = this.props
        let { date } = this.state

        date = moment(date).add(forward,'day')

        this.setState({date})
        actions.sofiBeacon.fetchBeaconGpsHistory({
            startDate: date.hour(0).minute(0).second(0).toDate() ,
            endDate: date.hour(23).minute(59).second(59).toDate(),
            beaconId: selectedBeacon?.pub_id
        })
    }

    /** disable date */
    disabledDate(current) {
        return current && current > moment().endOf('day')
    }

    renderKey = () => {
        const isGPS = this.props.type==='GPS'
        const gradient = isGPS ? tinygradient([styled.gradientStart, styled.gradientEnd]) : tinygradient([styled.red, styled.green])
        let gradientStr = gradient.css()
        const linear = <div className="key" style={{background:gradientStr}} />
        return <Row align="middle" gutter={12}>
            <Col><strong>Key: </strong></Col>
            <Col>
                <Row justify="space-between">
                    <Col>{isGPS ? 'Older' : 'Bad'}</Col>
                    <Col>{isGPS ? 'Recent' : 'Good'}</Col>
                </Row>
                <Row>{linear}</Row>
            </Col>
        </Row>
    }

    render() {
        const { date } = this.state
        const {showRadius} = this.props

        const lgFilter = (<Fragment>
            <Col>
                <Button className="filter-history__arrow " onClick={this.handleMovingArrow.bind(this,-1)} type="primary">
                    <LeftOutlined />
                </Button>
            </Col>
            <Col>
                <DatePicker
                    id="filterRange" className="filter-history__date"
                    placeholder="date" format="DD-MM-YYYY"
                    allowClear={false}
                    value={date}
                    onChange={this.handleRangePickerChanged}
                    disabledDate={this.disabledDate} />
            </Col>
            <Col>
                <Button className="filter-history__arrow " disabled={date.isSameOrAfter(moment(),'day') } onClick={this.handleMovingArrow.bind(this,1)} type="primary">
                    <RightOutlined />
                </Button>
            </Col>
        </Fragment>)

        const mdFilter = (<Fragment>
            <Col>
                <DatePicker
                    id="filterRange"
                    className="filter-history__date"
                    placeholder="date"
                    format="DD-MM-YYYY"
                    allowClear={false}
                    value={date}
                    onChange={this.handleRangePickerChanged}
                    disabledDate={this.disabledDate} />
            </Col>
            <Col className="filter-history__arrowGroup">
                <Button className="filter-history__arrow " onClick={this.handleMovingArrow.bind(this,-1)} type="primary">
                    <LeftOutlined />
                </Button>
                <Button className="filter-history__arrow " disabled={date.isSameOrAfter(moment(),'day') } onClick={this.handleMovingArrow.bind(this,1)} type="primary">
                    <RightOutlined />
                </Button>
            </Col>
        </Fragment>)

        return (
            <Card id="historicalFilter" bodyStyle={{ padding: '10px'}} className="filter-history card-shadow card-radius" bordered={false} >
                <Row type="flex" align="middle" gutter={12}>
                    <Col>
                        <strong> Location History </strong>
                    </Col>

                    <Media query="(max-width: 599px)">
                        {matches =>
                            matches ? mdFilter : lgFilter
                        }
                    </Media>
                    <Col>
                        {this.renderKey()}
                    </Col>

                    {this.props.handleShowRadius && <Fragment>
                        <Col>
                            {this.props.showRadiusLabel}
                        </Col>
                        <Col>
                            <Switch
                                checked={showRadius}
                                onChange={checked => this.props.handleShowRadius(checked)}
                                checkedChildren="On"
                                unCheckedChildren="Off"
                            />
                        </Col>
                    </Fragment>
                    }
                </Row>
            </Card>
        )
    }
}

export default HistoricalFilter
