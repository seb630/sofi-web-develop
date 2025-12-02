import { Component } from 'react'
import { actions, connect } from 'mirrorx'
import { Badge, Button, Card, Checkbox, message, Space } from 'antd'
import { TableTransfer } from '@/components/TreeTransfer'
import { sortString } from '@/utility/Common'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    allHubs: state.hub.hubs,
    permissions: state.release.permissions,
    releases: state.release.releases
})

class Releases extends Component{
    constructor(props) {
        super(props)
        this.state = {
            targetKeys: [],
            sourceKeys: [],
            hideCurrent: false,
            onlineFilter: false,
        }
    }

    componentDidMount() {
        actions.release.getReleasePermission(this.props.match.params.releaseId)
        this.props.allHubs.length===0 && actions.hub.getHubs()
    }

    componentDidUpdate(prevProps){
        if (prevProps.permissions !== this.props.permissions) {
            const targets = this.props.permissions.map(permission=>permission.hub_id)
            this.setState({
                targetKeys: targets,
                sourceKeys: this.props.allHubs.filter(hub=>!targets.includes(hub.hub_id)).map(hub=>hub.hub_id)
            })
        }
    }

    filterOption = (inputValue, option) => {
        return option.display_name.toLowerCase().includes(inputValue.toLowerCase())
    }

    handleChange = (nextTargetKeys) => {
        this.setState({
            targetKeys: nextTargetKeys,
            sourceKeys: this.props.allHubs.filter(hub=>!nextTargetKeys.includes(hub.hub_id)).map(hub=>hub.hub_id)
        })
    }

    save = () => {
        const {targetKeys, sourceKeys} = this.state
        const originTargetKeys = this.props.permissions.map(permission=>permission.hub_id)
        const originSourceKeys = this.props.allHubs.filter(hub=>!originTargetKeys.includes(hub.hub_id)).map(hub=>hub.hub_id)

        const update_permission_list = targetKeys.filter(key=>!originTargetKeys.includes(key)).map(hub_id=>({hub_id}))
        const payload = {update_permission_list}
        let promises = []
        promises.push(actions.release.permit ({
            releaseId: this.props.match.params.releaseId,
            payload
        }))
        sourceKeys.filter(key=>!originSourceKeys.includes(key)).map(hub_id => {
            const permitId = this.props.permissions.find(
                permission => permission.hub_id===hub_id).hub_update_permission_id
            promises.push(actions.release.unPermit({
                releaseId: this.props.match.params.releaseId,
                permitId
            }))
        })
        Promise.all(promises).then(()=>message.success('Submitted'))
    }

    render(){
        const {onlineFilter, hideCurrent, targetKeys } = this.state
        const release = this.props.releases && this.props.releases.find(release=>release.release_id == this.props.match.params.releaseId)

        let dataSource = hideCurrent ? this.props.allHubs.filter(hub=>hub.hub_app_version!=release.version) : this.props.allHubs
        dataSource = dataSource.map(hub=>{
            return {...hub, key: hub.hub_id}
        })

        dataSource = onlineFilter ? dataSource?.filter(hub=>hub.connectivity_state === 'ONLINE') : dataSource

        const leftTableColumns = [
            {
                dataIndex: 'display_name',
                title: 'Device name',
                ellipsis: true
            },
            {
                dataIndex: 'hub_app_version',
                title: 'Device Version',
                sorter: (a, b) => sortString(a,b,'hub_app_version'),
                defaultSortOrder: 'ascend'
            },
            {
                title: 'Status',
                dataIndex: 'connectivity_state',
                render(val) {
                    return <Badge status={val==='ONLINE'?'success':'error'} text={val} />
                },
            }
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
                title={ `Version: ${release&&release.version}`}
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
                    locale={{ itemUnit: globalConstants.HUB_GENERIC, itemsUnit: `${globalConstants.HUB_GENERIC}s`}}
                    leftColumns={leftTableColumns}
                    rightColumns={rightTableColumns}
                />
                <Button type="primary" onClick={this.save}>Submit</Button>
            </Card>
        )
    }
}


export default connect(mapStateToProps, null) (Releases)
