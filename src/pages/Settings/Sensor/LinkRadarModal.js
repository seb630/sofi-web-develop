import { Component, Fragment } from 'react'
import { Button, Col, message, Modal, Row, Select, Spin } from 'antd'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'
import { PlusOutlined } from '@ant-design/icons'
import NewSpaceModal from '@/pages/Settings/Sensor/SensorPairing/NewSpaceModal'
import careConfirmModal from '@/components/LinkHubRadarModal/CareConfirmModal'
import LinkHubRadarModal from '@/components/LinkHubRadarModal'
import { globalConstants } from '@/_constants'

class LinkRadarModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            submitting: false,
            open: false,
            selectedRadar: null,
            selectedSpace: null,
            newSpaceModal: false,
            tcModal: false,
        }
    }

    /** handle Open */
    handleOpen = () => {
        this.setState({
            open: true
        })
    }

    /** handle Cancel */
    handleCancel = () => {
        this.setState({
            open: false,
            selectedRadar: null,
            selectedSpace: null,
        })
    }

    handleCarerConfirmSubmit = async() => {
        try {
            const { selectedHub } = this.props
            const { selectedRadar, selectedSpace } = this.state
            this.setState({
                submitting: true
            })

            if(selectedRadar) {
                await actions.radar.linkRadarHub({ radar_id: selectedRadar, hub_id: selectedHub.hub_id})
                    .then(()=>{
                        actions.user.dashboardOverview()
                        actions.radar.linkRadarSpace({radar_id: selectedRadar, space_id:selectedSpace })
                            .then(()=>actions.hub.getHubRadars(selectedHub.hub_id))
                    })
                this.handleCancel()
            }
        } catch (err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        } finally {
            this.setState({
                submitting: false, tcModal: false
            })
        }
    }

    handleTCModalSubmit = async() => {
        const userAddToRadar = this.props.hubUsers?.filter(user=>!this.props.hubRadarUsers.find(radarUser=>radarUser.flat_user.user_id===user.user_id)) || []
        const userAddToHub = this.props.hubRadarUsers?.filter(radarUser=>!this.props.hubUsers.find(user=>radarUser.flat_user.user_id===user.user_id))?.map(radarUser=>radarUser.flat_user) || []
        return careConfirmModal(false,this.handleCarerConfirmSubmit, ()=>this.handleTCModalState(false),userAddToRadar, userAddToHub)
    }

    handleTCModalState = (state) => {
        this.setState({tcModal: state})
    }

    /** handle Select Item */
    handleSelectItem = (item) => {
        this.setState({ selectedRadar: item, selectedSpace: null })
        actions.hub.getHubRadarUsers(item)
    }

    navigateToHub = (hub) => {
        actions.hub.selectHub(hub)
        actions.routing.push('/dashboard')
    }

    render() {
        const { radars, hubSpaces, selectedHub } = this.props
        const { open, submitting, selectedRadar, selectedSpace, newSpaceModal, tcModal } = this.state
        const options = radars.filter(radar=>!radar.linked_hub_count).map(radar=><Select.Option value={radar.id} key={radar.id}>{radar.display_name}</Select.Option>)
        const spaceOptions = hubSpaces?.map(space=><Select.Option value={space.space_id} key={space.space_id}>{space.name}</Select.Option>)

        return (<Fragment>
            <Button size="large"  type="primary" onClick={this.handleOpen} icon={<PlusOutlined/>}>
                Add {globalConstants.RADAR_HOBA}
            </Button>
            <Modal
                width={700}
                title={`Add ${globalConstants.RADAR_HOBA} to your ${globalConstants.HUB_SOFIHUB}`}
                onCancel={this.handleCancel}
                open={open}
                onOk={()=>this.handleTCModalState(true)}
                okText="Link"
                okButtonProps={{disabled: !selectedSpace}}
            >
                <Spin spinning={submitting}>
                    <Row gutter={32}>
                        <Col xs={24} lg={12}>
                            <h4>Add the following {globalConstants.RADAR_HOBA}:</h4>
                            <Select
                                style={{width: 300}}
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                size="large"
                                value={selectedRadar}
                                onChange={v=>this.handleSelectItem(v)}
                                placeholder={`Search for ${globalConstants.RADAR_HOBA}...`}
                                className="margin-bottom"
                            >
                                {options}
                            </Select>
                            <h4>Don&#39;t see the {globalConstants.RADAR_HOBA} you need?</h4>
                            <p>
                                You can only the see {globalConstants.RADAR_HOBA}s which are associated with your account. You may need
                                to claim a new {globalConstants.RADAR_HOBA} from the device selection screen.
                            </p>
                        </Col>
                        {selectedRadar && <Col xs={24} lg={12}>
                            <h4>To the following space:</h4>
                            <Select
                                style={{width: 300}}
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                size="large"
                                value={selectedSpace}
                                onChange={v=>this.setState({selectedSpace: v})}
                                placeholder="Search for Space..."
                                className="margin-bottom"
                            >
                                {spaceOptions}
                            </Select>
                            <h4>Don&#39;t see the space you need?</h4>
                            <p>
                                Perhaps the space you need hasn&#39;t been created yet.
                            </p>
                            <Button type="primary" onClick={()=>this.setState({newSpaceModal: true})}>
                                    Create new space
                            </Button>
                        </Col>}
                    </Row>
                </Spin>
            </Modal>
            <NewSpaceModal
                onCancel={()=>this.setState({newSpaceModal: false})}
                open={newSpaceModal}
                hubId = {selectedHub.hub_id}
            />
            <LinkHubRadarModal handleSubmit={this.handleTCModalSubmit} modal={tcModal} handleModalstate={this.handleTCModalState} />
        </Fragment>)
    }
}

LinkRadarModal.propTypes = {
    radars: PropTypes.array,
    hubSpaces: PropTypes.array,
    selectedHub: PropTypes.shape({
        hub_id: PropTypes.string,
        display_name: PropTypes.string
    }).isRequired
}

export default LinkRadarModal
