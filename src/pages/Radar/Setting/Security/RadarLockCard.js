import { actions } from 'mirrorx'
import { Card, Col, Row, Switch } from 'antd'
import { useEffect, useState } from 'react'
import { globalConstants } from '@/_constants'

export const RadarLockCard = (props) => {
    const [lock, setLock] = useState(props.selectedRadar?.is_locked)
    useEffect(()=>setLock(props.selectedRadar?.is_locked), [props])

    const handleSwitchClick = () => {
        let radar = props.selectedRadar
        radar.is_locked = !lock
        setLock(!lock)
        actions.radar.saveRadarInfo(radar)
    }

    const renderTitle = () => <Row justify="space-between" >
        <Col span={18}>Lock your {globalConstants.RADAR_HOBA}</Col>
        <Col span={6}><div className="toggle_switch">
            <Switch
                checked={lock}
                onChange={handleSwitchClick}
            />
        </div></Col>
    </Row>

    return  <Card className="advanced_block" title={renderTitle()}>
        <p>If you lock your {globalConstants.RADAR_HOBA} it means that no one can claim it using the MAC code located on the
            back of the {globalConstants.RADAR_HOBA} or on the box.</p>
        <p>Locking your {globalConstants.RADAR_HOBA} does not stop you from inviting new carers, you can invite new carers at any time
                in the &quot;Carers&quot; tab.</p>
        <p>The SOFIHUB team recommends that you keep your {globalConstants.RADAR_HOBA} locked.
        </p>
    </Card>
}
