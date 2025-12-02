import { Card, Col, Row, Table } from 'antd'
import moment from 'moment'
import { globalConstants } from '@/_constants'

const EmailNotificationCard = (props) => {
    const {subscription} = props
    const dataSource = [{
        title: 'One month warning',
        target: 'Only the carer who paid for the subscription',
        date: subscription?.card_expiry_first_email_sent_at? moment(subscription?.card_expiry_first_email_sent_at).format(globalConstants.DATETIME_FORMAT): 'Not Available'
    },{
        title: 'Two weeks warning',
        target: 'All carers',
        date: subscription?.card_expiry_second_email_sent_at? moment(subscription?.card_expiry_second_email_sent_at).format(globalConstants.DATETIME_FORMAT): 'Not Available'
    },{
        title: 'Final warning',
        target: 'All carers',
        date: subscription?.card_expiry_final_email_sent_at? moment(subscription?.card_expiry_final_email_sent_at).format(globalConstants.DATETIME_FORMAT): 'Not Available'
    }]

    const columns = [
        {
            title: 'Email Notification',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Who gets notified',
            dataIndex: 'target',
            key: 'target',
        },{
            title: 'Date sent',
            dataIndex: 'date',
            key: 'date',
        }
    ]

    return (subscription?.subscription_status==='ACTIVE' && <Row className="systemDetails" justify="center">
        <Col xs={22} xxl={18}>
            <Card className="advanced_block" title="Credit Card Expiry Warning Email Log">
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    rowKey='title'
                    pagination={false}
                />
            </Card></Col></Row>)
}

export default EmailNotificationCard
