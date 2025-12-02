import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Badge, Button, Card, Checkbox, message, Space } from 'antd'
import { sortString } from '@/utility/Common'
import { TableTransfer } from '@/components/TreeTransfer'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    allRadars: state.radar.radars || [],
    permissions: state.release.radarPermissions,
    releases: state.release.radarReleases
})

class RadarRelease extends Component{
    constructor(props) {
        super(props)
        this.state = {
            targetKeys: [],
            hideCurrent: false,
            onlineFilter: false,
        }
    }

    componentDidMount() {
        actions.release.getRadarReleasePermission(this.props.match.params.releaseId)
        this.props.allRadars.length===0 && actions.radar.fetchAllRadars()
    }

    componentDidUpdate(prevProps){
        if (prevProps.permissions !== this.props.permissions) {
            const targets = this.props.permissions.map(permission=>permission.product_id)
            const release = this.props.releases?.find(release=>release.id == this.props.match.params.releaseId)
            const model  = release.model
            this.setState({
                targetKeys: targets,
                sourceKeys: this.props.allRadars.filter(radar=>radar.model===model).filter(radar=>!targets.includes(radar.id)).map(radar=>radar.id)
            })
        }
    }

    filterOption = (inputValue, option) => {
        return option.display_name?.toLowerCase().includes(inputValue.toLowerCase()) || option.status?.toLowerCase().includes(inputValue.toLowerCase())
    }

    handleChange = (nextTargetKeys) => {
        this.setState({
            targetKeys: nextTargetKeys,
            sourceKeys: this.props.allRadars.filter(radar=>!nextTargetKeys.includes(radar.id)).map(radar=>radar.id)
        })
    }

    save = () => {
        const {targetKeys, sourceKeys} = this.state
        const originTargetKeys = this.props.permissions.map(permission=>permission.product_id)
        const originSourceKeys = this.props.allRadars.filter(radar=>!originTargetKeys.includes(radar.id)).map(radar=>radar.id)
        const product_ids = targetKeys.filter(key=>!originTargetKeys.includes(key))
        const payload = {product_ids}
        let promises = []
        promises.push(actions.release.radarPermit ({
            releaseId: this.props.match.params.releaseId,
            payload
        }))
        sourceKeys.filter(key=>!originSourceKeys.includes(key)).map(product_id => {
            const permitId = this.props.permissions.find(
                permission => permission.product_id===product_id).id
            promises.push(actions.release.radarUnPermit({
                releaseId: this.props.match.params.releaseId,
                permitId
            }))
        })
        Promise.all(promises).then(()=>message.success('Submitted'))
    }

    render(){
        const {onlineFilter, hideCurrent, targetKeys } = this.state
        const release = this.props.releases?.find(release=>release.id == this.props.match.params.releaseId)

        let dataSource = hideCurrent ? this.props.allRadars.filter(radar=>radar.fw_version!==release.version)
            : this.props.allRadars
        dataSource = dataSource?.map(radar=>({...radar, key: radar.id}))
        dataSource = onlineFilter ? dataSource?.filter(radar=>radar.status === 'ONLINE') : dataSource

        const leftTableColumns = [
            {
                dataIndex: 'display_name',
                title: 'Device name',
                ellipsis: true
            },
            {
                dataIndex: 'fw_version',
                title: 'Device Version',
                sorter: (a, b) => sortString(a,b,'fw_version'),
                defaultSortOrder: 'ascend'
            },
            {
                title: 'Status',
                dataIndex: 'status',
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            },
        ]

        const rightTableColumns = [
            {
                dataIndex: 'display_name',
                title: 'Device name',
                ellipsis: true,
                textWrap: 'word-break',
            },
        ]

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
                title={ `Version: ${release?.version}, Model: ${release?.model}`}
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
                    locale={{ itemUnit: globalConstants.RADAR_GENERIC, itemsUnit: `${globalConstants.RADAR_GENERIC}s`, searchPlaceholder: 'Search name or status here...'}}
                    leftColumns={leftTableColumns}
                    rightColumns={rightTableColumns}
                />
                <Button type="primary" onClick={this.save}>Submit</Button>
            </Card>
        )
    }
}


export default connect(mapStateToProps, null) (RadarRelease)
