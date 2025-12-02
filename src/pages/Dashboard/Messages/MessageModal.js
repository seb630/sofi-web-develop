import { Component, Fragment } from 'react'
import moment from 'moment-timezone'
import { globalConstants } from '@/_constants'
import { changeMinsToMillsec } from '@/utility/Common'
import { actions } from 'mirrorx'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Input, InputNumber, message, Modal, Radio, Row, Steps } from 'antd'
import OfflineFooter from '../Common/OfflineFooter'
import PropTypes from 'prop-types'

export default class MessageModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            message: '',
            occupancyBased: false,
            expire: 60,
            current: 0
        }
    }

    saveTestMessage = () => {
        const hubId = this.props.selectedHub.hub_id
        if (this.state.occupancyBased) {
            const payload = {
                hub_id: hubId,
                state: 'ACTIVE',
                config: {
                    name: 'Instant message',
                    message: this.state.message,
                    reminder_type: 'CUSTOM',
                    via: 'SPEAK',
                    timing: {
                        on: moment().format(globalConstants.API_DATE_FORMAT),
                        at: moment().add(this.state.expire, 'minute').format(globalConstants.API_TIME_FORMAT)
                    },
                    occupancy_timer: changeMinsToMillsec(this.state.expire)
                }
            }
            actions.setting.addReminder({
                hubId,
                payload
            }).then(()=>{
                message.success(`It can take up to 2 minutes for the message to be received by the ${globalConstants.HUB_SOFIHUB}`, 10)
                this.onCancel()
            })
        } else {
            const payload = {
                hub_id: hubId,
                instruction_type: 'SPEAK',
                data: {
                    message: this.state.message
                }
            }
            actions.hub.saveTestMessage({
                hubId,
                payload
            }).then(()=>{
                message.success(`It can take up to 2 minutes for the message to be received by the ${globalConstants.HUB_SOFIHUB}`, 10)
                this.onCancel()
            })
        }
    }

    prefill = () => {
        this.setState({
            message: 'Hi There, this is a test message from the SOFIHUB Support Team. Have a wonderful day!'
        })
    }

    onCancel = () => {
        this.setState({
            message: '',
            occupancyBased: false,
            expire: 60,
            current: 0
        })
        this.props.onCancel()
    }

    renderMessageContent = () => {
        const {admin} = this.props
        return (
            <Fragment>
                <Row className="messageLabel">
                    <label>What do you want {globalConstants.HUB_SOFIHUB} to say?</label>
                </Row>
                <Row>
                    <Input
                        type="text"
                        name='message'
                        value={this.state.message}
                        onChange={ e => this.setState({message: e.target.value})}
                        placeholder="Enter Message"
                    />
                </Row>
                {admin && <Row style={{marginTop: 12}}>
                    <Button onClick={this.prefill}>
                        Prefill Message (Admin only)
                    </Button>
                </Row>}
            </Fragment>
        )
    }

    renderOptionContent = () => {
        const {occupancyBased, expire} = this.state
        const {hubLocation} = this.props
        return (
            <Fragment>
                <Row className="messageLabel">
                    <label>When should the message be said?</label>
                </Row>
                <Row style={{marginBottom: 12}} type="flex" justify="center">
                    <Radio.Group
                        buttonStyle="solid"
                        value={occupancyBased}
                        onChange={() => this.setState({occupancyBased: !occupancyBased})}
                    >
                        <Radio.Button value={false} style={{marginBottom:6}}>As soon as possible</Radio.Button>
                        <Radio.Button value={true}>When someone is nearby</Radio.Button>
                    </Radio.Group>
                </Row>
                {occupancyBased && <div>
                    <label>Message expiry: </label>
                    <InputNumber
                        formatter={value => `${value}mins`}
                        parser={value => value.replace('mins', '')}
                        min={1}
                        className="marginLR margin-bottom"
                        defaultValue={60}
                        value={expire}
                        onChange={ v => this.setState({expire: v})}
                        placeholder="Enter expire time"/>
                </div>}
                <Row className="messageDescription">
                    <ExclamationCircleOutlined /> {
                        occupancyBased ? `Your message will be sent now, but will be played only when ${globalConstants.HUB_SOFIHUB} sees movement in the 
                    ${hubLocation}. This message may not play if no motion is detected within ${expire} minutes`:
                            `Your message will be sent and played as soon as possible, even if no one is near ${globalConstants.HUB_SOFIHUB} to hear it.`
                    }
                </Row>
            </Fragment>
        )
    }

    renderFooter = () => {
        const {current} = this.state
        const { selectedHub } = this.props
        const step0 = [
            <Button key="back" onClick={this.onCancel}>Cancel</Button>,
            <Button key="next" type="primary" onClick={()=>this.setState({current: 1})}>Next</Button>
        ]
        return (current===0 ? step0 : <OfflineFooter
            handleCancel={this.onCancel}
            handleOk={this.saveTestMessage}
            onlineStatus={selectedHub && selectedHub.connectivity_state==='ONLINE'}
        /> )
    }

    render(){
        const {open} = this.props
        const {current} = this.state
        const steps = [{
            title: 'What should the message say?',
            content: this.renderMessageContent(),
        }, {
            title: 'When should it be said',
            content: this.renderOptionContent(),
        }]

        const modalTitle =  <Steps current={current} size="small">
            {steps.map(item => <Steps.Step key={item.title} title={item.title} />)}
        </Steps>

        return(
            <Modal
                destroyOnClose
                width={550}
                okText="Send"
                open={open} onCancel={this.onCancel}
                onOk={this.saveTestMessage}
                footer={this.renderFooter()}
                centered={false} title={modalTitle} style={{height: '300px'}}>
                {steps[current].content}
            </Modal>
        )
    }
}

MessageModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    selectedHub: PropTypes.object,
    admin: PropTypes.bool,
    hubLocation: PropTypes.string
}
