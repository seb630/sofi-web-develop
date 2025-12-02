import { Fragment, useState } from 'react'
import { Button, Col, Form, Input, message, Modal, Progress, Row, Typography } from 'antd'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import styles from '@/scss/colours.scss'
import RadarMap3DContainer from '@/components/RadarMap3D/index.container'

const { Title, Paragraph } = Typography


const Calibration = (props) => {
    const {radarConfig} = props
    const [intervalId, setIntervalId] = useState()
    const [modal, setModal] = useState(false)
    const [step, setStep] = useState(1)
    const [height, setHeight] = useState()
    const [result, setResult] = useState()
    const [dataSource3d, setDataSource3d] = useState()

    const cancelModal = () => {
        setStep(1)
        setResult(null)
        setHeight(null)
        setDataSource3d(null)
        clearInterval(intervalId)
        setModal(false)
    }

    const goBack = () =>{
        setStep(1)
        setResult(null)
        setDataSource3d(null)
        clearInterval(intervalId)
    }

    const handleSaveOffset = () =>{
        actions.radar.updateRadarConfig({
            ...radarConfig,
            offset_z: result.amended_offset
        }).then(()=>{
            message.success('Calibration result saved!')
            cancelModal()
        })
    }

    const calculateDataSource = (persons) => {
        let timestamp = 0
        let marker = 0
        const markerSymbols = ['circle' , 'square' , 'diamond' , 'circle-open' , 'cross']
        const personsArray = persons.reduce((acc,curr)=>acc.concat(curr),[])

        let dataSource3d = personsArray?.reduce((result, person)=>{
            if (person.activity_timestamp === timestamp){
                marker +=1
            }else {
                timestamp = person.activity_timestamp
                marker = 0
            }
            result.x.push(person.position.x.toFixed(2))
            result.y.push(person.position.y.toFixed(2))
            result.z.push((person.position.z + (radarConfig?.radar_height>0 ? radarConfig.radar_height : 0)).toFixed(2))
            result.text.push(person.activity_timestamp && moment.unix(person.activity_timestamp).format('HH:mm:ss'))
            result.marker.color.push(styles.grey)
            result.marker.symbol.push(markerSymbols[marker])
            result.customdata.push(marker+1)
            return result
        },{
            x:[],
            y:[],
            z:[],
            customdata: [],
            text:[],
            type:'scatter3d',
            name: 'Person',
            texttemplate: 'Person: (%{x}, %{y}, %{z})',
            mode: 'markers',
            hovertemplate: 'Person%{customdata}<br>x: %{x}<br>y: %{y}<br>z: %{z}<br><b>%{text}</b><extra></extra>',
            marker: {color: [], symbol: []},
            showlegend: false
        })
        dataSource3d = [{
            x:[0],
            y:[0],
            z:[props?.radarConfig?.radar_height>0 ? props.radarConfig.radar_height : 0],
            type:'scatter3d',
            name: 'Radar',
            texttemplate: 'Radar: (%{x}, %{y}, %{z})',
            mode: 'markers',
            hovertemplate: 'Radar<br>x: %{x}<br>y: %{y}<br>z: %{z}<extra></extra>',
            marker: {color: ['#000000']},
            showlegend: false
        }].concat([dataSource3d])
        return dataSource3d
    }

    const autoFetch = (start) => {
        clearInterval(intervalId)
        const interval = setInterval(() =>
            actions.radar.startRadarCalibration({
                radar_id: props.selectedRadar.id,
                conductor_body_height: height,
                process_timeout: globalConstants.DEFAULT_RADAR_CALIBRATION_TIMEOUT,
                sampling_target_count: globalConstants.DEFAULT_RADAR_CALIBRATION_COUNT,
                start_at: start
            }).then((result)=> {
                setResult(result)
                setDataSource3d(calculateDataSource(result.persons))
                result.error && clearInterval(interval)
                result.offset && clearInterval(interval)
                result.offset && setStep(3)
            }), globalConstants.RADAR_AUTO_REFRESH_TIME)
        setIntervalId(interval)
    }

    const handleStart = () => {
        actions.radar.startRadarCalibration({
            radar_id: props.selectedRadar.id,
            conductor_body_height: height,
            process_timeout: globalConstants.DEFAULT_RADAR_CALIBRATION_TIMEOUT,
            sampling_target_count: globalConstants.DEFAULT_RADAR_CALIBRATION_COUNT,
            start_at: moment().format()
        }).then(()=> {
            setStep(2)
            autoFetch(moment().format())
        })
    }

    const renderCardTitle = () => {
        if (step===1){
            return 'Calibrate your Radar'
        }else if (step===2){
            return 'Calibrating...'
        }else if (step===3){
            return 'Calibrating Complete!'
        }else return ''
    }

    const renderCardBody = () => {
        if (step===1){
            return (<Fragment><Typography>
                <Paragraph>{globalConstants.RADAR_HOBA} calibration involves starting the process and then walking around the space the
                    {globalConstants.RADAR_HOBA} can observe for about three minutes.</Paragraph>
                <Paragraph>Instructions:</Paragraph>
                <Paragraph>
                    <ol>
                        <li>Tell us the height of the person who will walk in the room.</li>
                        <li>Press &quot;Start&quot;</li>
                        <li>Walk into the space the {globalConstants.RADAR_HOBA} can observe</li>
                        <li>Every 5 seconds take a half step in a direction you have not yet been since pressing the
                        &quot;Start&quot; button. We suggest that you walk in a spiral like fashion.</li>
                        <li>After three minutes or so, return to this screen to view the result</li>
                    </ol>
                </Paragraph>
                <Paragraph>During the calibration process only one person may walk around the space, the {globalConstants.RADAR_HOBA} must
                remain switched on and connected to the Internet. If one of these conditions is not met the calibration
                process will be stopped - you can always restart the calibration process at any time. Please do not put
                your mobile/tablet/computer to sleep or lock while calibration is underway.</Paragraph>
            </Typography>
            <Form
                name="basic"
                labelCol={{ span: 12 }}
                wrapperCol={{ span: 6 }}
            >
                <Form.Item
                    colon={false}
                    label="How tall is the person walking?"
                    name="height"
                    rules={[{ required: true, message: 'Please input height!' }]}
                >
                    <Input placeholder="In meters" onChange={(e)=>setHeight(e.target.value)}/>
                </Form.Item>
            </Form>
            </Fragment>
            )
        } else if (step ===2) {
            return <Fragment>
                <Typography>
                    <Paragraph>Calibration has started, please walk into the space alone, and walk around the space.
                        We suggest you move around half a metre forward every 10 to 20 seconds and change directions
                        every now and then. Please ensure to walk in all areas in the space. We suggest you walk in a
                        spiral pattern to ensure that all areas of the space are covered. Calibration can normally take around 10 minutes.
                    </Paragraph>
                </Typography>
                <Row>
                    <Progress
                        percent={Math.round(result?.sampling_actual_count/globalConstants.DEFAULT_RADAR_CALIBRATION_COUNT*100)}
                        status={result?.error ? 'exception' : 'active'}
                    />
                </Row>
                <Row justify='center'>{result?.error? `Calibration failed! (${result.error})`:
                    'Calibrating... Keep Walking!'}</Row>

                {result?.error ? renderFailBody() : dataSource3d && <RadarMap3DContainer
                    dataSource={dataSource3d}
                    radarConfig={radarConfig}
                    dragmode={false}
                />}
            </Fragment>
        } else if (step ===3) {
            return <Fragment>
                <Row>
                    <Progress percent={100}/>
                </Row>
                <Row justify='center'>Calibration Complete!</Row>
                <div style={{marginTop: 100}}>
                    <Row justify="center">We&#39;ve calculated an offset value of {result.offset}</Row>
                    {result.offset!==result.amended_offset && <Row justify="center">
                        The offset is too high {result.offset} thus adjusted to {result.amended_offset} so that the fall can work properly</Row>}
                    <Row justify="center">You can accept and save this value or you can choose to reject the value and
                    cancel (no changes will be saved).</Row>
                </div>
            </Fragment>
        }
        return null
    }

    const renderFailBody = () => {
        return <div style={{marginTop: 50}}>
            <Row justify="center">Next steps:</Row>
            <Row justify="center">You can restart calibration now, or go back to previous screen to adjust person
            height, or cancel the calibration process.</Row>
        </div>
    }

    const renderFooter = () => {
        if (step===1){
            return [
                <Button onClick={cancelModal} key="cancel">Cancel</Button>,
                <Button
                    key="start"
                    disabled={!height}
                    type="primary"
                    onClick={handleStart}
                >Start</Button>]
        }
        else if(step===2 && result?.error){ return [
            <Button onClick={cancelModal} key="cancel">Cancel</Button>,
            <Button onClick={goBack} key="back">Go Back</Button>,
            <Button onClick={handleStart} type="primary" key="restart">Restart</Button>,
        ]} else if(step===2){
            return [
                <Button onClick={cancelModal} key="cancel">Cancel</Button>,
            ]
        } else if (step===3){ return [
            <Button onClick={cancelModal} key="cancel">Reject and Cancel</Button>,
            <Button onClick={handleSaveOffset} type="primary" key="accept">Accept and Save</Button>
        ]} else return null
    }

    return <Fragment>
        <Row justify="space-between">
            <Col>
                <Title level={4}><div ref={props.calibrateRef}>Calibrate your Radar</div></Title>
            </Col>
        </Row>
        <Paragraph>
        Calibrating your {globalConstants.RADAR_HOBA} can help detect falls more accurately, help stop false falls from being detected,
        and help provide more accurate height data of persons located within the {globalConstants.RADAR_HOBA}s view.
        </Paragraph>
        <Paragraph>
        Your {globalConstants.RADAR_HOBA} works better when calibrated. Start the calibration process here:
            <Button
                style={{marginLeft:6}}
                type="primary"
                onClick={()=>setModal(true)}
            >Calibrate</Button>
        </Paragraph>
        <Modal
            maskClosable={false}
            destroyOnClose
            width={600}
            title={renderCardTitle()}
            open={modal}
            onCancel={cancelModal}
            footer={renderFooter()}
        >
            {renderCardBody()}
        </Modal>
    </Fragment>

}

Calibration.propTypes={
    selectedRadar: PropTypes.object,
    calibrateRef: PropTypes.object
}

export default Calibration
