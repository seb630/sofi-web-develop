import { Component, Fragment } from 'react'
import moment from 'moment/moment'
import changeCase from 'change-case'
import { actions } from 'mirrorx'
import Icon, { CloudOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, message, Modal, Row, Slider, Tooltip } from 'antd'
import DeviceStatus from '../../../components/DeviceStatus'
import { MyIcon } from '../../Common/Common'
import OfflineFooter from '../Common/OfflineFooter'
import Unknown from '../../../images/battery-unknown.svg'
import { generate4gIcon, generateWifiIcon } from '@/utility/Common'
import Clock from '../../Common/Clock'
import { globalConstants } from '@/_constants'

export default class Status extends Component{
    constructor(props) {
        super(props)
        this.state = {
            volume: this.props.hubStatus ? this.props.hubStatus.volume : 0,
            volumeModal: false
        }
    }

    componentDidUpdate(prevProps){
        prevProps.hubStatus !== this.props.hubStatus && this.props.hubStatus && this.setState({
            volume: this.props.hubStatus.volume
        })
    }

    saveVolume () {
        const hubId = this.props.hub.hub_id
        const payload = {
            hub_id: hubId,
            instruction_type: 'SET_VOLUME',
            data: {
                volume: this.state.volume
            }
        }
        actions.hub.saveTestMessage({hubId, payload})
        this.setState({volumeModal: false})
        message.success('It can take up to 2 minutes for the change to be received by the hub', 10)
    }

    getHubBatteryStatus() {
        if (this.props.hubStatus) {
            if (this.props.hubStatus.ups_status &&
                this.props.hubStatus.ups_status.includes('COMPLETE')) {
                return <MyIcon type="icon-battery4-copy" className="statusBattery"/>
            }
            if (this.props.hubStatus.ups_status &&
                this.props.hubStatus.ups_status.includes('CHARGING')) {
                return <MyIcon type="icon-batterycharging"  className="statusBattery"/>
            }
            if (this.props.hubStatus.ups_status && this.props.hubStatus.ups_status.includes('NO_BATTERY_PRESENT')){
                return <Icon component={Unknown} className="statusBattery"/>
            }

            if (this.props.hubStatus !== undefined && this.props.hubStatus.ups_capacity > 0.9) {
                return <div style={{display: 'flex'}}>
                    <MyIcon type="icon-battery4-copy"  className="statusBattery"/>
                    {this.props.admin && <div>{(this.props.hubStatus.ups_capacity * 100).toFixed(0)}%</div>}
                </div>
            } else if (this.props.hubStatus !== undefined && this.props.hubStatus.ups_capacity > 0.75) {
                return <div style={{display: 'flex'}}>
                    <MyIcon type="icon-battery3-copy"  className="statusBattery"/>
                    {this.props.admin && <div>{(this.props.hubStatus.ups_capacity * 100).toFixed(0)}%</div>}
                </div>
            } else if (this.props.hubStatus !== undefined && this.props.hubStatus.ups_capacity > 0.5) {
                return <div style={{display: 'flex'}}>
                    <MyIcon type="icon-battery2-copy"  className="statusBattery"/>
                    {this.props.admin && <div>{(this.props.hubStatus.ups_capacity * 100).toFixed(0)}%</div>}
                </div>
            } else if (this.props.hubStatus !== undefined && this.props.hubStatus.ups_capacity >0.25) {
                return <div style={{display: 'flex'}}>
                    <MyIcon type="icon-battery1-copy"  className="statusBattery"/>
                    {this.props.admin && <div>{(this.props.hubStatus.ups_capacity * 100).toFixed(0)}%</div>}
                </div>
            } else if (this.props.hubStatus !== undefined && this.props.hubStatus.ups_capacity < 0.25) {
                return <div style={{display: 'flex'}}>
                    <MyIcon type="icon-battery-0"  className="statusBattery"/>
                    {this.props.admin && <div>{(this.props.hubStatus.ups_capacity * 100).toFixed(0)}%</div>}
                </div>
            } else if (this.props.hubStatus === undefined) {
                return <div style={{display: 'flex'}}>
                    <MyIcon type="icon-battery-0"  className="statusBattery"/>
                    {this.props.admin && <div>0%</div>}
                </div>
            }
        }
    }

    renderNetwork = (hubStatus) => <Fragment>
        <span className="type">
            {hubStatus.network_type && hubStatus.network_type.split('_').join('').trimLeft()}
        </span>
        {hubStatus && this.handleNetworkIcon(hubStatus)}
        <span>Connected</span>
    </Fragment>

