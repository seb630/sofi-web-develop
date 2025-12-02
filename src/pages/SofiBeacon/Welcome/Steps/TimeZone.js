import { Row, Col, Button, Select, message } from 'antd'
import { Component } from 'react'
import { Form } from '@ant-design/compatible'
import { buildTimezoneOptions } from '@/utility/Countries'
import { actions } from 'mirrorx'
import _ from 'lodash'

class TimeZone extends Component {
    constructor(props) {
        super(props)
        const devicetimezone = this.props.selectedBeacon.timezone ?? ''
        this.state = {
            timezone: devicetimezone === '' ? 'Not set' : devicetimezone,
            hastimezone: devicetimezone !== '' && devicetimezone !== 'Not set',
            loading: false
        }
    }    

    handleTimeZoneChange(value) {
        this.setState({ timezone: value, isDirty: true })
        if (value !== 'Not set') {
            this.setState({hastimezone: true})
        }
    }

    save = () => {
        let data = _.extend({}, this.props.selectedBeacon, {
            timezone: this.state.timezone
        })
        this.setState({ loading: true })
        actions.sofiBeacon.saveBeaconInfor(data).then(() => {
            this.setState({ loading: false})
            this.props.next()
            message.success('Saved successfully !!', 3)
        }).catch(err => {
            this.setState({ loading: false})
            err.global_errors.forEach(e => {
                message.error(e.message, 3)
            })
        })
    }

    render() {
        const timezones = buildTimezoneOptions()
        return (
            <div>
                <h3 style={{ textAlign: 'center' }}>Is this time zone correct?</h3>
                <p style={{textAlign: 'center'}}>
                    In order to make sure your {this.props.selectedBeacon.display_name} has the correct time, please make sure your time zone is set:
                </p>
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
                        {
                            !this.state.hastimezone && <p style={{textAlign: 'center', color: 'red'}}>You must set a timezone.</p>
                        }
                    </Col>
                </Row>
                <p style={{textAlign: 'center', marginTop: '30px'}}>
                    You can always update your time zone in the settings page.
                </p>
                <Row>
                    <Col span={24}>
                        <Button style={{ marginLeft: 8 }} onClick={this.props.prev}>Previous</Button>
                        <Button
                            type="primary"
                            onClick={this.save}
                            disabled={this.state.loading || !this.state.hastimezone}
                            className="floatRight">Next
                        </Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

const TimeZonePage = Form.create({})(TimeZone)

const timezoneStep = (selectedBeacon, next, prev) => {

    const title = 'Time Zone'
    const content = <TimeZone selectedBeacon={selectedBeacon} next={next} prev={prev}/>

    return { title, content }
}

export default timezoneStep