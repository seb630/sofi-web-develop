import { Component } from 'react'
import { Card, Table } from 'antd'
import PropTypes from 'prop-types'

class BeaconHeadStateDataCard extends Component {

    render() {
        const { headState, receivedTime, title } = this.props
        const dataSource = Object.keys(headState).map(key=>({key: key, value:headState[key]}))
        const columns = [
            {
                title: 'Key',
                dataIndex: 'key',
                key: 'key'
            },
            {
                title: 'Value',
                dataIndex: 'value',
                key: 'value',
                render: (text)=>text!==null ? typeof text === 'object' ? JSON.stringify(text, null, 2): text?.toString() : ''
            }]

        return (<Card className="beacon-card" title={title}>
            <p>Server received at: {receivedTime} (in your timezone)</p>
            <Table scroll={{x: true}}
                pagination={false}
                className="table"
                loading={headState == null}
                columns={columns}
                dataSource={dataSource}
                rowKey="key"
            />

        </Card>)
    }
}

BeaconHeadStateDataCard.propTypes = {
    headState: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.string]),
    receivedTime:PropTypes.string,
    title: PropTypes.string,
}

export default (BeaconHeadStateDataCard)
