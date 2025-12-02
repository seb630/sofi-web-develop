import { Component } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row } from 'antd'
import PropTypes from 'prop-types'
import Cards from 'react-credit-cards'
import RadarPaymentMethodModal from './RadarPaymentMethodModal'
import { noNeedPayment } from '@/utility/Common'
import { actions } from 'mirrorx'

class RadarPaymentDetail extends Component{

    constructor(props) {
        super(props)
        this.state = {
            addModal: false,
            type: null
        }
    }

    handleAddModal = (state) => {
        this.setState({
            addModal: state,
            type: 'Add'
        })
    }

    noPayment = () =>(
        <div>
            <Row className="margin-bottom">
                Please add payment details to start your subscription.
            </Row>
            <Row type="flex" justify="center">
                <Button type="primary" icon={<PlusOutlined />} onClick={()=>this.handleAddModal(true)}>Add Payment Details</Button>
            </Row>
        </div>
    )

    handleUpdateModal = (state) => {
        this.setState({
            addModal: state,
            type: 'Update'
        })
    }

    existPayment = (subscription) =>(
        <div>
            <Row type="flex" justify="space-between">
                <p>
                    Future subscription payments will be made by:
                </p>
            </Row>
            <Row type="flex" justify="center" className="margin-bottom">
                {subscription && <Cards
                    expiry={subscription.payment_card_expiry ? subscription.payment_card_expiry.replace(/\s/g, ''):''}
                    preview
                    cvc=''
                    number={`**** **** **** ${subscription.payment_card_last4}`}
                    issuer={subscription.payment_card_brand}
                    name={subscription.full_name || ''}
                />
                }
            </Row>
            <Row type="flex" justify="end" gutter={24} className="margin-bottom">
                <Col>
                    <Button type="primary" onClick={()=>this.handleUpdateModal(true)}>Update Payment Details</Button>
                </Col>
            </Row>
            <Row>
                Payment for this subscription was last updated by {subscription.full_name} (Who&#39;s email is {subscription.email} and
                phone is {subscription.phone}.
            </Row>
        </div>
    )

    handleCloseModal = () => {
        this.handleAddModal(false)
        actions.billing.save({paymentMethod: null})
    }

    render(){
        const {subscription, stripeEnabled, paymentRequired} = this.props

        return (
            !noNeedPayment(subscription.subscription_status, stripeEnabled) &&
                <Card className="advanced_block" title="Payment Details">
                    {paymentRequired ? this.noPayment() : this.existPayment(subscription)}
                    <RadarPaymentMethodModal
                        type={this.state.type}
                        open={this.state.addModal}
                        onCancel={this.handleCloseModal}
                        {...this.props}
                    />
                </Card>

        )
    }
}

RadarPaymentDetail.propTypes = {
    product: PropTypes.string,
    subscription: PropTypes.object,
    product_id: PropTypes.string,
    physical_id: PropTypes.string,
    stripeEnabled: PropTypes.bool,
    paymentRequired: PropTypes.bool,
}
export default RadarPaymentDetail