    renderUnknownNetwork = () => {
        const {admin, hub} = this.props
        const online = hub && hub.connectivity_state==='ONLINE'
        if (!admin) {
            if (online) {
                return <span className="type"><CloudOutlined style={{marginRight:'6px'}} />Connected</span>
            }else {
                return (
                    <span className="type"><Tooltip title={<span>Unknown Network Status - Hub Offline</span>}>
                        <CloudOutlined style={{marginRight:'6px'}} />Offline
                    </Tooltip></span>
                )
            }
        }else{
            if (online) {
                return <span className="type"><CloudOutlined style={{marginRight:'6px'}} />Connected (UNKNOWN)</span>
            }else {
                return (
                    <span className="type"><Tooltip title={<span>Unknown Network Status - Hub Offline</span>}>
                        <CloudOutlined style={{marginRight:'6px'}} />Offline
                    </Tooltip></span>
                )
            }
        }
    }

    handleNetworkIcon = (hubStatus) => {
        if (hubStatus.network_type && hubStatus.network_type.includes('G')){
            return generate4gIcon(hubStatus.network_signal_level)
        }else if(hubStatus.network_type && hubStatus.network_type.includes('WIFI')){
            return generateWifiIcon(hubStatus.network_signal_level)
        }else {
            return <CloudOutlined style={{marginRight: 6}} />
        }
    }
    render(){
        const { hub, hubStatus, timezone } = this.props
        const currentRoomDesc = 'In ' + this.props.lastKnown.space_name +
            ' (Entered ' + moment(this.props.lastKnown.started_at).from() + ')'
        return (
            <Card className="statusContainer" bodyStyle={{padding: '12px 12px 0 12px'}}>
                <Row>
                    <Col>
                        <span className="fontHeading hubNameStatus">{hub.display_name}</span>
                        <DeviceStatus status={hub && hub.connectivity_state} />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Clock
                            online={hub && hub.connectivity_state==='ONLINE'}
                            timezone={timezone}
                            product={globalConstants.HUB_SOFIHUB}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <p className="lastSeen">Last seen
                            <span className="">&nbsp;{
                                moment.duration(moment().diff(hub.last_heartbeat_at))
                                    .humanize()}&nbsp;ago</span>
                        </p>
                    </Col>
                </Row>
                <Row className="margin-bottom">
                    <Col>
                        <span className="currentRoom">{currentRoomDesc}</span>
                    </Col>
                </Row>

                <Row>
                    <Col className="batteryStatusCol">
                        <Row type="flex" gutter={6}>
                            <Col>
                                <Row type="flex" gutter={6}>
                                    <Col>
                                        {this.getHubBatteryStatus()}
                                    </Col>
                                    <Col> {changeCase.titleCase(hubStatus &&
                                    (this.props.hubStatus.ups_status === 'NO_POWER_PRESENT'
                                        ? 'Running on Battery Backup'
                                        : this.props.hubStatus.ups_status === 'NO_BATTERY_PRESENT'
                                            ? 'Calculating...'
                                            : hubStatus.ups_status))}</Col>
                                    <Divider type={'vertical'}/>
                                </Row>
                            </Col>
                            <Col>
                                <Row type="flex" gutter={6}>
                                    <Col className="volumeIcon" onClick={()=>this.setState({volumeModal: true})}>
                                        {hubStatus && hubStatus.volume>0 ?
                                            <MyIcon type="icon-volumeup"/>
                                            :  <MyIcon type="icon-volume-off"/>}
                                    </Col>
                                    <Col>{hubStatus !== undefined
                                        ? hubStatus.volume
                                        : '0'}%
                                    </Col>
                                    <Button
                                        className="editVolumeButton"
                                        type="default"
                                        size="small"
                                        onClick={()=> this.setState({volumeModal: true})}
                                        icon={<EditOutlined />}
                                    />
                                    <Divider type={'vertical'}/>
                                </Row>
                            </Col>
                            <Col className="signal">
                                {hubStatus.network_type && hubStatus.network_type==='UNKNOWN'
                                    ? this.renderUnknownNetwork()
                                    : this.renderNetwork(hubStatus)}
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Modal
                    okText="Send to Hub"
                    open={this.state.volumeModal} onCancel={()=>this.setState({volumeModal: false})}
                    onOk={()=>this.saveVolume()}
                    footer={<OfflineFooter
                        handleCancel={()=>this.setState({volumeModal: false})}
                        handleOk={()=>this.saveVolume()}
                        onlineStatus={hub && hub.connectivity_state==='ONLINE'}
                    />}
                    centered={false} title="Change Hub Volume"  style={{height: '300px'}}>

                    <label>Volume</label>
                    <div className="icon-wrapper">
                        <MyIcon type="icon-volume_"/>
                        <Slider
                            value={this.state.volume}
                            onChange={ e => this.setState({volume: e})}
                        />
                        <MyIcon type="icon-volume3"/>
                    </div>
                </Modal>
            </Card>
        )
    }


}
