import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Table } from 'antd'
import { sortDateTime, sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'
import moment from 'moment'
import Upload from './upload'

const mapStateToProps = state => ({
    releases: state.release.beaconReleases,
    beaconModels: state.sofiBeacon.beaconModels
})

class BeaconReleases extends Component{
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
                title: 'Model',
                dataIndex: 'model',
                key: 'model',
                sorter: (a, b) => sortString(a,b,'model'),
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
        ]
        return (
            <Fragment>
                <Table scroll={{x: true}} className="table" loading={releases == null}
                    dataSource={releases}
                    columns={columns}
                    rowKey="id"
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                actions.routing.push(`/globalAdmin/brelease/${record.id}`)
                            }
                        }
                    }}
                    title={() =>  <Button type="primary" size="large" icon={<PlusOutlined />} onClick={this.handleOpen}>Upload Release</Button>}
                />
                <Upload
                    beaconModels = {this.props.beaconModels}
                    open = {this.state.modal}
                    onCancel={this.handleClose}
                    wrappedComponentRef={this.saveFormRef}
                />
            </Fragment>
        )
    }
}


export default connect(mapStateToProps, null) (BeaconReleases)
