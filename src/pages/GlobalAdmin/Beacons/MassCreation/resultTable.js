import { Fragment } from 'react'
import { Col, Row, Table, Typography } from 'antd'
import PropTypes from 'prop-types'
import { CSVDownloader } from 'react-papaparse'
import { titleCase } from 'change-case'
import { globalConstants } from '@/_constants'

const ResultTable = (props) => {
    const {dataSource, success, total} = props
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
        <Typography.Paragraph>There are {total} records, {success} of them success, rests failed, please review the table below and edit the error fields.</Typography.Paragraph>
        {dataSource.length>0 && <Fragment>
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
            <Row>
                <CSVDownloader
                    data={dataSource}
                    filename={'ErrorRecords'}
                    type={'link'}
                >
                Download Error Records
                </CSVDownloader>
            </Row>
        </Fragment>}
    </Fragment>
    )
}

ResultTable.propTypes={
    dataSource: PropTypes.array,
    total: PropTypes.number,
    success: PropTypes.number
}

export default ResultTable
