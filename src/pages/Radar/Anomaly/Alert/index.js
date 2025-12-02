import {Component, createRef, Fragment} from 'react'
import PropTypes from 'prop-types'
import styles from '../../../Anomaly/Alert/alert.scss'
import moment from 'moment-timezone'
import {Button, Card, Col, Form, Input, message, Modal, Radio, Row, Space} from 'antd'
import { globalConstants } from '@/_constants'
import { BrowserView, MobileView } from 'react-device-detect'
import {formatTime} from '@/utility/Common'
import {actions} from 'mirrorx'

export default class AlertComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modal: false
        }
        this.formRef = createRef()
    }

    renderNextStep = (alert) => {
        const resolved = !!alert.ack_at
        let nextStep
        if (resolved) {
            nextStep = <span>No more steps are required at this time by the {globalConstants.RADAR_HOBA} system</span>
        }else {
            nextStep = <span>Please check to see if a fall has taken place. To resolve the fall alert, click the blue &quot;Resolve&quot; button above.</span>
        }
        return nextStep
    }

    renderHappened = alert => {
        const type = alert.alarm_type
        if (type?.includes('FALL')) {
            return <span>A fall was detected</span>
        }else if (type?.includes('ACTIVATION')) {
            return <span>Motion above the set threshold has been detected</span>
        }
    }

    renderResolution = (alert) => {
        const resolved = !!alert.ack_at
        const resolveTime = moment(alert.ack_at).format(globalConstants.DATETIME_TZ_FORMAT)
        let resolution = ''
        if (resolved){
            resolution = <span>Resolved by a carer at {resolveTime}</span>
        }
        return resolution
    }

    renderCarerNoted = (alert) => {
        const resolved = !!alert.ack_at
        const ackCode = alert.ack_code
        let noted = ''
        if (resolved){
            noted = ackCode === 'TRUE_FALL' ? 'Fall Occurred' : ackCode==='FALSE_FALL' ? 'False alarm occurred' : ackCode === 'UNKNOWN_FALL' ? 'User unknown' : ''
        }
        return noted
    }

    renderLeftIcon = (mobile=false) => {
        const resolved = !!this.props.alert.ack_at
        const realFall = !this.props.alert.created_by || this.props.alert.created_by === 'Radar'
        return (
            <Col flex="80px" className={`status ${resolved ? 'green' : 'red'} ${mobile && 'mobile'}`}>
                <span className='status-text'>{resolved ? 'Resolved' : realFall ? 'Attention Required!' : 'Test Fall'}</span>
            </Col>
        )
    }

    renderRightCard = () => {
        const {timezone, alert} = this.props
        timezone ? moment.tz.setDefault(timezone) : moment.tz.setDefault(moment.tz.guess())
        const resolved = !!alert.ack_at
        const occurredDateTime = formatTime(moment(alert.alarm_at))
        const happened = this.renderHappened (alert)
        const resolution = this.renderResolution (alert)
        const carerNoted = this.renderCarerNoted(alert)
        const nextStep = this.renderNextStep(alert)
        const realFall = !alert.created_by || alert.created_by === 'Radar'
        return (
            <Col className='right-container' flex="auto">
                <Row gutter={[6,6]}>
                    <Col className='bold' md={12} lg={9} xxl={7}>Event</Col>
                    <Col>{happened}</Col>
                    <Col flex="auto" offset={1}>{!resolved && <Button type="primary" size="small" onClick={()=>this.handleSubmit({})}>Resolve</Button>}</Col>
                </Row>

                <Row gutter={[6,6]}>
                    <Col className='bold' md={12} lg={9} xxl={7}>Date and time</Col>
                    <Col>{occurredDateTime}</Col>
                </Row>
                {!realFall &&
                <Row gutter={[6,6]}>
                    <Col className='bold' md={12} lg={9} xxl={7}>Created by:</Col>
                    <Col>{alert.created_by}</Col>
                </Row>
                }
                {resolved &&
                    <Fragment>
                        <Row gutter={[6,6]}>
                            <Col className='bold' md={12} lg={9} xxl={7}>Resolution:</Col>
                            <Col>{resolution}</Col>
                        </Row>
                        {carerNoted && <Row gutter={[6,6]}>
                            <Col className='bold' md={12} lg={9} xxl={7}>Carer noted:</Col>
                            <Col>{carerNoted}</Col>
                        </Row>}
                        {alert.ack_comment && <Row gutter={[6,6]}>
                            <Col className='bold' md={12} lg={9} xxl={7}>More comments:</Col>
                            <Col>{alert.ack_comment}</Col>
                        </Row>}
                    </Fragment>
                }
                <Row gutter={[6,6]}>
                    <Col className='bold' md={12} lg={9} xxl={7}>Next step:</Col>
                </Row>
                <Row gutter={[6,6]}>
                    <Col>{nextStep}</Col>
                </Row>
            </Col>
        )
    }

    renderMobile = () => {
        const resolved = !!this.props.alert.ack_at
        return <Card
            className='card-radius'
            bordered={false}
            title={resolved ? 'Resolved' : 'Attention Required!'}
            headStyle={{background: resolved ? styles.green : styles.red, color:'white'}}
        >
            {this.renderRightCard()}
        </Card>
    }

    handleSubmit = (values) => {
        const {radarId, alert} = this.props

        const payload = {
            ...alert,
            ...values,
        }

        actions.radar.resolveSingleRadarAnomaly ({radarId, payload})
            .then(()=>{
                message.success('Fall resolved.')
                this.setState({modal: false})
            })
            .catch((error)=>{
                message.error(error.error)
            })
    }

    render() {
        const {modal} = this.state
        const left = this.renderLeftIcon()
        const right = this.renderRightCard()
        const mobile = this.renderMobile()
        return (
            <Fragment>
                <MobileView style={{width: '100%', marginBottom:'12px'}}>{mobile}</MobileView>
                <BrowserView>
                    <Row className='margin-bottom' wrap={false}>
                        {left}
                        {right}
                    </Row>
                </BrowserView>
                <Modal
                    open={modal}
                    onCancel={()=>this.setState({modal:false})}
                    okText="Resolve Fall"
                    onOk={() => this.formRef.current?.validateFields().then((values) => {
                        this.formRef.current?.resetFields()
                        this.handleSubmit(values)
                    })}
                >
                    <Form
                        layout="vertical"
                        ref={this.formRef}
                    >
                        <Form.Item
                            name="ack_code"
                            label="One more question: did a fall occur?"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select a option!',
                                },
                            ]}
                            extra={<span>If you&#39;re unsure because you did not witness the event please before
                                resolving ask someone who witnessed or helped after the event.</span>}
                        >
                            <Radio.Group>
                                <Space direction="vertical" className="margin-bottom">
                                    <Radio value="TRUE_FALL">Yes - a fall occurred</Radio>
                                    <Radio value="FALSE_FALL">No - no fall occurred</Radio>
                                    <Radio value="UNKNOWN_FALL">I&#39;m not sure</Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="ack_comment"
                            label="Other comments"
                        >
                            <Input.TextArea />
                        </Form.Item>

                    </Form>
                </Modal>
            </Fragment>
        )
    }
}

AlertComponent.propTypes= {
    alert: PropTypes.object.isRequired,
    radarId: PropTypes.number.isRequired,
    timezone: PropTypes.string,
}
