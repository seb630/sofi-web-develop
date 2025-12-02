import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Badge, Button, Card, Checkbox, message, Space } from 'antd'
import { sortString } from '@/utility/Common'
import { TableTransfer } from '@/components/TreeTransfer'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    allBeacons: state.sofiBeacon.allBeacons || [],
    permissions: state.release.beaconPermissions,
    releases: state.release.beaconReleases
})

class BeaconRelease extends Component{
    constructor(props) {
        super(props)
        this.state = {
            targetKeys: [],
            hideCurrent: false,
            onlineFilter: false,
        }
    }

    componentDidMount() {
        actions.release.getBeaconReleasePermission(this.props.match.params.releaseId)
        this.props.allBeacons.length===0 && actions.sofiBeacon.fetchAllBeacons()
    }

    componentDidUpdate(prevProps){
        if (prevProps.permissions !== this.props.permissions) {
            const targets = this.props.permissions.map(permission=>permission.beacon_id)
            const release = this.props.releases?.find(release=>release.id == this.props.match.params.releaseId)
            const model  = release.model
            this.setState({
                targetKeys: targets,
                sourceKeys: this.props.allBeacons.filter(beacon=>beacon.model===model).filter(beacon=>!targets.includes(beacon.id)).map(beacon=>beacon.id)
            })
        }
    }

    filterOption = (inputValue, option) => {
        return option.display_name?.toLowerCase().includes(inputValue.toLowerCase()) || option.beacon_status?.toLowerCase().includes(inputValue.toLowerCase())
    }

    handleChange = (nextTargetKeys) => {
        this.setState({
            targetKeys: nextTargetKeys,
            sourceKeys: this.props.allBeacons.filter(beacon=>!nextTargetKeys.includes(beacon.id)).map(beacon=>beacon.id)
        })
    }

    save = () => {
        const {targetKeys, sourceKeys} = this.state
        const originTargetKeys = this.props.permissions.map(permission=>permission.beacon_id)
        const originSourceKeys = this.props.allBeacons.filter(beacon=>!originTargetKeys.includes(beacon.id)).map(beacon=>beacon.id)
        const beacon_ids = targetKeys.filter(key=>!originTargetKeys.includes(key))
        const payload = {beacon_ids}
        let promises = []
        promises.push(actions.release.beaconPermit ({
            releaseId: this.props.match.params.releaseId,
            payload
        }))
        sourceKeys.filter(key=>!originSourceKeys.includes(key)).map(beacon_id => {
            const permitId = this.props.permissions.find(
                permission => permission.beacon_id===beacon_id).id
            promises.push(actions.release.beaconUnPermit({
                releaseId: this.props.match.params.releaseId,
                permitId
            }))
        })
        Promise.all(promises).then(()=>message.success('Submitted'))
    }

    render(){
        const {onlineFilter, hideCurrent, targetKeys } = this.state
        const release = this.props.releases?.find(release=>release.id == this.props.match.params.releaseId)
        const model  = release.model
        console.log(release)

        let dataSource = hideCurrent ? this.props.allBeacons.filter(beacon=>beacon.version!=release.version)
            : this.props.allBeacons
        dataSource = dataSource.filter(beacon=>beacon.model===model).map(beacon=>{
            return {...beacon, key: beacon.id}
        })

        dataSource = onlineFilter ? dataSource?.filter(beacon=>beacon.beacon_status === 'ONLINE') : dataSource

        var leftTableColumns = []
        if (release?.model === 'EV04') {
            leftTableColumns = [
                {
                    dataIndex: 'display_name',
                    title: 'Device name',
                    ellipsis: true
                },
                {
                    dataIndex: 'version',
                    title: 'Device Version',
                    sorter: (a, b) => sortString(a,b,'version'),
                    defaultSortOrder: 'ascend'
                },
                {
                    dataIndex: 'firmware_version',
                    title: 'Firmware Version',
                    sorter: (a, b) => sortString(a,b,'firmware_version'),
                    defaultSortOrder: 'ascend'
                },
                {
                    title: 'Status',
                    dataIndex: 'beacon_status',
                    render(val) {
                        return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                    },
                },
            ]
        } else {
            leftTableColumns = [
                {
                    dataIndex: 'display_name',
                    title: 'Device name',
                    ellipsis: true
                },
                {
                    dataIndex: 'version',
                    title: 'Device Version',
                    sorter: (a, b) => sortString(a,b,'version'),
                    defaultSortOrder: 'ascend'
                },
                {
                    title: 'Status',
                    dataIndex: 'beacon_status',
                    render(val) {
                        return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                    },
                },
            ]
        }       

        var rightTableColumns = []
        if (release?.model === 'EV04') {
            rightTableColumns = [
                {
                    dataIndex: 'display_name',
                    title: 'Device name',
                    ellipsis: true,
                    textWrap: 'word-break',
                },
                {
                    dataIndex: 'firmware_version',
                    title: 'Firmware Version',
                    ellipsis: true,
                    textWrap: 'word-break',
                },
            ]
        } else {
            rightTableColumns = [
                {
                    dataIndex: 'display_name',
                    title: 'Device name',
                    ellipsis: true,
                    textWrap: 'word-break',
                },
            ]
        }
        

        const leftTitle = <Space>
            <Checkbox
                checked={onlineFilter}
                onChange={e=>this.setState({onlineFilter: e.target.checked})}
                className="margin-right"
            >Online</Checkbox>

            <Checkbox
                checked={hideCurrent}
                onChange={e=>this.setState({hideCurrent: e.target.checked})}
                className="margin-right"
            >Hide this version</Checkbox>
            <span>Not Permitted</span>
        </Space>

        return (
            <Card
                title={ `Version: ${release?.version}, ${release?.model === 'EV04' ? `Name: ${release?.release_tag}, ` : ''} Model: ${release?.model}`}
                extra={<a onClick={()=>actions.routing.goBack()}>Back</a>}
            >

                <TableTransfer
                    listStyle={({direction})=>direction==='left' ? {width: 480, minWidth: 200} :{width: 280, minWidth: 100}}
                    dataSource={dataSource}
                    showSearch
                    targetKeys={targetKeys}
                    onChange={this.handleChange}
                    className="margin-bottom"
                    filterOption={this.filterOption}
                    operations={['Permit', 'UnPermit']}
                    titles={[leftTitle, 'Permitted']}
                    locale={{ itemUnit: globalConstants.PENDANT_GENERIC, itemsUnit: `${globalConstants.PENDANT_GENERIC}s`, searchPlaceholder: 'Search name or status here...'}}
                    leftColumns={leftTableColumns}
                    rightColumns={rightTableColumns}
                />
                <Button type="primary" onClick={this.save}>Submit</Button>
            </Card>
        )
    }
}


export default connect(mapStateToProps, null) (BeaconRelease)
