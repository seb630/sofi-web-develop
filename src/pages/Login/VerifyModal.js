import { Component } from 'react'
import { Modal } from 'antd'
import PropTypes from 'prop-types'

export default class Unverified extends Component {

    render() {
        return (
            <Modal
                title="We can't let you login, here's why..."
                open={this.props.open}
                onCancel={this.props.onClose}
                onOk={this.props.onResend}
                okText='Resend verification email'
                cancelText='OK'
                confirmLoading={this.props.isSubmitting}
            >
                <span>
                    It looks like you&#39;re trying to log in before verifying your email. Please check your email
                    and click the verification link before trying to login again. Make sure to check your spam
                    folder. If you can&#39;t find the verification email you can send another one by pressing the
                    button below.
                </span>
            </Modal>
        )
    }
}

Unverified.propTypes = {
    open: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onResend: PropTypes.func.isRequired,
}
