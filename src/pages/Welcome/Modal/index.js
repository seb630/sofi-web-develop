import { Card, Col, Modal, Row, Typography } from 'antd'
import { isBeacon, isHub, isSita, isLife, isWatch } from '@/utility/Common'
import HubIcon from '@/images/hub_outline_green_icon.svg'
import SitaIcon from '@/images/sita_icon.svg'
import BeaconIcon from '@/images/beacon_icon.svg'
import LifeIcon from '@/images/beacon_teq_life.png'
import WatchIcon from '@/images/beacon_watch_icon.png'
import RadarIcon from '@/images/radar_sensor_icon.png'
import { Fragment } from 'react'
import { getOobeStorage, storeJSONData } from '@/utility/Storage'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'

const { Paragraph } = Typography

const OobeModal = (props) => {
    const { selectedDevice, deviceOobe, openModal, open, onCancel } = props
    const initialSetting = !!deviceOobe?.time
    const deviceId = isHub(selectedDevice) ? selectedDevice.hub_id : selectedDevice.pub_id
    const onSkip = () => {
        const newArray = {
            device_id: deviceId,
            time: null,
            skip: true,
        }
        let storageValue = getOobeStorage()
        storageValue = storageValue.filter(record => record.device_id !== deviceId)
        storageValue.push(newArray)
        storeJSONData('oobe', storageValue, true)
        onCancel()
    }
    const confirmCancel = () => {
        Modal.confirm({
            title: 'Are you sure you want to skip?',
            content: <Typography>
                <Paragraph>
                    Your device may not work properly or work as expected if you skip!
                </Paragraph>
                <Paragraph type="secondary">
                    You can always resume by pressing the &quot;Get Started&quot; button on the dashboard banner.
                </Paragraph>
            </Typography>,
            okText: 'I understand, Skip',
            cancelText: 'Go Back',
            cancelButtonProps: { type: 'primary' },
            okButtonProps: { type: 'default' },
            onOk: onSkip,
        })
    }

    const processOobe = () => {
        onCancel()
        openModal()
    }

    return (
        <Modal
            width={700}
            closable={false}
            className='welcomeModal'
            open={open}
            okText='Finish setting up'
            onOk={processOobe}
            cancelText='Skip for now'
            onCancel={confirmCancel}
        >
            <Card title={initialSetting ? 'Welcome!' : 'Finish Setting Up!'} bordered={false}>
                <Row wrap={false}>
                    <Col className="deviceIconCol" flex='120px'>
                        {isHub(selectedDevice) ?
                            <HubIcon className='hub' /> :
                            isBeacon(selectedDevice) ?
                                isSita(selectedDevice) ? <SitaIcon className='beacon' /> :
                                    isLife(selectedDevice) ? <img src={LifeIcon} style={{ width: '65px' }} /> :
                                        isWatch(selectedDevice) ? <img src={WatchIcon} style={{ width: '65px'}} /> :
                                            <BeaconIcon className='beacon' /> :
                                <img src={RadarIcon} className='radar' alt="radar" width='60' height='60' />
                        }
                    </Col>
                    <Col flex='auto'>
                        <Typography>
                            {initialSetting ? <Fragment>
                                <Paragraph>
                                    Congratulations on claiming your new {
                                        isHub(selectedDevice) ? globalConstants.HUB_SOFIHUB :
                                            isBeacon(selectedDevice) ?
                                                isLife(selectedDevice) ? globalConstants.LIFE_SOFIHUB :
                                                    isWatch(selectedDevice) ? globalConstants.BEACON_WATCH : globalConstants.BEACON_SOFIHUB :
                                                globalConstants.RADAR_HOBA
                                    }!
                                </Paragraph>
                                <Paragraph>
                                    There&#39;s still a few things we need to set up to make sure everything gets up and running properly!
                                </Paragraph>
                            </Fragment> : <Paragraph>
                                We&#39;ve noticed that set up has not been finished and theres still a few things we
                                need to set up to make sure everything gets up and running properly!
                            </Paragraph>}
                            <Paragraph>Let&#39;s get started!</Paragraph>
                        </Typography>
                    </Col>
                </Row>
            </Card>
        </Modal>
    )
}

OobeModal.propTypes = {
    selectedDevice: PropTypes.object,
    deviceOobe: PropTypes.object,
    openModal: PropTypes.func,
    open: PropTypes.bool,
    onCancel: PropTypes.func
}

export default OobeModal
