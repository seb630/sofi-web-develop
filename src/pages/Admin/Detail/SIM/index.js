import { useState } from 'react'
import { Card, message, Modal, Space, Spin, Typography } from 'antd'
import PropTypes from 'prop-types'
import styled from '@/scss/colours.scss'
import { actions, Link } from 'mirrorx'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import SIMActions from '@/pages/GlobalAdmin/SIM/SIMActivation/SIMAction'
import DeactivateModal from '@/pages/GlobalAdmin/SIM/SIMActivation/DeactivateModal'

const {Paragraph, Text} = Typography

export const SIMStatusCard = (props) => {
    const [disableSync, setDisableSync] = useState(false)
    const [loading, setLoading] = useState({open: false, value:0})
    const [deactivateModalOpen, setDeactivateModalOpen] = useState(false)
    const {selectedDevice, productActivation, providers, activeDeactivation, carriers, iccids, isAdmin} = props
    const type = selectedDevice?.imei ? 'BEACON' : 'HUB'
    const macOrImei = selectedDevice?.imei ? selectedDevice?.imei : selectedDevice?.mac_address

    const renderStatus = (sim) => <div style={{color: sim ? sim.sim_status === 'ACTIVE' ? styled.green : sim.request_status === 'PENDING' ? styled.blue: styled.red :styled.red}}>
        {sim ? sim?.sim_provider==='KORE' && (sim.sim_status==='NOT_ACTIVE' && sim.sim_ext_status ==='Scrapped' || sim.request_type==='DEACTIVATION' ) ? 'TERMINATED'
            : sim.sim_status === 'NOT_ACTIVE' && sim.request_type? `${sim.request_type} ${sim.request_status}`: sim.sim_status
            : 'Unavailable'}
    </div>

    const handleRefresh = () => {
        actions.SIM.fetchSIMByProduct({ type,macOrImei }).then(()=>message.success('Refreshed'))
    }

    let countDownInterval = 0

    const countDown = (duration) => {
        let count = duration
        setLoading({
            open: true,
            value: count
        })
        -- count
        countDownInterval = setInterval(() => {
            if(count === 0) {
                clearInterval(countDownInterval)
                setLoading({
                    value: 0,
                    open: false
                })
                return
            }
            setLoading({
                open: true,
                value: count
            })
            --count
        },1000)
    }

    const handleSync = () => {
        setDisableSync(true)
        countDown(60)
        actions.SIM.refreshActivation(productActivation.id).then(()=>{
            message.success('Syncing, please allow 1 minute')
            setTimeout(()=>{
                handleRefresh()
                setDisableSync(false)
            },60000)
        })
    }

    const handleActivate = () => {
        actions.SIM.activateSIM({id: productActivation.id, notify: !isAdmin}).then((result)=>{
            result && !result.errors && message.success('Activate requested, Please wait up to 30 minutes')
            result?.errors?.includes('already been activated') && message.success('The SIM has already been activated')
        }).catch(()=>{
            message.error('Activation failed, Please contact admin.')
        })
    }

    const handleDelete = () => {
        const record = productActivation
        Modal.confirm({
            onOk: ()=>actions.SIM.deleteActivation(record.id).then(()=>{
                message.success('Delete Success')
            }).catch(()=>{
                message.error('Could not delete SIM activation record, there may still be hubs or beacons using this record.')
            }),
            okText: 'OK',
            title: 'Are you sure you wish to remove SIM?',
            content: 'Deleting this SIM only deletes the database record in The SOFIHUB Cloud, it does not ' +
                'deactivate or remove the SIM from the SIM card provider. If you delete the record in the SOFIHUB ' +
                'Cloud you can still access the SIM and perform actions via the SIM providers portal. Are you sure ' +
                'you want to delete this SIM card from the SOFIHUB cloud database?'
        })
    }

    const renderProviderName = () => {
        if (providers?.find(provider=>provider.name==='KORE')){
            return 'KORE'
        }else {
            return providers?.length>0 ? providers[0].name : 'SIM provider'
        }
    }

    const renderUnavailable = (sim, providers) => {
        if (!sim) {
            return providers?.length>0 ? <Typography>
                <Paragraph>
                    There is no SIM card record in the portal linked to this device. You can: <SIMActions.AllocateSIMModal device={{type, mac_or_imei: macOrImei }} providers={providers} carriers={carriers} iccids={iccids}/>.
                </Paragraph>
                {(selectedDevice?.connectivity_state === 'ONLINE' || selectedDevice?.beacon_status === 'ONLINE') && <Paragraph type="secondary">
                    <Text>However we can see the device is online meaning it must have a SIM that is active and working - this could mean one of three things:
                    1) the device DOES have a Sofihub SIM, but its only recorded in {renderProviderName()} and not in the portal,
                    or 2) the device does NOT have a Sofihub SIM, or 3) the device has a testing SIM card currently installed.</Text>
                </Paragraph>}
            </Typography> : <Paragraph>
                The status of SIM cards is unavailable. SOFIHUB has disabled API access to this function. This is most likely because you are using your
                own SIM cards. Please note everything will still continue to operate as per normal without this function.
            </Paragraph>
        }
    }

    const renderActive = (sim) => {
        if (sim?.sim_status==='ACTIVE') {
            return <Typography>
                <Space direction="vertical">
                    <Text>
                        The SIM card is ACTIVE. {activeDeactivation?.length>0 && <span style={{color: styled.red}}>
                        HOWEVER a termination is pending. Scheduled on or after {activeDeactivation?.length>0 && moment(activeDeactivation[0]?.scheduled_date).format(globalConstants.DATE_FORMAT)}
                        </span>}
                    </Text>
                    <Text>
                        ICCID: {sim.iccid_full}
                    </Text>
                    <Text>
                        Service: {sim.sim_provider},{sim.sim_carrier}
                    </Text>
                    <Text>
                        Phone Number: {sim.msisdn_full}
                    </Text>
                    <Text>
                        You can <a onClick={handleRefresh}>refresh</a> this data, or {disableSync ? <Text disabled>sync</Text> : <a onClick={handleSync}>sync</a>}.
                        You can also <a onClick={()=>setDeactivateModalOpen(true)}>deactivate the SIM</a>, or <a onClick={handleDelete}>disassociate from this device</a>.
                    </Text>
                    <Text>
                        For more actions, please <Link to="/globalAdmin/SIM-activation">visit the &quot;All SIM cards&quot; page</Link>.
                    </Text>
                    {activeDeactivation?.length>0 &&  <Text>
                        For more information on scheduled termination please <Link to="/globalAdmin/SIM-termination">visit the &quot;SIM Card Terminations&quot; page</Link>.
                    </Text>}
                </Space>
            </Typography>
        }
    }

    const renderDeactivated = (sim) => {
        if (sim?.sim_status==='NOT_ACTIVE' && sim?.request_type==='DEACTIVATION' && sim?.request_status === 'SUCCESS') {
            return <Typography>
                <Space direction="vertical">
                    <Text>
                        The SIM card has been terminated.
                    </Text>
                    <Text>
                        ICCID: {sim.iccid_full}
                    </Text>
                    <Text>
                        Service: {sim.sim_provider},{sim.sim_carrier}
                    </Text>
                    <Text>
                        You can <a onClick={handleRefresh}>refresh</a> this data, or {disableSync ? <Text disabled>sync</Text> : <a onClick={handleSync}>sync</a>}.
                    </Text>
                    <Text>
                        For more actions, please <Link to="/globalAdmin/SIM-activation">visit the &quot;All SIM cards&quot; page</Link>.
                    </Text>
                    <Text>
                        For more information on scheduled termination please <Link to="/globalAdmin/SIM-termination">visit the &quot;SIM Card Terminations&quot; page</Link>.
                    </Text>
                </Space>
                {(selectedDevice?.connectivity_state === 'ONLINE' || selectedDevice?.beacon_status === 'ONLINE') && <Paragraph type="secondary">
                    However the device appears to be online even thought no SIM card is recorded against this device. This may mean that it has a SOFIHUB SIM
                    card installed but not recorded in the portal, or it does not have a SOFIHUB SIM card but instead is using a third party SIM card (which cannot be recorded in the portal).
                </Paragraph>}
            </Typography>
        }
    }

    const renderNotActive = (sim) => {
        if (sim?.sim_status==='NOT_ACTIVE' && !(sim?.request_type==='DEACTIVATION' && sim?.request_status === 'SUCCESS')) {
            return <Typography>
                <Space direction="vertical">
                    <Text>
                        The SIM card is currently {sim?.request_status==='PENDING'? 'PENDING activation, but is NOT_ACTIVE at the moment' : 'NOT_ACTIVE'}.
                    </Text>
                    <Text>
                        ICCID: {sim.iccid_full}
                    </Text>
                    <Text>
                        Service: {sim.sim_provider},{sim.sim_carrier}
                    </Text>
                    <Text>
                        You can <a onClick={handleRefresh}>refresh</a> this data, or {disableSync ? <Text disabled>sync</Text> : <a onClick={handleSync}>sync</a>}.
                        You can also <a onClick={handleActivate}>activate the SIM</a>, or <a onClick={handleDelete}>disassociate from this device</a>.
                    </Text>
                    <Text>
                        For more actions, please <Link to="/globalAdmin/SIM-activation">visit the &quot;All SIM cards&quot; page</Link>.
                    </Text>
                </Space>
                {(selectedDevice?.connectivity_state === 'ONLINE' || selectedDevice?.beacon_status === 'ONLINE') && <Paragraph type="secondary">
                    However the device appears to be online even thought no SIM card is recorded against this device. This may mean that it has a SOFIHUB SIM
                    card installed but not recorded in the portal, or it does not have a SOFIHUB SIM card but instead is using a third party SIM card (which cannot be recorded in the portal).
                </Paragraph>}
            </Typography>
        }
    }

    return <Spin spinning={loading.open} tip={`Refreshing data in ${loading.value} seconds`}><Card
        className="margin-bottom"
        title="SIM Card Status"
        extra={renderStatus(productActivation)}
    >
        {renderUnavailable(productActivation, providers)}
        {renderActive(productActivation)}
        {renderDeactivated(productActivation)}
        {renderNotActive(productActivation)}
    </Card>
    <DeactivateModal
        open={deactivateModalOpen}
        record={productActivation}
        carriers={carriers}
        onCancel={()=>setDeactivateModalOpen(false)}
    />
    </Spin>
}

SIMStatusCard.propTypes={
    selectedDevice: PropTypes.object,
    productActivation: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    providers: PropTypes.array,
    iccids: PropTypes.array,
    carriers: PropTypes.array,
    activeDeactivation: PropTypes.array
}
