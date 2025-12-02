import moment from 'moment/moment'
import { Card, Col, Modal, Row, Space} from 'antd'
import DeviceStatus from '@/components/DeviceStatus'
import RadarIcon from '@/images/radar_sensor_icon.png'
import styled from '@/scss/colours.scss'
import { isMobile } from 'react-device-detect'
import { CloudOutlined } from '@ant-design/icons'
import Clock from '@/pages/Common/Clock'
import { globalConstants } from '@/_constants'
// import FallSound from '@/audios/fall_sound.ogg'
// import {useState} from 'react'
// import {retrieveJSONData} from '@/utility/Storage'

const Status = (props) => {

    const {radar} = props
    // const [showTest, setShowTest] = useState(false)
    // const [fallSound, setFallSound] = useState(retrieveJSONData('RadarAlarm') ? retrieveJSONData('RadarAlarm')[radar.id]: {enable: false, lastPlay: null})

    // const handleFallCheck =(checked) => {
    //     setFallSound({...fallSound, enable: checked})
    //     saveRadarAlarm (checked)
    // }

    // const saveRadarAlarm = (checked) => {
    //     let alarms = retrieveJSONData('RadarAlarm')
    //     if (alarms) {
    //         alarms[radar.id] = {enable: checked}
    //         storeDeviceData('RadarAlarm',alarms)
    //     }else {
    //         storeDeviceData('RadarAlarm', {[radar.id]: {enable:checked}})
    //     }
    // }

    // useEffect(()=>{
    //     if (radar.in_fallen_down && fallSound.enable){
    //         if (fallSound.lastPlay){
    //             if (activeAnomalies?.content[activeAnomalies?.content?.length-1]?.alarm_at){
    //                 if (moment(activeAnomalies?.content[activeAnomalies?.content?.length-1]?.alarm_at).isAfter(fallSound.lastPlay)){
    //                     playFallSound()
    //                 }
    //             }
    //         } else {
    //             playFallSound()
    //         }
    //     }
    //     // eslint-disable-next-line
    // } ,[radar, activeAnomalies])

    // const playFallSound = () => {
    //     const audio = new Audio(FallSound)
    //     audio.addEventListener('canplay', () => {
    //         const playPromise = audio.play()
    //         playPromise.catch((e)=>console.log(e))
    //     })
    //     const newFallSound = {
    //         ...fallSound,
    //         lastPlay: moment().toISOString()
    //     }
    //     let alarms = retrieveJSONData('RadarAlarm')
    //     alarms[radar.id] = newFallSound
    //     storeDeviceData('RadarAlarm',alarms)
    //     setFallSound(newFallSound)
    // }

    const handleCloudClick = () =>{
        (!props.radar.status || props.radar.status==='OFFLINE') && Modal.info({
            title: 'Not in contact with Cloud - What does this mean?',
            content: <div>
                <p>
                    This means that the {globalConstants.RADAR_HOBA} has not gotten in touch with the SOFIHUB cloud to tell us what&#39;s
                    happening. A radar could stop contacting the cloud for a few reasons, for example it may have lost
                    mains power, or its access to the internet may have been interrupted.
                </p>
                <p>
                    To fix this we suggest you inspect the {globalConstants.RADAR_HOBA}, make sure it&#39;s plugged into power, and make sure
                    it can access the internet.
                </p>
                <p>
                    You can also try turning the radar off, leave it off for a minute, and then turn it back on.
                </p>
            </div>
        })
    }

    const renderStatusContent = (radar) => {
        if (!radar.status || radar.status==='OFFLINE'){
            return <span >Not in contact with Cloud</span>
        }else{
            return <span>Connected with Cloud</span>
        }
    }

    const renderStatus = () =>{
        const { radar } = props
        const left = <Col xs={24} md={12}>
            <Card
                bodyStyle={{
                    padding: isMobile ? '0 4px' : '0 12px',
                    background: !radar.status || radar.status==='OFFLINE'? styled.red:styled.green
                }}
                className="radarStatusCard"
                onClick={handleCloudClick}
            >
                <div className="cloudIcon"><CloudOutlined /></div>
                <div className="alignBottom text-center"><div>{renderStatusContent(radar)}</div>
                    <div className="lastSeen" style={{color:'white'}}>Last seen
                        <span>&nbsp;{
                            moment.duration(moment().diff(radar.last_seen_at)).humanize()}&nbsp;ago</span>
                    </div>
                    {(!radar.status || radar.status==='OFFLINE') && <div className="size14">What does this mean?</div>}</div>
            </Card>
        </Col>

        // const right = <Col xs={24} md={12}>
        //     <Card bodyStyle={{
        //         borderRadius: '4px',
        //         color:styled.darkText
        //     }} className="radarStatusCard">
        //         <Space direction="vertical">
        //             <Row>Play sound when fall happens: <Switch checkedChildren="ON" unCheckedChildren="OFF" size="default" checked={fallSound?.enable} onChange={handleFallCheck}/></Row>
        //             <Row><Button onClick={()=>setShowTest(!showTest)} className="margin-bottom">Test sound</Button></Row>
        //             {showTest && <audio controls>
        //                 <source src={FallSound} type="audio/ogg"/>
        //             </audio>}
        //         </Space>
        //     </Card>
        // </Col>
        return <Col span={isMobile ? 24: 12}><Row gutter={12}>
            {left}
            {/*{right}*/}
        </Row></Col>
    }

    return (
        <div className="radarStatusContainer">
            <Row gutter={[16,16]} >
                <Col span={isMobile ? 24 : 12}>
                    <Card bodyStyle={{padding:'0'}}>
                        <Row style={{height: 140}} wrap={false}>
                            <Col
                                flex="100px"
                                style={{ background: !radar.status || radar.status==='OFFLINE'? styled.grey : radar.in_fallen_down ? styled.red : styled.green }}
                                className="avatarContainer"
                            >
                                <img src={RadarIcon} alt="Radar"/>
                            </Col>
                            <Col flex="auto" className="statusRightContainer">
                                <h3 className="fontHeading hubNameStatus" style={{margin:'8px 0 4px 0'}}>{radar.display_name}</h3>
                                <Row className={!isMobile && 'margin-bottom'}>
                                    <Col>
                                        <Clock
                                            online={radar.status==='ONLINE'}
                                            timezone={radar?.timezone}
                                            product={globalConstants.RADAR_HOBA}
                                        />
                                    </Col>
                                </Row>
                                <Space>
                                    <DeviceStatus status={radar?.status} />
                                    {radar?.location &&
                                        <span className={`deviceStatus locationStatus-${radar?.status? radar.status.toLowerCase(): 'offline'}`}>{radar?.location}</span>}
                                </Space>
                                <p className="lastSeen">Last seen
                                    <span className="">&nbsp;{
                                        moment.duration(moment().diff(radar.last_seen_at))
                                            .humanize()}&nbsp;ago</span>
                                </p>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                {renderStatus()}
            </Row>
        </div>
    )
}

export default Status
