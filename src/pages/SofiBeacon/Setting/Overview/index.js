import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Button, Card, Descriptions, Input, message, Spin } from 'antd'
import { EditOutlined, SaveOutlined } from '@ant-design/icons'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'
import { formatPhoneNumber } from 'react-phone-number-input'
import { isLife, isWatch, isHalo } from '@/utility/Common'

const mapStateToProps = state => ({
    selectedBeacon: state.sofiBeacon.selectedBeacon,
})

class RadarOverview extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isSubmitting: false,
            edit: false,
            displayName: props.selectedBeacon?.display_name,
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.selectedBeacon !== this.props.selectedBeacon &&
        this.setState({displayName: this.props.selectedBeacon.display_name})
    }


    save = () => {
        let data = {
            ...this.props.selectedBeacon,
            display_name: this.state.displayName
        }
        this.setState({ isSubmitting: true })
        actions.sofiBeacon.saveBeaconInfor(data).then(() => {
            this.setState({ isSubmitting: false })
            message.success('Saved successfully !!',3)
        }).catch(err => {
            this.setState({ isSubmitting: false })
            err.global_errors.forEach(e => {
                message.error(e.message,3)
            })
        })
    }

    handleButton = () => {
        if (this.state.edit) {
            this.setState({edit: false})
            this.save()
        }else{
            this.setState({edit:true})
        }
    }

    render() {
        const { selectedBeacon } = this.props
        const deviceType = isLife(selectedBeacon) ? 
            globalConstants.LIFE_SOFIHUB :
            isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : 
                isHalo(selectedBeacon) ? 'Halo' : globalConstants.BEACON_SOFIHUB

        return (
            <Card className="beacon-card" title={deviceType}>
                <Spin spinning={this.state.isSubmitting} delay={500}>
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Display Name">{
                            this.state.edit ?
                                <Input
                                    style={{width: 200}}
                                    value={this.state.displayName}
                                    onChange={e=>this.setState({displayName:e.target.value})}
                                />
                                :
                                selectedBeacon?.display_name
                        }<Button
                            size={ this.state.edit ? 'default' : 'small'}
                            type="primary"
                            icon={ this.state.edit ? <SaveOutlined /> : <EditOutlined/>}
                            style={{marginLeft:'12px'}}
                            onClick={this.handleButton}
                            disabled={this.state.edit && this.state.displayName.length<1}
                        />
                        </Descriptions.Item>
                        <Descriptions.Item label={`${titleCase(isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC)} ID`}>{selectedBeacon?.pub_id}</Descriptions.Item>
                        <Descriptions.Item label={`${titleCase(isWatch(selectedBeacon) ? globalConstants.BEACON_WATCH : globalConstants.PENDANT_GENERIC)} IMEI`}>{selectedBeacon?.imei}</Descriptions.Item>
                        <Descriptions.Item label="Model">{selectedBeacon?.model}</Descriptions.Item>
                        <Descriptions.Item label="Phone Number">{selectedBeacon?.phone && formatPhoneNumber(selectedBeacon.phone)}</Descriptions.Item>
                        <Descriptions.Item label="Software Version">{selectedBeacon?.version}</Descriptions.Item>
                        <Descriptions.Item label="Firmware Version">{selectedBeacon?.firmware_version}</Descriptions.Item>
                    </Descriptions>
                </Spin>
            </Card>
        )
    }
}

export default connect(mapStateToProps,{})(RadarOverview)
