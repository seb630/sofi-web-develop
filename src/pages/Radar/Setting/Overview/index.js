import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import {Button, Card, Descriptions, Input, message, Select, Spin} from 'antd'
import { EditOutlined, SaveOutlined } from '@ant-design/icons'
import { globalConstants } from '@/_constants'
import {buildTimezoneOptions} from '@/utility/Countries'

const mapStateToProps = state => ({
    selectedRadar: state.radar.selectedRadar,
})

class RadarOverview extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isSubmitting: false,
            edit: false,
            displayName: props.selectedRadar?.display_name,
            location: props.selectedRadar?.location,
            timezone: props.selectedRadar?.timezone,
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.selectedRadar !== this.props.selectedRadar &&
        this.setState({
            displayName: this.props.selectedRadar.display_name,
            location: this.props.selectedRadar.location,
            timezone: this.props.selectedRadar.timezone,
        })
    }


    save = () => {
        let data = {
            id: this.props.selectedRadar.id,
            display_name: this.state.displayName,
            location: this.state.location,
            timezone: this.state.timezone
        }
        this.setState({ isSubmitting: true })
        actions.radar.saveRadarInfo(data).then(() => {
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
        const { selectedRadar } = this.props
        const timezones = buildTimezoneOptions()

        return (
            <Card className="beacon-card" title={`${globalConstants.RADAR_HOBA}`} extra={[<Button
                size={ this.state.edit ? 'default' : 'small'}
                key="edit"
                type="primary"
                icon={ this.state.edit ? <SaveOutlined /> : <EditOutlined/>}
                style={{marginLeft:'12px'}}
                onClick={this.handleButton}
                disabled={this.state.edit && this.state.displayName?.length<1}
            />]}>
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
                                selectedRadar?.display_name
                        }
                        </Descriptions.Item>
                        <Descriptions.Item label="Location">{
                            this.state.edit ?
                                <Input
                                    style={{width: 200}}
                                    value={this.state.location}
                                    onChange={e=>this.setState({location:e.target.value})}
                                />
                                :
                                selectedRadar?.location
                        }
                        </Descriptions.Item>

                        <Descriptions.Item label="Timezone">{
                            this.state.edit ?
                                <Select
                                    style={{minWidth: 200}}
                                    showSearch
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                    value={this.state.timezone}
                                    onChange={v=>this.setState({timezone:v})}
                                >
                                    {timezones}
                                </Select>

                                :
                                selectedRadar?.timezone
                        }
                        </Descriptions.Item>
                        <Descriptions.Item label="External ID">{selectedRadar?.ext_id}</Descriptions.Item>
                        <Descriptions.Item label="Version">{selectedRadar?.fw_version}</Descriptions.Item>
                    </Descriptions>
                </Spin>
            </Card>
        )
    }
}

export default connect(mapStateToProps,{})(RadarOverview)
