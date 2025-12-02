import { Component } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Row, Col, Collapse } from 'antd'
import DeviceCard from '../../components/DeviceCard'
import PropTypes from 'prop-types'


class DeviceGroup extends Component {
    constructor(props) {
        super(props)
        this.state={
            onlineFilter: false,
            nameFilter: '',
            mobileNameFilter: '',
            mobileOnlineFilter: false,
            noDeviceModal: false,
            searchModal: false
        }
    }

    renderNoResult = () => {
        const {onlineFilter, nameFilter } = this.state
        return (nameFilter!=='' || onlineFilter) &&
        <Row className="noResult" type="flex" justify="center">
            <ExclamationCircleOutlined />
            <p>We couldn&#39;t find any results {onlineFilter && 'for online devices '}
                {nameFilter!=='' && `using the search term "${nameFilter}".`}</p>
        </Row>
    }


    render() {
        const {devices, title, ...props} = this.props
        return (
            devices.length>0 && <div className="deviceGroup">
                <Collapse bordered={false} defaultActiveKey={['group']} >
                    <Collapse.Panel key='group' header={title} className="margin-bottom">
                        <Row gutter={[12,12]}>
                            {devices.length>0 ? devices.map((item,i) =>
                                <Col key={i} xs={24} md={12} lg={8} xxl={6}><DeviceCard {...props} device={item} /></Col>)
                                : this.renderNoResult()
                            }
                        </Row>
                    </Collapse.Panel>
                </Collapse>
            </div>
        )
    }
}

DeviceGroup.defaultProps = {
    showName: true
}

DeviceGroup.propTypes = {
    devices: PropTypes.array.isRequired,
    title: PropTypes.string,
    showName: PropTypes.bool,
}

export default DeviceGroup
