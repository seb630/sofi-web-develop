import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Button, Card, Col, DatePicker, message, Modal, Row, Typography } from 'antd'
import PauseDescription from '@/pages/Subscription/PauseDescription'
import styles from '@/scss/colours.scss'
import moment from 'moment'

const {Paragraph, Text} = Typography

const mapStateToProps = state => ({
    subscriptionStatus: state.billing.subscriptionStatus,
    subscription: state.billing.subscription,
})

class PauseSubscription extends Component{
    constructor(props) {
        super(props)
        this.state = {
            currentStatus: props.subscription ? props.subscription.subscription_status : null,
            date: moment().add(1,'month')
        }
    }

    componentDidUpdate(prevProps) {
        prevProps.subscription !== this.props.subscription && this.setState({
            currentStatus: this.props.subscription.subscription_status
        })
    }

    handleSaveClick = () => {
        let {productId, subscription} = this.props
        subscription.subscription_status = this.state.currentStatus

        Modal.confirm({
            title: 'Are you sure you want to change the subscription status?',
            content: 'Changing the subscription status will cancel any active subscription currently being used.',
            okText: 'Yes',
            onOk: ()=>{
                actions.billing.updateSubscription({productId,payload:subscription}).then(()=>{
                    message.success('Subscription status updated')
                })
            }
        })
    }

    renderPause = (disabled) => {
        return <div>
            <PauseDescription disabled={disabled}/>
        </div>
    }

    renderPauseStatus = (subscription) => {
        if (subscription?.subscription_status==='ACTIVE' && !subscription.cancel_at_period_end) {
            return <span style={{color:styles.green}}>{subscription?.payment_paused? 'Paused': 'Not Paused'}</span>
        }else{
            return <span style={{color:styles.red}}>Unavailable</span>
        }
    }

    /** disable date */
    disabledDate(current) {
        return current && current < moment().endOf('day')
    }

    handleDatePickerChanged = (value) => {
        this.setState({date: value})
    }

    handlePauseSubscription = (date) => {
        const payload = {
            product_id: this.props.productId,
            resume_at: date ? date.format('YYYY-MM-DD') : null
        }
        actions.billing.pauseSubscription(payload).then(()=>message.success('Subscription Paused!')).catch(err=>message.error(err.message))
    }

    handleResumeSubscription = () => {
        const payload = {
            product_id: this.props.productId,
            resume_at: null
        }
        actions.billing.resumePausedSubscription(payload).then(()=>message.success('Subscription Resumed!')).catch(err=>message.error(err.message))
    }


    renderPauseSubscriptionRow = () => <Row gutter={[16,12]}  justify="space-around">
        <Col xs={24} lg={8} className="text-center">
            <Button type="primary" onClick={()=>this.handlePauseSubscription()}>Pause with no end date</Button>
        </Col>
        <Col xs={24} lg={12} className="text-center">
            <Row gutter={[12,12]} justify="center">
                <Col>
                    <DatePicker
                        className="filter-history__date"
                        placeholder="Select date" format="DD-MM-YYYY"
                        allowClear={false}
                        value={this.state.date}
                        onChange={this.handleDatePickerChanged}
                        disabledDate={this.disabledDate} />
                </Col>
                <Col>
                    <Button type="primary" onClick={()=>this.handlePauseSubscription(this.state.date)}>Pause until date</Button>
                </Col>
            </Row>
        </Col>
    </Row>


    renderResumeSubscriptionRow = (subscription) => <Row gutter={[16,12]} justify="space-around">
        <Col xs={24} lg={8} className="text-center">
            {subscription.resume_at ?
                <div>
                    <Row><Text strong>Subscription paused until {moment(subscription.resume_at).format('DD-MM-YYYY')}</Text></Row>
                    <Row><Text className="desc">Which is {moment(subscription.resume_at).diff(moment(),'days')} days from now.</Text></Row>
                </div>:
                <div>
                    <Row><Text strong>Subscription paused forever</Text></Row>
                    <Row><Text className="desc">No end date has been set.</Text></Row>
                </div>}
        </Col>
        <Col xs={24} lg={8} className="text-center">
            <Button type="primary" onClick={this.handleResumeSubscription}>Resume subscription immediately</Button>
        </Col>
    </Row>


    renderPauseContent = (subscription) => {
        if (subscription?.subscription_status==='ACTIVE'){
            if (subscription.cancel_at_period_end){
                return <div>
                    <Paragraph>
                        You cannot pause a subscription unless it&#39;s &quot;Active&quot; AND the customer has not requested cancellation.
                        Since this customer has requested cancellation at the end of this billing period, pause cannot be enabled because the
                        cancellation of a subscription does not respect a &quot;pause&quot;.
                    </Paragraph>
                    <Paragraph disabled>
                        <Text strong disabled>How does pausing work?</Text><br/>
                        Firstly your customer must have an active subscription that does not have a cancellation at the end of period.
                    </Paragraph>
                    {this.renderPause(true)}
                </div>
            }
            else{
                return  <div>
                    <Paragraph>
                        You can pause the subscription of this customer as their subscription is &quot;Active&quot;.
                    </Paragraph>
                    <Paragraph>
                        You can pause a subscription in two ways, pause with no end date, or pause with a specific end date.
                    </Paragraph>
                    <Paragraph>
                        {subscription.payment_paused ? this.renderResumeSubscriptionRow(subscription) : this.renderPauseSubscriptionRow()}
                    </Paragraph>
                    {this.renderPause(false)}
                </div>
            }
        }else{
            return <div>
                <Paragraph>
                    You cannot pause a subscription unless it&#39;s &quot;Active&quot;. Please ensure that the customer has added their credit card
                    details via the portal and has made at least one payment to unlock this pause feature.
                </Paragraph>
                <Paragraph disabled>
                    <Text strong disabled>How does pausing work?</Text><br/>
                    Firstly your customer must have an active subscription that does not have a cancellation at the end of period.
                </Paragraph>
                {this.renderPause(true)}
            </div>
        }
    }

    render(){
        const {subscription} = this.props

        return (
            subscription && <Row className="systemDetails" justify="center">
                <Col xs={22} xxl={18}>
                    <Card className="advanced_block" title="Pause Subscription" extra={<div>Currently: {this.renderPauseStatus(subscription)}</div>}>
                        {this.renderPauseContent(subscription)}
                    </Card>
                </Col>
            </Row>
        )
    }
}


export default connect(mapStateToProps, null) (PauseSubscription)
