import { Component } from 'react'
import {loadStripe} from '@stripe/stripe-js'
import {CardElement, Elements, ElementsConsumer} from '@stripe/react-stripe-js'
import './Common.scss'
import { Button, message, Modal, Row } from 'antd'
import {actions, connect} from 'mirrorx'
import PropTypes from 'prop-types'

const mapStateToProps = state => ({
    stripeKey: state.billing.stripeKey,
})


class CheckoutForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            warning: true,
        }
    }

    showWarning = () =>{
        const {warning} = this.state
        const {admin} = this.props
        if (warning && admin){
            this.setState({warning: false})
            Modal.warning({
                title: 'WARNING, You\'re an admin!',
                okText: 'I understand',
                content: 'Admin users should not be entering a credit card and paying for a system! Please help your ' +
                    'user to login to their account on the portal, using their own personal device to type in the ' +
                    'credit card information. Please do not fill in the credit card details unless you personally are ' +
                    'a carer for this system'
            })
        }
    }

    handleSubmit = async (event) => {
        // Block native form submission.
        event.preventDefault()
        this.setState({loading: true})

        const {stripe, elements} = this.props

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return
        }

        // Get a reference to a mounted CardElement. Elements knows how
        // to find your CardElement because there can only ever be one of
        // each type of element.
        const cardElement = elements.getElement(CardElement)

        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        })
        this.setState({loading: false})
        if (error) {
            message.error(error.message)
            this.setState({loading: false})
        } else {
            message.success('Card Verified')
            actions.billing.save({
                paymentMethod: paymentMethod
            })
            this.props.afterVerify && this.props.afterVerify()
        }
    }

    componentWillUnmount () {
        this.setState({warning: true})
    }

    render() {
        const {stripe, button} = this.props
        return (
            <form>
                <CardElement
                    onFocus={this.showWarning}
                />
                <Row justify="center" type="flex">
                    <Button type="primary" disabled={!stripe} onClick={this.handleSubmit} loading={this.state.loading}
                        className="margin-bottom">
                        {button ? button : 'Verify Card'}
                    </Button>
                </Row>
            </form>
        )
    }
}

const InjectedCheckoutForm = (props) => {
    return (
        <ElementsConsumer {...props}>
            {({elements, ...prop}) => {
                return <CheckoutForm elements={elements} {...prop}{...props}/>
            }}
        </ElementsConsumer>
    )
}

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.

class StripePayment extends Component  {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        !this.props.stripeKey && actions.billing.fetchStripeKey()
    }

    render() {
        const stripePromise = this.props.stripeKey && loadStripe(this.props.stripeKey)
        return (
            stripePromise ? <Elements stripe={stripePromise}{...this.props}>
                <InjectedCheckoutForm {...this.props}/>
            </Elements> : null
        )
    }
}

StripePayment.propTypes={
    afterVerify: PropTypes.func,
    button: PropTypes.string,
    admin: PropTypes.bool,
}

export default connect(mapStateToProps, null) (StripePayment)
