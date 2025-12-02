import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { Card, Divider, message, Popconfirm, Row, Select, Table, Tooltip } from 'antd'
import { sortString } from '@/utility/Common'
import FeatureActions from './FeatureAction'
import { globalConstants } from '@/_constants'

const mapStateToProps = state => ({
    portalFunctions: state.common.portalFunctions,
    orgs: state.organisation.orgs,
    hubs: state.hub.hubs,
    beacons: state.sofiBeacon.beacons.beacons
})

class HiddenFeatures extends Component{
    constructor(props) {
        super(props)
        this.state = {
            modal: false,
            selectedFeature: null,
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

    remove = (record) => {
        actions.common.deletePortalFunction({feature: this.state.selectedFeature,ruleId: record.rule_id}).then(()=>{
            message.success('Deleted')
        }, (error) => {
            message.error(globalConstants.WENT_WRONG + '(' + error.response.data.message+')')
        })
    }

    selectFeature = (feature) => {
        this.setState({selectedFeature: feature})
        actions.common.fetchPortalFunctions(feature)
    }

    renderTitle = () =>{
        const options = Object.keys(globalConstants.PORTAL_FUNCTIONS).map(key=>
            <Select.Option key={key} value={key}>{key}</Select.Option>)
        return <span>Select a Feature: <Select
            dropdownMatchSelectWidth={false}
            onSelect={(value)=>this.selectFeature(value)}
        >
            {options}
        </Select></span>
    }

    render(){
        const { portalFunctions } = this.props
        const { selectedFeature } = this.state
        const columns = [
            {
                title: 'Feature',
                dataIndex: 'function',
                key: 'function',
                sorter: (a, b) => sortString(a,b,'function'),
            },
            {
                title: 'Rule Action',
                dataIndex: 'rule_action',
            },
            {
                title: 'Rule Scope',
                dataIndex: 'rule_scope',
            },
            {
                title: 'Organisation ID',
                dataIndex: 'organization_id',
            },
            {
                title: 'Product ID',
                dataIndex: 'product_id',
            },
            {
                title: 'Product Type',
                dataIndex: 'product_type',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, record) =>
                    <div>
                        <FeatureActions.UpdateFeatureModal selectedFeature={selectedFeature} model={record} {...this.props}/>
                        <Divider type="vertical"/>
                        <Popconfirm
                            title="Are you sure remove this feature rule?"
                            onConfirm={()=>this.remove(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <a><Tooltip title="remove this feature">Remove</Tooltip></a>
                        </Popconfirm>
                    </div>
            }
        ]
        return (
            <Card title={this.renderTitle()}>
                {selectedFeature &&
                    <Fragment>
                        <Table scroll={{x: true}} className="table margin-bottom" loading={portalFunctions == null}
                            dataSource={portalFunctions}
                            columns={columns}
                            rowKey="rule_id"
                        />
                        <Row>
                            <FeatureActions.CreateFeatureModal {...this.props} selectedFeature={selectedFeature}/>
                        </Row>
                    </Fragment>
                }
            </Card>
        )
    }
}


export default connect(mapStateToProps, null) (HiddenFeatures)
