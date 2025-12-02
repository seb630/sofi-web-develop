import { Button, Card, Col, Row, Space } from 'antd'
import { actions, connect } from 'mirrorx'
import { globalConstants } from '@/_constants'
import { useEffect } from 'react'
import { titleCase } from 'change-case'
import QuickOverviewCard from '@/pages/GlobalAdmin/Home/QuickOverviewCard'

const mapStateToProps = state => ({
    providers: state.SIM.providers,
})

const NavigationCard = (props) => {
    useEffect(()=>actions.SIM.fetchProviders(),[])

    return <Card title="What would you like to do?">
        <Row className="margin-bottom">
            Go to &quot;All x&quot; page for:
        </Row>
        <Row gutter={[12,12]}>
            <Col>
                <Button type="primary" onClick={()=>actions.routing.push('/globalAdmin/hub')}>{titleCase(globalConstants.HUB_GENERIC)}</Button>
            </Col>
            <Col>
                <Button type="primary" onClick={()=>actions.routing.push('/globalAdmin/beacon')}>{titleCase(globalConstants.PENDANT_GENERIC)}</Button>
            </Col>
            <Col>
                <Button type="primary" onClick={()=>actions.routing.push('/globalAdmin/radar')}>{titleCase(globalConstants.RADAR_GENERIC)}</Button>
            </Col>
            <Col>
                <Button type="primary" onClick={()=>actions.routing.push('/globalAdmin/user')}>Users</Button>
            </Col>
            {props.providers?.length>0 && <Col>
                <Button type="primary" onClick={()=>actions.routing.push('/globalAdmin/SIM-activation')} className="margin-right">SIMs</Button>
                Please note this is only available for SOFIHUB managed SIM cards
            </Col>
            }
        </Row>
    </Card>
}

const GlobalAdminHome = (props) => {
    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <NavigationCard {...props}/>
            <QuickOverviewCard />
        </Space>
    )
}

export default connect(mapStateToProps, {})(GlobalAdminHome)
