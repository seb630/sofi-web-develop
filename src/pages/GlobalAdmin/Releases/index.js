import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Table } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import Upload from './upload'

const mapStateToProps = state => ({
    releases: state.release.releases
})

class Releases extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
        }
    }

    handleClose = () => {
        this.setState({ modal: false })
    }

    handleOpen = () => {
        this.setState({modal: true})
    }

    saveFormRef = (formRef) => {
        this.formRef = formRef
    }

    render(){
        const { releases } = this.props
        const columns = [
            {
                title: 'Version',
                dataIndex: 'version',
                key: 'version',
                sorter: (a, b) => sortString(a,b,'version'),
                render: (text,record) => <div>{text}  ({record.release_tag})</div>
            },
            {
                title: 'Type',
                dataIndex: 'service_type',
                key: 'service_type',
                sorter: (a, b) => sortString(a,b,'service_type'),
            },
            {
                title: 'Released',
                dataIndex: 'released_at',
                key: 'released_at',
                defaultSortOrder: 'descend',
                sorter: (a, b) => sortDateTime(a.released_at,b.released_at),
                render: (text) => text && moment(text)
                    .format(globalConstants.LONGDATETIME_FORMAT),
            },
            {
                title: 'Hubs',
                dataIndex: 'released_at',
                key: 'hubs',
                render: () => 'Unknown',
            }
        ]
        return (
            <Fragment>
                <Table scroll={{x: true}} className="table" loading={releases == null}
                    dataSource={releases}
                    columns={columns}
                    rowKey="release_id"
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                actions.routing.push(`/globalAdmin/release/${record.release_id}`)
                            }
                        }
                    }}
                    title={() =>  <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Upload Release</Button>}
                />
                <Upload
                    open = {this.state.modal}
                    onCancel={this.handleClose}
                    wrappedComponentRef={this.saveFormRef}
                />
            </Fragment>
        )
    }
}


export default connect(mapStateToProps, null) (Releases)
