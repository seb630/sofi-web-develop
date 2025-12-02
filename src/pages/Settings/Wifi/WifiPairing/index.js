import { Component, Fragment } from 'react'
import { Button, Col, Input, List, Modal, Progress, Row, Spin, Steps } from 'antd'
import { actions, connect } from 'mirrorx'
import PropTypes from 'prop-types'
import { generateWifiIcon } from '@/utility/Common'
import styled from '../../../../scss/colours.scss'

const mapStateToProps = state => ({
    me: state.user.me,
    selectedHub: state.hub.selectedHub,
    network: state.hub.network || {},
    instructionDetail: state.hub.instructionDetail,

})

class WifiPairingModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            complete: false,
            current: props.ssid ? 2 :0,
            hiddenSSID: false,
            ssid: props.ssid,
            password: null,
            fail: false
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.ssid !== this.props.ssid && this.setState({
            ssid: this.props.ssid,
            current: this.props.ssid ? 2 :0
        })

        if (!this.state.complete && this.props.instructionDetail &&
            prevProps.instructionDetail.status!==this.props.instructionDetail.status &&
            this.props.instructionDetail.status==='COMPLETED') { // Success connect
            clearInterval(this.pairingStatus)
            this.setState({complete: true, loading: false})
            actions.hub.getHubNetwork(this.props.selectedHub.hub_id)
        }

        if (!this.state.complete && this.props.instructionDetail &&
            prevProps.instructionDetail.status!==this.props.instructionDetail.status &&
            (this.props.instructionDetail.status==='COMPLETED_WW' || this.props.instructionDetail.status==='FAILED')) { // fail
            clearInterval(this.pairingStatus)
            this.setState({fail: true, loading: false})
            actions.hub.getHubNetwork(this.props.selectedHub.hub_id)
        }
    }

    handleHiddenSSID = () => {
        this.setState({hiddenSSID: true})
    }

    handleChooseNetwork = (wifiSSID) => {
        this.setState({ssid: wifiSSID})
        this.next()
    }

    resetStatus = (resetPage) => {
        actions.hub.save({instructionDetail: {}})
        this.setState({
            loading: false,
            complete: false,
            fail: false,
        })
        resetPage && this.setState({current: 0})
    }

    handleCloseModal = () => {
        this.props.onClose()
    }

    handleReScan = () => {
        const hubId = this.props.selectedHub.hub_id
        const payload = {
            action: 'WIFI_SCAN'
        }
        this.setState({loading: true})
        actions.hub.updateHubNetwork({hubId, payload}).then((result)=> {
            const instructionId = result.hub_instruction_id
            this.pairingStatus = setInterval(()=>
                actions.hub.getHubInstruction({instructionId,hubId}), 3000)
        })
    }

    handleConnect = () => {
        const hubId = this.props.selectedHub.hub_id
        const payload = {
            action: this.props.ssid ? 'WIFI_RESET_PWD' : 'WIFI_CONNECT',
            wifi_ssid: this.state.ssid,
            password: this.state.password
        }
        this.setState({loading: true})
        actions.hub.updateHubNetwork({hubId, payload}).then((result)=> {
            const instructionId = result.hub_instruction_id
            this.pairingStatus = setInterval(()=>
                actions.hub.getHubInstruction({instructionId,hubId}), 3000)
        })
    }

    next() {
        const current = this.state.current + 1
        current === 3 && this.handleConnect()
        this.setState({ current })
        current === 2 && this.resetStatus(false)
    }

    prev() {
        const current = this.state.current - 1
        this.setState({ current })
    }

    render() {
        const { current } = this.state
        const dataSource = this.props.network.config && Object.values(this.props.network.config.wifis)

        const introContent = <div>
            <h4>Introduction</h4>
            <p>In order to connect to a Wi-Fi network, you&#39;ll need to know the following:</p>
            <ul>
                <li>The name of the network you&#39;re connecting to</li>
                <li>The password for the network you&#39;re connecting to</li>
            </ul>
            <p>Once you&#39;re ready to go we&#39;ll go through the following process:</p>
            <ol>
                <li>Finding the network</li>
                <li>Entering the password</li>
                <li>Trying to connect to the network</li>
            </ol>
        </div>

        const findingContent =
            <div>
                <Spin tip="Please Wait - Searching networks..." size="large" spinning={this.state.loading}>
                    <h4>Here are the networks we&#39;ve found:</h4>
                    <List
                        itemLayout="horizontal"
                        dataSource={dataSource}
                        size="small"
                        locale={{emptyText: 'No available network'}}
                        renderItem={item => (
                            <List.Item actions={[
                                <Button
                                    onClick={()=>this.handleChooseNetwork(item.ssid)}
                                    size="small"
                                    type="primary"
                                    key={item.ssid}>Connect</Button>,
                            ]}>
                                <List.Item.Meta
                                    avatar={generateWifiIcon(item.signal_level)}
                                    title={item.ssid}
                                />
                            </List.Item>
                        )}
                    />
                    <p>Don&#39;t see your network? <a onClick={this.handleReScan}>Scan again</a> or <a
                        onClick={this.handleHiddenSSID}>type in hidden network name</a></p>
                    {this.state.hiddenSSID &&
                        <Input
                            size="large"
                            placeholder="Input your network name..."
                            onChange={(e) => {
                                this.setState({ssid: e.target.value})
                            }}
                        />
                    }
                </Spin>
            </div>

        let passwordContent =
            <div>
                <div>
                    <h4>Password</h4>
                    <Row type="flex" justify="center">
                        <Col>
                            <p>What&#39;s the password for this network?</p>
                            <Input.Password minLength={8} size="large" onChange={(e)=>this.setState({password: e.target.value})}/>
                        </Col>
                    </Row>
                </div>
            </div>

        const connectingContent =
            <Spin tip="Attempting to connect to your network..." size="large" spinning={this.state.loading} >
                <div style={{minHeight: 256}}>
                    {this.state.complete && this.state.current===3 && this.next()}
                    {this.state.fail &&
                    <div align="center" className='margin-bottom'>
                        <Progress type="circle" percent={0} status="exception" strokeColor={styled.red}/>
                        <br />
                        <h4>Couldn&#39;t connect. Please double check your password.</h4>
                    </div>
                    }
                </div>
            </Spin>

        const finishContent =
            <div align="center" className='margin-bottom'>
                <Progress type="circle" percent={100}  strokeColor={styled.green}/>
                <h4>Connected! You&#39;re all done!</h4>
            </div>

        let steps = [{
            title: 'Intro',
            content: introContent,
        }, {
            title: 'Finding',
            content: findingContent,
        }, {
            title: 'Password',
            content: passwordContent,
        },
        {
            title: 'Connecting',
            content: connectingContent,
        },
        {
            title: 'Done',
            content: finishContent,
        }]

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
                            onClick={()=>this.next()}
                            disabled={this.state.current===1 && !this.state.ssid || this.state.current===3 && !this.state.complete}
                            className="floatRight"
                        >Next</Button>
                    }

                    {
                        current === steps.length - 1
                        && <Button type="primary" onClick={()=>this.handleCloseModal()} className="floatRight">Finish</Button>
                    }
                    {
                        current > 0 && current!== steps.length - 1
                        && (
                            <Button
                                type={ this.state.current===3 && this.state.fail ? 'primary' : 'default'}
                                style={{ marginLeft: 8 }}
                                onClick={() => this.prev()}>
                                Previous
                            </Button>
                        )
                    }
                </div>
            </Fragment>
        </Modal>
    }
}

WifiPairingModal.propTypes= {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, null) (WifiPairingModal)
