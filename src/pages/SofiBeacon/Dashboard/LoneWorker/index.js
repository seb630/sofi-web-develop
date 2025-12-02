import { Button, Card, Col, message, Row, Space } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { actions, connect } from 'mirrorx'
import { BrowserView, MobileView } from 'react-device-detect'
import styled from '@/scss/colours.scss'
import StartModal from '@/pages/SofiBeacon/Dashboard/LoneWorker/StartModal'
import moment from 'moment'
import FinishModal from '@/pages/SofiBeacon/Dashboard/LoneWorker/FinishModal'

const mapStateToProps = state => ({
    userId: state.user.me?.user_id,
    selectedBeacon: state.sofiBeacon.selectedBeacon,
    loneWorkerMonitors: state.user.loneWorkerMonitors,
    TPCount: state.sofiBeacon.TPCount,
    loneWorkerEnabled: state.common.loneWorkerEnabled
})

const LoneWorker = (props) => {
    const {userId, selectedBeacon, loneWorkerMonitors, TPCount, loneWorkerEnabled} = props
    useEffect(()=>loneWorkerEnabled && actions.user.getLoneWorkerMonitors(userId),[userId, loneWorkerEnabled])
    useEffect(()=>actions.sofiBeacon.getTPCount(selectedBeacon.pub_id),[selectedBeacon])

    const [startModal, setStartModal] = useState(false)
    const [finishModal, setFinishModal] = useState(false)
    const [extend, setExtend] = useState(false)

    const hasTPI = TPCount>0

    const currentBeaconMonitors = loneWorkerMonitors?.filter(monitor=>monitor.beacon_id===selectedBeacon.id)?.filter(monitor=>!monitor.dismissed_at)

    const calculateMonitorSession = (monitors) => {
        let sessionColor = styled.lightText
        let sessionText = 'Not in session'
        if (monitors?.length>0){
            if (monitors.some(monitor=>moment(monitor.end_at).isAfter(moment().add(15,'minute')))){
                sessionColor = styled.green
                sessionText = 'Session Active'
            }else if (monitors.some(monitor=>moment(monitor.end_at).isAfter(moment()))){
                sessionColor = styled.orange
                sessionText = `Session ends ${moment.duration(moment(monitors.find(monitor=>moment(monitor.end_at).isAfter(moment()))?.end_at).diff(moment())).humanize(true)}`
            }else {
                sessionColor = styled.red
                sessionText = 'Session Expired!'
            }
        }
        return {sessionColor, sessionText}
    }

    const calculateMonitorSessionButton = (monitors) => {
        let buttonText
        let buttonAction
        if (monitors?.length>0){
            buttonText = 'Update'
            buttonAction = ()=>setFinishModal(true)
        }else {
            buttonText = 'Start'
            buttonAction = ()=>setStartModal(true)
        }
        return <Button type="primary" className="margin-bottom" onClick={buttonAction}>{buttonText}</Button>
    }

    const {sessionColor, sessionText} = calculateMonitorSession(currentBeaconMonitors)

    const onStart = (time) => {
        const payload = {
            userId,
            beacon_id: selectedBeacon.id,
            period: `PT${time}M`,
            // end_at: format4Api(moment().add(time,'minute'))
        }

        if (extend){
            const activeMonitor = currentBeaconMonitors.find(monitor=>!monitor.dismissed_at)
            payload.id = activeMonitor?.id
            return actions.user.extendLoneWorkerMonitor(payload).then(()=>{
                actions.user.getLoneWorkerMonitors(userId)
                message.success('Monitor Extended!')
                setStartModal(false)
                setExtend(false)
            }).catch((error) => {
                message.error(error.message, 10)
            })
        }

        return actions.user.startLoneWorkerMonitor(payload).then(()=>{
            actions.user.getLoneWorkerMonitors(userId)
            message.success('Monitor started!')
            setStartModal(false)
        }).catch((error) => {
            message.error(error.message, 10)
        })
    }

    const onExtend = () => {
        setExtend(true)
        setStartModal(true)
        setFinishModal(false)
    }

    const onFinish = () => {
        const activeMonitor = currentBeaconMonitors.find(monitor=>!monitor.dismissed_at)
        const notExpire = moment(activeMonitor.end_at).isAfter(moment())
        const payload = {
            userId,
            beacon_id: selectedBeacon.id,
            id: activeMonitor?.id
        }
        let promise = notExpire ? actions.user.dismissLoneWorkerMonitor(payload) : actions.user.resolveLoneWorkerMonitor(payload)
        return promise.then(()=>{
            actions.user.getLoneWorkerMonitors(userId)
            message.success('Monitor Finish!')
            setFinishModal(false)
        }).catch((error) => {
            message.error(error.message, 10)
        })
    }

    return hasTPI ? <Card className="beaconPage-statusCard">
        <BrowserView>
            <div className="batteryIcon" style={{color: sessionColor}}><UserOutlined /></div>
            <Space className="alignBottom text-center" direction="vertical" size={4}>
                <b>Lone Worker Monitoring</b>
                <div className="lastSeen" style={{color: sessionColor}}>{sessionText}</div>
                {calculateMonitorSessionButton(currentBeaconMonitors)}
            </Space>
        </BrowserView>
        <MobileView>
            <Row wrap={false} style={{height: 'inherit'}}>
                <Col
                    flex="75px"
                    className="avatarContainer"
                >
                    <div className="batteryIcon" style={{color: sessionColor}}><UserOutlined /></div>
                </Col>
                <Col flex="auto" className="statusRightContainer">
                    <div className="alignBottom text-center">
                        <b>Lone Worker Monitoring</b>
                        <div className="lastSeen" style={{color: sessionColor}}>{sessionText}</div>
                    </div>
                </Col>
                <Col className="alignBottom text-center">
                    {calculateMonitorSessionButton(currentBeaconMonitors)}
                </Col>
            </Row>
        </MobileView>
        <StartModal
            open={startModal}
            onCancel={()=>setStartModal(false)}
            onOk={onStart}
            extend={extend}
        />
        <FinishModal
            open={finishModal}
            onCancel={()=>setFinishModal(false)}
            onExtend={onExtend}
            onFinish={onFinish}
            expired={currentBeaconMonitors?.some(monitor=>moment(monitor.end_at).isAfter(moment()))}
        />
    </Card>: <div/>
}

export default connect(mapStateToProps, null) (LoneWorker)
