import { Component, Fragment } from 'react'
import { LeftOutlined } from '@ant-design/icons'
import { Row, Col, Typography, Divider, Card } from 'antd'
import {connect, actions} from 'mirrorx'
import DownTime from '../../../_constants/downtime'
import moment from 'moment'
import {formatTemplateToString, formatTimeWithTimezone} from '@/utility/Common'
import './Outage.scss'
import Logo from '../../../images/logo.svg'


const { Title, Paragraph, Text } = Typography

const mapStateToProps = state => ({
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    apiVersion:state.setting.apiVersion
})

class OutageDetail extends Component {
    constructor(props){
        super(props)
        this.state = {time: moment()}

    }

    timer = () => {
        this.setState({
            time: moment()
        })
    }

    componentDidMount() {
        this.intervalId = setInterval(this.timer, 10000)
    }

    componentWillUnmount(){
        clearInterval(this.intervalId)
    }


    sayHi = () => {
        const hour = moment().hour()
        if (hour >= 6 && hour < 12) {
            return 'Good Morning,'
        } else if (hour >= 12 && hour < 16) {
            return 'Good Afternoon,'
        } else if (hour >= 16 && hour < 21) {
            return 'Good Evening,'
        } else return 'Good Night,'
    }


    render() {
        const {time} = this.state
        const latestDownTime = DownTime[DownTime.length - 1]
        const start = formatTimeWithTimezone(latestDownTime.outageDateTimeStart)
        const end = formatTimeWithTimezone(latestDownTime.outageDateTimeEnd)
        const environment = window.location.href.match(RegExp('portal.(\\S+).sofieco')) ?
            window.location.href.match(RegExp('portal.(\\S+).sofieco'))[1] : 'Unknown'
        return moment(latestDownTime.outageDateTimeEnd).isAfter(time) ?
            <div className="outageContainer">
                <Row type="flex" justify="center">
                    <Col xs={24} md={12}>
                        <Card className="outageCard">
                            <Row gutter={32}>
                                <Col><a className="sofiBlue" onClick={()=>actions.routing.goBack()}>
                                    <LeftOutlined />Back</a></Col>
                            </Row>
                            <Typography>
                                <Row type="flex" justify="center" className="alignCenter">
                                    <Logo width={230} height={120}/>
                                </Row>
                                <Row type="flex" justify="center" className="alignCenter">
                                    <Title level={4}>
                                        {latestDownTime.outageDetailPageTitle}
                                    </Title>
                                </Row>
                                <Paragraph>
                                    {this.sayHi()}
                                </Paragraph>
                                <Paragraph>
                                    {formatTemplateToString(latestDownTime.outageDetailPageIntroduction, {start, end})}
                                </Paragraph>
                                <Row type="flex" justify="space-around">
                                    <Col xs={24} lg={10}>
                                        <Text strong>When does it start?</Text>
                                    </Col>
                                    <Col xs={24} lg={14}>
                                        {start}
                                    </Col>
                                </Row>
                                <Row type="flex" justify="space-around">
                                    <Col xs={24} lg={10}>
                                        <Text strong>When does it end?</Text>
                                    </Col>
                                    <Col xs={24} lg={14}>
                                        {end}
                                    </Col>
                                </Row>
                                {latestDownTime.optionalOutageDetailPageWhatRegionWillBeImpacted && <Row justify="space-around">
                                    <Col xs={24} lg={10}>
                                        <Text strong>What regions will be impacted?</Text>
                                    </Col>
                                    <Col xs={24} lg={14}>
                                        {latestDownTime.optionalOutageDetailPageWhatRegionWillBeImpacted}
                                    </Col>
                                </Row>}
                                {latestDownTime.optionalOutageDetailPageReasonForOutage && <Row justify="space-around">
                                    <Col xs={24} lg={10}>
                                        <Text strong>What is the reason for the outage?</Text>
                                    </Col>
                                    <Col xs={24} lg={14}>
                                        {latestDownTime.optionalOutageDetailPageReasonForOutage}
                                    </Col>
                                </Row>}
                                {latestDownTime.optionalOutageDetailPageWhatFunctionsWillBeImpacted && <Fragment><Row>
                                    <Col>
                                        <Text strong>What functions will be impacted?</Text>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <div dangerouslySetInnerHTML={{__html: latestDownTime.optionalOutageDetailPageWhatFunctionsWillBeImpacted}} />
                                    </Col>
                                </Row></Fragment>}
                                <Divider />
                                {latestDownTime.optionalOutageDetailPageWillIBeImpacted && <Fragment>
                                    <Row>
                                        <Col>
                                            <Text strong>Will I be impacted?</Text>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            <div dangerouslySetInnerHTML={{__html: latestDownTime.optionalOutageDetailPageWillIBeImpacted}} />
                                        </Col>
                                    </Row>
                                    <Divider />
                                </Fragment>}
                                <Row>
                                    <Col>
                                        <Text strong>I have questions, who can I contact?</Text>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <div dangerouslySetInnerHTML={{__html: latestDownTime.outageDetailPageContact}} />
                                    </Col>
                                </Row>
                                <Divider />
                                <Paragraph>
                            Portal Version: {process.env.APP_VERSION}
                                    <Divider type={'vertical'}/>
                            API Version: {environment}
                                </Paragraph>
                            </Typography>
                        </Card>

                    </Col>
                </Row>
            </div>
            : window.location.href='/deviceSelection'
    }
}

export default connect(mapStateToProps, null) (OutageDetail)
