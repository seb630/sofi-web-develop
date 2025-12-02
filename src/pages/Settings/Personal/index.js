import { Fragment, useState } from 'react'
import { connect } from 'mirrorx'
import {Row, Col } from 'antd'
import ResidentDetailsCard from './ResidentDetailsCard'
import {HubNameCard} from './HubNameCard'

const mapStateToProps = state => ({
    selectedHub: state.hub.selectedHub,
    settings: state.setting.settings,
})

const Personal = (props) => {
    const [dirty, setDirty] = useState(false)
    return <Fragment>
        <Row align="middle" justify="center" type="flex" className="margin-bottom">
            <Col xs={22} md={16} xl={12} className="zeroPadding">
                <ResidentDetailsCard
                    {...props}
                    onFormChange={()=>setDirty(true)}
                    isDirty={dirty}
                    onSave={()=>setDirty(false)}
                />
            </Col>
        </Row>
        <Row align="middle" justify="center" type="flex" >
            <Col xs={22} md={16} xl={12} className="zeroPadding">
                {props.selectedHub && props.settings &&
                <HubNameCard
                    selectedHub={props.selectedHub}
                    settings = {props.settings}
                />}
            </Col>
        </Row>
    </Fragment>

}


export default connect(mapStateToProps, null) (Personal)
