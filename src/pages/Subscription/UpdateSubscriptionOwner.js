import { Button, Col, message, Modal, Row, Space, Table, Typography, } from 'antd'
import { useState } from 'react'
import styles from '@/scss/colours.scss'
import { actions } from 'mirrorx'
import PropTypes from 'prop-types'

const UpdateSubscriptionOwner = (props) => {

    const {carers, subscription} = props
    const [open, setOpen] = useState(false)

    const isRadar = subscription?.product_type === 'RADAR'

    const handleNewOwner = (user) => {
        const userObj =  isRadar ? user.flat_user : user
        Modal.confirm({
            width: 600,
            title: 'Are you sure you want to change owner of the subscription?',
            okText: 'Yes, Change Owner',
            onOk: () => handleChange(userObj),
            content: <Space direction="vertical">
                <Row>
                    <Col flex="150px">
                        You are changing the current owner:
                    </Col>
                    <Col style={{color: styles.blue}}>
                        {subscription?.full_name}, {subscription?.email}
                    </Col>
                </Row>

                <Row>
                    <Col flex="150px">
                        To the new owner:
                    </Col>
                    <Col style={{color: styles.green}}>
                        {userObj?.first_name} {userObj?.last_name}, {userObj?.email}
                    </Col>
                </Row>
                <Typography.Paragraph>
                    The existing payment method will be unchanged, but future receipts will only go to the new owner of the subscription.
                </Typography.Paragraph>
            </Space>
        })
    }

    const handleChange = (user) => {
        const payload = {
            product_id: subscription.product_id,
            email: user?.email
        }
        actions.billing.updateSubscriptionOwnership(payload).then(()=>{
            message.success('Ownership changed')
            actions.billing.fetchSubscription(subscription.product_id)
        })
    }

    const columns = [
        {
            title: 'First Name',
            dataIndex: isRadar ? ['flat_user','first_name'] : 'first_name',
            key: 'first_name',
            sorter: (a, b) => a.first_name.localeCompare(b.first_name),
        },
        {
            title: 'Last Name',
            dataIndex: isRadar ? ['flat_user','last_name'] : 'last_name',
            key: 'last_name',
            sorter: (a, b) => a.last_name.localeCompare(b.last_name),
        },
        {
            title: 'Email',
            dataIndex: isRadar ? ['flat_user','email'] :'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Mobile',
            dataIndex: isRadar ? ['flat_user','mobile'] :'mobile',
            key: 'mobile',
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, user) => (
                user.email === subscription.email ? <span style={{color: styles.green}}>Current Owner</span> :
                    <a className="test-button-disconnect" onClick={()=>handleNewOwner(user)}>Make New Owner</a>
            ),
        },
    ]

    return (<>
        <Space wrap align="start" style={{maxWidth: 500}}>
            <Button type="primary" onClick={()=>setOpen(true)} disabled={subscription.product_type==='RADAR'}>
            Change Owner of Subscription
            </Button>
            <span>
                Current owner {subscription?.full_name}, {subscription?.email}. Moves ownership of subscription from one carer to another
            </span>
        </Space>
        <Modal
            width={750}
            open={open}
            onCancel={()=>setOpen(false)}
            footer={null}
            title="Change Owner of Subscription"
        >
            <Space direction="vertical">
                <div>Moves ownership of subscription, from one carer to another. Will change where receipts go.</div>
                <Table
                    dataSource={carers}
                    pagination={false}
                    columns={columns}
                    rowKey="user_id"
                />
            </Space>
        </Modal></>)

}


UpdateSubscriptionOwner.propTypes = {
    carers: PropTypes.array,
    subscription: PropTypes.object
}

export default UpdateSubscriptionOwner
