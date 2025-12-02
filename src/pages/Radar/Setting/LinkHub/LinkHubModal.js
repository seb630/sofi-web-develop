import { Component, Fragment } from 'react'
import { Button, Col, message, Modal, Row, Select, Spin } from 'antd'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'
import { PlusOutlined } from '@ant-design/icons'
import NewSpaceModal from '@/pages/Settings/Sensor/SensorPairing/NewSpaceModal'
import LinkHubRadarModal from '@/components/LinkHubRadarModal'
import careConfirmModal from '@/components/LinkHubRadarModal/CareConfirmModal'
import { globalConstants } from '@/_constants'

class LinkHubModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            submitting: false,
            open: false,
            selectedHub: null,
            selectedSpace: null,
            spaceLoading: false,
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
            selectedHub: null,
        })
        actions.hub.save({hubSpaces: []})
    }

    handleCarerConfirmSubmit = async() => {
        try {
            const { selectedRadar, onAfterSaved, radarHubs } = this.props
            const { selectedHub, selectedSpace } = this.state
            this.setState({
                submitting: true
            })

            radarHubs && this.handleUnlinkHub()

            if(selectedHub) {
                await actions.radar.linkRadarHub({ radar_id: selectedRadar.id, hub_id: selectedHub})
                    .then(()=>{
                        actions.radar.fetchAllRadars()
                        actions.radar.linkRadarSpace({radar_id: selectedRadar.id, space_id:selectedSpace })
                    })
                // }
                await actions.radar.fetchRadarHub(selectedRadar.id)
                await actions.radar.fetchRadarSpace(selectedRadar.id)
                this.handleCancel()
                onAfterSaved && onAfterSaved()
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
        const userAddToRadar = this.props.radarHubUsers?.filter(user=>!this.props.radarUsers.find(radarUser=>radarUser.flat_user.user_id===user.user_id)) || []
        const userAddToHub = this.props.radarUsers?.filter(radarUser=>!this.props.radarHubUsers.find(user=>radarUser.flat_user.user_id===user.user_id))?.map(radarUser=>radarUser.flat_user) || []
        return careConfirmModal(true,this.handleCarerConfirmSubmit, ()=>this.handleTCModalState(false),userAddToRadar, userAddToHub)
    }

    handleTCModalState = (state) => {
        this.setState({tcModal: state})
    }

    /** handle Select Item */
    handleSelectItem = (item) => {
        this.setState({ selectedHub: item, spaceLoading: true, selectedSpace: null })
        actions.hub.getHubSpaces(item).then(()=>this.setState({spaceLoading: false}))
        actions.radar.getRadarHubUsers(item)
    }

    /** handle change hub */
    handleChangeHub = () => {
        Modal.confirm({
            title: `Are you sure you wish to change the ${globalConstants.HUB_SOFIHUB} linked to this ${globalConstants.RADAR_HOBA} ?`,
            content: `If you change the ${globalConstants.HUB_SOFIHUB} you will no longer receive the smart reminders on the old ${globalConstants.HUB_SOFIHUB} if turned on.`,
            okText:'Change',
            onOk: this.handleOpen
        })
    }

    handleUnlinkHub = async () => {
        try {
            const { selectedRadar, radarHubs } = this.props
            await actions.radar.unLinkRadarHub({
                radar_id: selectedRadar.id,
                hub_id: radarHubs[0].hub_id
            }).then(()=>{
                actions.radar.fetchRadarHub(selectedRadar.id)
            })
        } catch (err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        }
    }

    handleConfirmUnlink = () => {
        Modal.confirm({
            title: `Are you sure you wish to unlink this ${globalConstants.HUB_SOFIHUB}?`,
            content: `If you unlink this ${globalConstants.HUB_SOFIHUB} you will no longer receive smart reminders if turned on.`,
            okText: 'Unlink',
            onOk: this.handleUnlinkHub
        })
    }

    navigateToHub = (hub) => {
        actions.hub.selectHub(hub)
        actions.routing.push('/dashboard')
    }

    render() {
        const { hubs, radarHubs, radarSpaces, hubSpaces } = this.props
        const { open, submitting, selectedHub, selectedSpace, newSpaceModal, spaceLoading, tcModal } = this.state
        const options = hubs.map(hub=><Select.Option value={hub.hub_id} key={hub.hub_id}>{hub.display_name}</Select.Option>)
        const spaceOptions = hubSpaces?.map(space=><Select.Option value={space.space_id} key={space.space_id}>{space.name}</Select.Option>)

        return (<Fragment>
            {radarHubs?.length>0 ? <div>
                <p>Your {globalConstants.RADAR_HOBA} is associated with: <a onClick={()=>this.navigateToHub(radarHubs[0])}>{radarHubs[0]?.display_name}</a>, and is allocated to the space: {radarSpaces && radarSpaces[0]?.name} </p>
                <p>You can remove this {globalConstants.HUB_SOFIHUB} association or associate it with a different {globalConstants.HUB_SOFIHUB}.</p>
                <Button className="marginLR" type="primary" onClick={this.handleConfirmUnlink} >
                    Remove association
                </Button>
                <Button className="marginLR" type="primary" onClick={this.handleChangeHub} icon={<PlusOutlined/>}>
                    Associate with different {globalConstants.HUB_SOFIHUB}
                </Button>
            </div>
                : <div>Your {globalConstants.RADAR_HOBA} is not linked to any {globalConstants.HUB_SOFIHUB} currently.
                    <Button className="marginLR" type="primary" onClick={this.handleOpen} icon={<PlusOutlined/>}>
                        Add to {globalConstants.HUB_SOFIHUB}
                    </Button>
                </div>
            }
            <Modal
                width={700}
                title={`Associate ${globalConstants.HUB_SOFIHUB} with your ${globalConstants.RADAR_HOBA}`}
                onCancel={this.handleCancel}
                open={open}
                onOk={()=>this.handleTCModalState(true)}
                okText="Link"
                okButtonProps={{disabled: !selectedSpace}}
            >
                <Spin spinning={submitting}>
                    <Row gutter={32}>
                        <Col xs={24} lg={12}>
                            <h4>Add the following {globalConstants.HUB_SOFIHUB}:</h4>
                            <Select
                                style={{width: 300}}
                                showSearch
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                size="large"
                                value={selectedHub}
                                onChange={v=>this.handleSelectItem(v)}
                                placeholder={`Search for ${globalConstants.HUB_SOFIHUB}...`}
                                className="margin-bottom"
                            >
                                {options}
                            </Select>
                            <h4>Don&#39;t see the {globalConstants.HUB_SOFIHUB} you need?</h4>
                            <p>
                                You can only the see {globalConstants.HUB_SOFIHUB} which are associated with your account. You may need
                                to claim a new {globalConstants.HUB_SOFIHUB} from the device selection screen.
                            </p>
                        </Col>
                        {selectedHub && <Col xs={24} lg={12}>
                            <Spin spinning={spaceLoading}>
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
                            </Spin>
                        </Col>}
                    </Row>
                </Spin>
            </Modal>
            <NewSpaceModal
                onCancel={()=>this.setState({newSpaceModal: false})}
                open={newSpaceModal}
                hubId = {selectedHub}
            />
            <LinkHubRadarModal handleSubmit={this.handleTCModalSubmit} modal={tcModal} handleModalstate={this.handleTCModalState} />
        </Fragment>)
    }
}

LinkHubModal.propTypes = {
    radarHubs: PropTypes.array,
    radarSpaces: PropTypes.array,
    selectedRadar: PropTypes.shape({
        radar_id: PropTypes.string
    }).isRequired,
    hubs: PropTypes.arrayOf(PropTypes.shape({
        hub_id: PropTypes.string,
        display_name: PropTypes.string
    })).isRequired,
    onAfterSaved: PropTypes.func
}

export default LinkHubModal
