import { PureComponent } from 'react'
import { actions } from 'mirrorx'
import { Button, Card, Col, message, Row, Select, Spin } from 'antd'
import { buildTimezoneOptions } from '@/utility/Countries'
import _ from 'lodash'
import { globalConstants } from '@/_constants'
import { isLife, isWatch } from '@/utility/Common'

class BeaconTimeZoneCard extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            isDirty: false,
            isSubmitting: false,
            timezone: props.selectedBeacon?.timezone || 'Not set',
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.selectedBeacon !== this.props.selectedBeacon &&
            this.setState({ timezone: this.props.selectedBeacon?.timezone || 'Not set' })
    }

    handleTimeZoneChange(value) {
        this.setState({ timezone: value, isDirty: true })
    }

    save = () => {
        let data = _.extend({}, this.props.selectedBeacon, {
            timezone: this.state.timezone
        })
        this.setState({ isSubmitting: true })
        actions.sofiBeacon.saveBeaconInfor(data).then(() => {
            this.setState({ isSubmitting: false })
            message.success('Saved successfully !!', 3)
        }).catch(err => {
            this.setState({ isSubmitting: false })
            err.global_errors.forEach(e => {
                message.error(e.message, 3)
            })
        })
        this.setState({ isDirty: false })
    }

    render() {
        const timezones = buildTimezoneOptions()

        const deviceType = isLife(this.props.selectedBeacon) ?
            globalConstants.LIFE_SOFIHUB :
            isWatch(this.props.selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB

        return (
            <Card className="advanced_block" title="Timezone">
                <Spin spinning={this.state.isSubmitting} delay={500}>
                    <div><p>Your {deviceType} sends time stamps in SMS notifications to emergency contacts, let us know what timezone
                        you&#39;d like the time stamps to be reported back in.
                    </p></div>
                    <Row justify="center" type="flex" className="margin-bottom">
                        <Col>
                            <Select
                                style={{ minWidth: 200 }}
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                size="large"
                                value={this.state.timezone}
                                onChange={value => this.handleTimeZoneChange(value)}
                            >
                                {timezones}
                            </Select>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Col>
                            <Button type="primary" disabled={!this.state.isDirty} onClick={this.save}>Save </Button>
                        </Col>
                    </Row>
                </Spin>
            </Card>
        )
    }
}

export default BeaconTimeZoneCard
