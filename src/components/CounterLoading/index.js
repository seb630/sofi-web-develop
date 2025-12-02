import { Component } from 'react'
import { Modal, Progress } from 'antd'
import PropTypes from 'prop-types'

class CounterLoading extends Component {
    render() {
        const { message , open , status , value, type, width } = this.props
        return (<Modal centered className="customModal customModal--loading" footer={null} open={open}>
            <Progress style={{ marginRight: '15px'}} type={type} width={width} status={status} percent={+value.toFixed(2)} />
            { message }
        </Modal>)
    }
}

CounterLoading.defaultProps = {
    type: 'circle',
    width: 80,
}

CounterLoading.propTypes = {
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    open: PropTypes.bool,
    status: PropTypes.string,
    value: PropTypes.number,
    type: PropTypes.string,
    width: PropTypes.number
}

export default CounterLoading

