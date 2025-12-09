import { createRef, forwardRef, Fragment, useImperativeHandle, useState } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Col, message, Row, Slider } from 'antd'
import { sliderFormatter, isLife, isWatch, isHalo } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import BeaconIcon from '@/images/beacon_icon.svg'
import { actions } from 'mirrorx'

let Render4GFall = (props, ref) => {
    const [sensitivity, setSensitivity] = useState(props.parsedBeaconSettings && props.parsedBeaconSettings.fall_detection_on ? props.parsedBeaconSettings.fall_down_level : '10')

    useImperativeHandle(ref, () => ({
        handleSend: () => {
            let payload = {}
            payload.beacon_id = props.selectedBeacon.pub_id
            payload.enabled = sensitivity !== 0
            payload.level = sensitivity
            return actions.sofiBeacon.updateBeaconFall(payload)
        }
    }))

    const renderNewBeacon = () => {
        return <Fragment>
            <p>Use the slider below to turn fall detection on and off, or to change sensitivity.</p>
            <Row type="flex" justify="center">
                <Col xs={20} lg={16}>
                    <Slider
                        min={0}
                        max={9}
                        tooltip={{
                            formatter: sliderFormatter
                        }}
                        value={Number.parseInt(sensitivity)}
                        onChange={v => setSensitivity(v)}
                        marks={{ 1: 'Least', 9: 'Most', 0: 'Off' }}
                    />
                </Col>
            </Row>
        </Fragment>
    }

    const renderOldBeacon = () => {
        return (
            <Fragment>
                <p>You can manage your fall detection settings once you&#39;ve finished setting up your beacon. Fall detection settings can be
                    found under the &quot;Fall Detection&quot; menu.</p>
                <div>
                    <BeaconIcon className="fallImg" />
                    <ExclamationCircleOutlined className="fallStepIcon" />
                </div>
            </Fragment>
        )
    }

    const name =  isLife(props.selectedBeacon) ? globalConstants.LIFE_SOFIHUB : 
        isWatch(props.selectedBeacon) ? globalConstants.BEACON_WATCH : 
            isHalo(props.selectedBeacon) ? 'Halo' : globalConstants.BEACON_SOFIHUB

    return <div className="wizardContent">
        <p>Your {name} offers fall detection. If a fall is detected, emergency contacts can be notified.</p>
        {props.oldBeacon ? renderOldBeacon() : renderNewBeacon()}

    </div>
}

Render4GFall = forwardRef(Render4GFall)

const fallStep = (selectedBeacon, parsedBeaconSettings, next, prev) => {
    const child = createRef()
    const oldBeacon = selectedBeacon && selectedBeacon.model === globalConstants._3G_BEACON_MODEL
    const save = () => {
        oldBeacon ? next() : child.current.handleSend().then(() => {
            message.success('Fall detection setting updated.')
            actions.sofiBeacon.fetchBeaconHeadState(selectedBeacon.pub_id)
            next()
        })
    }
    const title = 'Fall Detection'
    const content = <Render4GFall
        ref={child}
        parsedBeaconSettings={parsedBeaconSettings}
        selectedBeacon={selectedBeacon}
        oldBeacon={oldBeacon} />

    const action = <Row><Col span={24}>
        <Button style={{ marginLeft: 8 }} onClick={prev}>
            Previous
        </Button>
        <Button
            type="primary"
            onClick={save}
            className="floatRight">Next</Button></Col>
    </Row>

    return { title, content, action }
}

export default fallStep
