import { Fragment } from 'react'
import { Col, Row, Table, Tooltip } from 'antd'
import PropTypes from 'prop-types'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { globalConstants } from '@/_constants'
import { titleCase } from 'change-case'

const PreviewTable = (props) => {
    const {dataSource} = props
    const columns = [
        {
            title: 'Name Prefix',
            dataIndex: 'Name Prefix',
        },
        {
            title: 'IMEI',
            dataIndex: 'IMEI',
            key: 'IMEI'
        },
        {
            title: `${titleCase(globalConstants.PENDANT_GENERIC)} Name`,
            dataIndex: 'Beacon Name',
            render: (text,record) => text && text!=='' && text?.trim()!=='' ? text :
                <span>{record['Name Prefix']} {record.IMEI}<Tooltip title={`You’ve not specified a name for the ${globalConstants.PENDANT_GENERIC} in your spreadsheet so we will use the default format to create a ${globalConstants.PENDANT_GENERIC} display name`}>
                    <QuestionCircleOutlined className="sensorInfoIcon" />
                </Tooltip></span>
        },
        {
            title: 'Error',
            dataIndex: 'error',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.error.localeCompare(b.error),
            render: text=> <span className="dangerTitle">{text}</span>
        },
        {
            title: 'Phone',
            dataIndex: 'Phone',
        },
        {
            title: 'Model Number',
            dataIndex: 'Model Number',
        },
        {
            title: 'APN',
            dataIndex: 'APN',
        },
        {
            title: 'OOBE',
            dataIndex: 'OOBE',
        },
        {
            title: 'Subscription State',
            dataIndex: 'Subscription State',
        },
        {
            title: 'Timezone',
            dataIndex: 'Timezone',
        }
    ]
    return (<Fragment>
        <Row type="flex" justify="center">
            <Col span={22}>
                <Table scroll={{x: true}}
                    dataSource={dataSource}
                    columns={columns}
                    size="small"
                    rowKey="IMEI"
                    pagination={{pageSize:5}}
                />
            </Col>
        </Row>
    </Fragment>
    )
}

PreviewTable.propTypes={
    dataSource: PropTypes.array,
}

export default PreviewTable
