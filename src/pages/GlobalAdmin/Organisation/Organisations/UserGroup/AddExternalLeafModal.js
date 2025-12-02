import { Component } from 'react'
import { Col, Modal, Row } from 'antd'
import HubIcon from '../../../../../images/hub_icon.svg'
import BeaconIcon from '../../../../../images/beacon_icon.svg'
import PropTypes from 'prop-types'
import AddBeaconOrgModal from '../Beacon/AddBeaconOrgModal'
import AddHubOrgModal from '../Hub/AddHubOrgModal'

class AddExternalLeafModal extends Component {

    constructor(props) {
        super(props)
        this.state={
            hubModal: false,
            beaconModal: false,
        }
    }


    handleNewHub = (state) => {
        this.setState({hubModal:state})
    }

    handleNewBeacon = (state) => {
        this.setState({beaconModal:state})
    }

    render() {
        const {onClose, open, selectedGroup} = this.props
        const {beaconModal, hubModal} = this.state
        return <Modal
            destroyOnClose
            title='What are you claiming?'
            open={open}
            onCancel={onClose}
            width={900}
            footer={null}
        >
            <Row type="flex" gutter={16} justify="center">
                <Col span={12}>
                    <Row type="flex" justify="center">
                        <HubIcon className="claimImg" />
                    </Row>
                    <Row type="flex" justify="center">
                        <AddHubOrgModal
                            {...this.props}
                            groupId={selectedGroup?.organization_device_group_id}
                            open={hubModal}
                            onClose={()=>this.handleNewHub(false)}
                        />
                    </Row>
                </Col>
                <Col span={12}>
                    <Row type="flex" justify="center">
                        <BeaconIcon className="claimImg" />
                    </Row>
                    <Row type="flex" justify="center">
                        <AddBeaconOrgModal
                            {...this.props}
                            groupId={selectedGroup?.organization_device_group_id}
                            open={beaconModal}
                            onClose={()=>this.handleNewBeacon(false)}
                        />
                    </Row>
                </Col>
            </Row>


        </Modal>
    }
}

AddExternalLeafModal.propTypes ={
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentOrg: PropTypes.object,
    type: PropTypes.oneOf(['user','device']),
    selectedGroup: PropTypes.object,
}

export default AddExternalLeafModal

