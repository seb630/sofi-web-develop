import { Component, Fragment } from 'react'
import { Form } from '@ant-design/compatible'
import { Button, Col, Input, message, Modal, Row, Select, Spin, Steps } from 'antd'
import { actions, connect } from 'mirrorx'
import PropTypes from 'prop-types'
import NewSpaceModal from './NewSpaceModal'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    me: state.user.me,
    hubSpaces: state.hub.hubSpaces,
    selectedHub: state.hub.selectedHub,
    instructionDetail: state.hub.instructionDetail,
    hubNewDevices: state.hub.hubNewDevices
})

class SensorPairingModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            current:0,
            loading: false,
            received: false,
            newRoomModal: false,
            timeout: false,
            complete: false,
            failed: false,
            newSensor: props.hubNewDevices ? props.hubNewDevices[0] : null,
        }
    }

    handleCloseModal = () => {
        this.props.onClose()
    }

    resetStatus = (resetPage) => {
        actions.hub.save({instructionDetail: {}})
        this.setState({
            timeout: false,
            failed: false,
            complete: false,
            loading: false,
            received: false,
            newSensor:this.props.hubNewDevices ? this.props.hubNewDevices[0] : null,
            current: resetPage ? 0 : this.state.current
        })
    }

    next() {
        const current = this.state.current + 1
        this.setState({ current })
        current === 2 && actions.hub.getHubNewDevices(this.props.selectedHub.hub_id)
        clearInterval(this.pairingStatus)
    }

    prev() {
        const current = this.state.current - 1
        this.setState({ current })
        clearInterval(this.pairingStatus)
    }

    addMore(){
        const current = 2
        this.resetStatus(false)
        this.setState({ current })
    }

    componentWillUnmount() {
        this.resetStatus(true)
        clearInterval(this.pairingStatus)
    }

    componentDidUpdate(prevProps) {
        if (!this.state.received && this.props.instructionDetail &&
            (this.props.instructionDetail.status==='RECEIVED' || this.props.instructionDetail.status==='SENT')) {
            this.state.loading && this.handlePairingReady()
            this.setState({received: true, loading: false})
        } else if (!this.state.complete && this.props.instructionDetail &&
            prevProps.instructionDetail.status!==this.props.instructionDetail.status &&
            this.props.instructionDetail.status==='COMPLETED') {
            clearInterval(this.pairingStatus)
            this.setState({complete: true, loading: false})
            if (this.props.replace) {
                this.modal && this.modal.destroy()
                Modal.success({
                    title: 'Sensor replaced!',
                    content: (
                        <div>
                            <p>Please continue...</p>
                        </div>
                    ),
                    okText: 'Continue',
                    onOk: (close)=>{
                        close()
                        this.setState({current: 3})
                    }
                })
            }else {
                actions.hub.getHubNewDevices(this.props.selectedHub.hub_id).then(()=>{
                    if(this.props.hubNewDevices.length>0){
                        this.modal && this.modal.destroy()
                        this.setState({newSensor: this.props.hubNewDevices[0]})
                        Modal.success({
                            title: 'New Sensor Paired!',
                            content: (
                                <div>
                                    <p>Please continue...</p>
                                </div>
                            ),
                            okText: 'Continue',
                            onOk: (close)=>{
                                close()
                                this.setState({current: 3})
                            }
                        })
                    }
                })
            }
        }
        else if (!this.state.timeout && this.props.instructionDetail && this.props.instructionDetail.status==='TIMEOUT')
        {
            this.handleTimeout()
        }
        else if (!this.state.failed && this.props.instructionDetail &&
            prevProps.instructionDetail.status!==this.props.instructionDetail.status &&
            this.props.instructionDetail.status==='FAILED') {
            this.handleFailed()
        }
    }

    handleAllocate = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const payload = {
                    hub_id: this.state.newSensor.hub_id,
                    device_id: this.state.newSensor.device_id,
                    space_id: values.space,
                    device_name: values.name,
                }
                actions.hub.linkSensorToSpace(payload).then(()=>{
                    this.next()
                })
            }
        })
    }

    handleFailed = () => {
        clearInterval(this.pairingStatus)
        this.setState({failed: true, loading: false})
        this.modal && this.modal.destroy()
        Modal.error({
            title: 'Pairing Failed!',
            content: (
                <div>
                    <p>Pairing failed! Please try again by Clicking the Start Pairing button</p>
                </div>
            )
        })
    }

    handleTimeout = () => {
        clearInterval(this.pairingStatus)
        this.modal && this.modal.destroy()
        this.addMore()
        Modal.error({
            title: 'Time out!',
            content: (
                <div>
                    <p>Pairing mode cancelled due to time out! Please try again by Clicking the Start Pairing button</p>
                </div>
            )
        })
    }

    handlePairingReady = () => {
        this.modal = Modal.info({
            title: 'Hub Ready!',
            content: (
                <div>
                    <p>Please press the button on the back of the sensor three times...</p>
                </div>
            )
        })
    }

    handleCancelPairing = () => {
        const hubId = this.props.selectedHub.hub_id
        actions.hub.cancelSensor(hubId).then(()=> {
            clearInterval(this.pairingStatus)
            message.success('Pairing mode cancelled')
            this.addMore()
        })
    }

    handleStartPairing = () => {
        const hubId = this.props.selectedHub.hub_id
        this.setState({loading: true})
        this.props.replace?
            actions.hub.replaceSensor({hubId, deviceId:this.props.currentDevice.device_id}).then((result)=> {
                const instructionId = result.hub_instruction_id
                this.pairingStatus = setInterval(()=>
                    actions.hub.getHubInstruction({instructionId,hubId}), 4000)
            }) :
            actions.hub.addSensor(hubId).then((result)=> {
                const instructionId = result.hub_instruction_id
                this.pairingStatus = setInterval(()=>
                    actions.hub.getHubInstruction({instructionId,hubId}), 4000)
            })
    }

    handleOccupancy = () => {
        this.handleCloseModal()
        actions.routing.push('/settings/advanced')
    }

    handleNewRoomModal = (state) => {
        this.setState({newRoomModal: state})
    }

    render() {
        const { current, received } = this.state
        const { getFieldDecorator, getFieldValue } = this.props.form

        const IntroContent = <div>
            <h4>{this.props.replace ? 'Replacing an existing' : 'Adding a new'} sensor - Introduction</h4>
            <p>In order to go through this process you will need to:</p>
            <ol>
                <li>Have a new sensor ready.</li>
                <li>Make sure that you have batteries for your sensor ready.</li>
                <li>Be in the same physical location to the {globalConstants.HUB_SOFIHUB}, and in close proximity to it.</li>
            </ol>
            <p>This process will involve:</p>
            <ol>
                <li>Getting the sensor ready.</li>
                <li>Pairing the sensor.</li>
                {!this.props.replace && <li>Allocating the sensor to a room, and giving it a name.</li>}
            </ol>
            <p>Ready? Let&#39;s get started.</p>
        </div>

        const getReadyContent =
            <div>
                <h4>Getting the sensor ready</h4>
                <p>In order to do this:</p>
                <ol>
                    <li>If the sensor is still in the box, please remove it from the box.</li>
                    <li>Remove the back cover from the sensor:</li>
                    <ol>
                        <li>If there are batteries in the sensor, please remove the plastic tab from the contact points.
                        </li>
                        <li>If there are no batteries in the sensor, please make sure you have two CR123 or CR123A
                            batteries ready. Place the batteries into the sensor making sure that they are installed
                            correctly.</li>
                    </ol>
                </ol>
                <p>Ready? Continue to the next step.</p>
            </div>

        let pairingContent =
            <div>
                <Spin tip="Please Wait - Contacting Hub..." size="large" spinning={this.state.loading}>
                    <div style={{opacity: received ? 0.5: 1}}>
                        <h4>Pairing the new sensor</h4>
                        <p>In order to pair the sensor you will need to put the {globalConstants.HUB_SOFIHUB} into pairing mode, and then press
                            the button on the back of the sensor three times. The button on the back of the sensor is
                            represented by a dimple - please take a moment now to locate it. When ready press the &quot;
                            Start Pairing&quot; button below.</p>
                        <Row type="flex" justify="center">
                            <Col>
                                <Button
                                    type="primary"
                                    disabled={received}
                                    onClick={()=>this.handleStartPairing()}>Start Pairing</Button>
                            </Col>
                        </Row>
                    </div>
                    {received ?
                        <div>
                            <h4>Your {globalConstants.HUB_SOFIHUB} is now in pairing mode.</h4>
                            <p>You can cancel pairing mode by pressing the button below.</p>
                            <Row type="flex" justify="center">
                                <Col>
                                    <Button
                                        type="primary"
                                        onClick={()=>this.handleCancelPairing()}>Cancel Pairing</Button>
                                </Col>
                            </Row>
                        </div>
                        : null
                    }
                </Spin>
            </div>

        const allocationContent =
            <div>
                <Form layout="vertical">
                    <h4>Give the sensor a name and assign it to a room</h4>

                    <Form.Item help={<p>What should the name of the sensor be? Example: Guest Bathroom Motion,
                        Hallway Motion, Front Door Motion...</p>}>
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: 'Please input the name of the sensor!' }],
                        })(
                            <Input placeholder="New sensor name"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        help={<p>What room should the sensor be allocated to?</p>}
                    >
                        {getFieldDecorator('space', {
                            rules: [
                                { required: true, message: 'Please select room for the sensor!' },
                            ],
                        })(
                            <Select placeholder="Please select room for the sensor"  style={{width: '180px'}}>
                                {this.props.hubSpaces.map(space=>
                                    <Select.Option key={space.space_id} value={space.space_id}>{space.name}
                                    </Select.Option>)}
                            </Select>
                        )}
                    </Form.Item>
                    <Row type="flex" gutter={24}>
                        <Col>
                            <i>Don&#39;t see the room you need?</i>
                        </Col>
                        <Col>
                            <Button type="primary" onClick={()=>this.handleNewRoomModal(true)}>Add new room</Button>
                        </Col>
                    </Row>
                </Form>
            </div>

        const finishContent =
            <div>
                <h4>Summary - You&#39;re almost done!</h4>
                {this.props.replace ?
                    <p>
                        Congratulations, you&#39;ve just finished replacing your existing sensor:
                        {this.props.currentDevice.device_name} for the room: {
                            this.props.hubSpaces.find(space=> space.space_id === this.props.currentDevice.space_id).name
                        } !
                    </p>
                    :
                    <p>Congratulations, you&#39;ve just finished adding your brand new {getFieldValue('name')} sensor for
                    the room: {getFieldValue('space')}!</p>
                }
                <p>If this is the last sensor you need to pair, we recommend you:</p>
                <ol>
                    <li>Install the sensor.</li>
                    <li><a onClick={this.handleOccupancy}>Turn on occupancy announcement mode</a>, and test all sensors in the home. You can turn off
                    occupancy announcement mode at any time under Setting -&#x3E; Advanced.</li>
                </ol>
                {!this.props.replace &&
                    <p>If this isn&#39;t the last sensor you need to add, you can continue to add another sensor.</p>
                }
            </div>

        let steps = [{
            title: 'Intro',
            content: IntroContent,
        }, {
            title: 'Get Ready',
            content: getReadyContent,
        }, {
            title: 'Pairing',
            content: pairingContent,
        },
        {
            title: 'Finish',
            content: finishContent,
        }]

        !this.props.replace && steps.splice(3,0,{
            title: 'Allocation',
            content: allocationContent,
        })

        const modalTitle =  <Steps current={current} size="small">
            {steps.map(item => <Steps.Step key={item.title} title={item.title} />)}
        </Steps>

        return <Modal
            title={modalTitle}
            open={this.props.open}
            onCancel={this.handleCloseModal}
            width={900}
            footer={null}
            afterClose={()=>this.resetStatus(true)}
            destroyOnClose={true}
        >
            <NewSpaceModal
                open={this.state.newRoomModal}
                onCancel={()=>this.handleNewRoomModal(false)}
                hubId={this.props.selectedHub.hub_id}
            />
            <Fragment>
                <div className="steps-content">{steps[current].content}</div>
                <div className="steps-action">
                    {
                        current === 0 &&
                        <Button type="primary" onClick={() => this.next()} className="floatRight">Get Started</Button>
                    }
                    {
                        current !== 0 && current < steps.length - 1
                        && <Button
                            type="primary"
                            onClick={() => this.state.current===steps.length-2 && !this.props.replace ? this.handleAllocate(): this.next()}
                            className="floatRight"
                            disabled={this.state.current===2 && !this.state.complete}>Next
                        </Button>
                    }
                    {
                        current === steps.length - 1
                        && <Button type="primary" onClick={()=>this.handleCloseModal()} className="floatRight">Finish</Button>
                    }
                    {
                        current > 0 && current!== steps.length - 1
                        && (
                            <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                                Previous
                            </Button>
                        )
                    }
                    {
                        current=== steps.length - 1 && !this.props.replace
                        && (
                            <Button type="primary" style={{ marginLeft: 8 }} onClick={() => this.addMore()}>
                                Add Another Sensor
                            </Button>
                        )
                    }
                </div>
            </Fragment>
        </Modal>
    }
}

SensorPairingModal.propTypes= {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    replace: PropTypes.bool,
    currentDevice: PropTypes.object
}

export default connect(mapStateToProps, null) (Form.create()(SensorPairingModal))
