import { Component, createRef, Fragment } from 'react'
import { actions } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Input, Menu, message, Modal, Spin } from 'antd'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { globalConstants } from '@/_constants'

class LinkBeaconModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            submitting : false,
            open: false,
            selectedBeacon: null,
            filteredBeacons: null
        }

        this.searchBox = createRef()
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
            submitting: false,
            open: false,
            selectedBeacon: null,
            filteredBeacons: null
        })
    }

    /** handle search beacon */
    handleSearchBeacon = (value) => {
        const { beacons } = this.props

        if(value) {
            this.setState({
                filteredBeacons: beacons?.filter(x =>
                    ( x.display_name?.toLowerCase().includes(value.toLowerCase())
                    || x.imei?.toLowerCase().includes(value.toLowerCase())
                    || x.phone?.toLowerCase().includes(value.toLowerCase())
                    )
                )
            })
        } else {
            this.setState({
                filteredBeacons: null
            })
        }
    }

    /** handle select beacon */
    handleSelectBeacon = (item) => {
        this.setState({
            selectedBeacon: item
        })
    }

    /** handle link beacon */
    handleLinkBeacon = async () => {
        const { hubId, onAfterSaved } = this.props
        const { selectedBeacon } = this.state

        this.setState({
            submitting: true
        })
        try {
            await actions.sofiBeacon.linkBeacon({ hubId , beaconId: selectedBeacon.pub_id }).then(()=>{
                actions.hub.fetchHubBeacon(hubId)
                // actions.sofiBeacon.fetchBeaconByUser()
                this.handleCancel()
                actions.sofiBeacon.selectBeacon(selectedBeacon).then(()=>{
                    onAfterSaved && onAfterSaved()
                })
            })

        } catch (err) {
            err.global_errors && err.global_errors.map((msg) => {
                message.error(msg)
            })
        } finally {
            this.setState({
                submitting: false
            })
        }
    }

    render() {
        const { beacons } = this.props
        const { open , filteredBeacons, submitting } = this.state
        const beaconList = (<Menu id='filteredBeacons' style={{ borderRight: '0px' }}>
            {
                (filteredBeacons || beacons).map ((item,index) => {
                    return (<Menu.Item key={index} onClick={() => { this.handleSelectBeacon(item) }}>
                        { item.display_name }
                    </Menu.Item>)
                })
            }
        </Menu>)
        return (
            <Fragment>
                <Button id='btnLinkBeacon' type="primary" onClick={this.handleOpen} icon={<PlusOutlined />} size='large'> Link a Beacon </Button>
                <Modal open={open}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button id='btnCancel' key='cancel' type="primary" onClick={this.handleCancel}>Cancel</Button>,
                        <Button id='btnLinkingBeacon' key='link' type="primary" onClick={this.handleLinkBeacon}>Link</Button>
                    ]}
                >
                    <Spin spinning={submitting}>
                        <label> Which {globalConstants.BEACON_SOFIHUB} do you want to link with this {globalConstants.HUB_SOFIHUB}?</label>
                        <p> Please select a {globalConstants.BEACON_SOFIHUB} from the list below or search: </p>
                        <Input.Search ref={this.searchBox} id='test-searchbeacon'
                            placeholder={`search ${globalConstants.BEACON_SOFIHUB}...`}
                            onChange={_.debounce(() => { this.handleSearchBeacon(this.searchBox.current.input?.state?.value) },globalConstants.DEFAULT_DEBOUNCE_TIME)}
                            onSearch={this.handleSearchBeacon}
                        />
                        <div className="scrollable-y" style={{ maxHeight: '300px'}}>
                            { beaconList }
                        </div>
                    </Spin>
                </Modal>
            </Fragment>
        )
    }
}

LinkBeaconModal.propTypes = {
    beacons: PropTypes.arrayOf(PropTypes.shape({
        display_name: PropTypes.string,
        beacon_id: PropTypes.string,
        phone: PropTypes.string,
        imei: PropTypes.string
    })),
    me: PropTypes.shape({
        user_id: PropTypes.number
    }).isRequired,
    hubId: PropTypes.string.isRequired,
    onAfterSaved: PropTypes.func
}

export default LinkBeaconModal
