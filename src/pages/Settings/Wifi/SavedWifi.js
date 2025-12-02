import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, List, message, Popconfirm, Row } from 'antd'
import { MyIcon } from '../../Common/Common'
import WifiPairingModal from './WifiPairing'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    network: state.hub.network,
    wifiList: state.hub.network ? state.hub.network.config.wpa_ssids : []
})


class SavedWifi extends Component{
    constructor(props) {
        super(props)
        this.state = {
            addModal: false,
            ssid: null
        }
    }

    handleModalState = (state) => {
        this.setState({addModal: state})
    }

    handleNewWifi = () => {
        this.handleModalState(true)
        this.setState({ssid: null})
    }

    handleUpdateWifi = (wifiSsid) => {
        this.handleModalState(true)
        this.setState({ssid: wifiSsid})
    }

    handleChangeWifi = (ssid) => {
        const hubId = this.props.selectedHub.hub_id
        const payload = {
            action: 'WIFI_CONNECT',
            wifi_ssid: ssid,
        }
        actions.hub.updateHubNetwork({hubId, payload}).then(()=>{
            actions.hub.getHubNetwork(this.props.selectedHub.hub_id)
            message.success('The network will be connected in a minute')
        })
    }

    handleForget = (ssid) => {
        const hubId = this.props.selectedHub.hub_id
        const payload = {
            action: 'WIFI_FORGET',
            wifi_ssid: ssid,
        }
        actions.hub.updateHubNetwork({hubId, payload}).then(()=>{
            actions.hub.getHubNetwork(this.props.selectedHub.hub_id)
            message.success('The network will be forgot in a minute')
        }
        )
    }

    render() {
        return (
            <Row type="flex" justify="center">
                <Col xs={22} xl={16}>
                    <Card className="beacon-card" >
                        <label>Saved Wi-Fi networks</label>
                        <Row>
                            <span>When present your {globalConstants.HUB_SOFIHUB} will automatically connect to the following Wi-Fi networks:</span>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={this.props.wifiList}
                                    locale={{emptyText: 'No saved network'}}
                                    renderItem={item => (
                                        <List.Item actions={[
                                            this.props.network.wifi_ssid === item ? <span> Current connected</span> :
                                                <a key={2} onClick={()=> this.handleChangeWifi(item)}>Connect</a> ,
                                            <a key={1}
                                                onClick={()=> this.handleUpdateWifi (item)}
                                            >Update Password</a>,
                                            <Popconfirm
                                                key="remove"
                                                title="Are you sure you wish to forget this Wifi network?"
                                                onConfirm={ ()=>this.handleForget(item)}
                                            ><a>Forget Network</a></Popconfirm>
                                        ]}>
                                            <List.Item.Meta
                                                avatar={
                                                    <MyIcon type="icon-Wifi-4"/>
                                                }
                                                title={item}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleNewWifi}>Connect to new network</Button>
                        </Row>
                    </Card>
                </Col>
                <WifiPairingModal
                    ssid={this.state.ssid}
                    open={this.state.addModal}
                    onClose={()=>this.handleModalState(false)}
                />
            </Row>
        )
    }

}


export default connect(mapStateToProps, null) (SavedWifi)
