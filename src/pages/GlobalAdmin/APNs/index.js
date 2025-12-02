import { Component, Fragment } from 'react'
import { connect } from 'mirrorx'
import { sortString } from '@/utility/Common'
import { Col, Input, Row, Table } from 'antd'
import APNActions from './ApnAction'
import { isMobile } from 'react-device-detect'

const mapStateToProps = state => ({
    adminAPN: state.APN.adminAPN && state.APN.adminAPN.reverse(),
    admin: state.user.me?.authorities.some(role=>role.includes('ADMIN')),
    allOrgs: state.organisation.orgs
})

class AdminAPNs extends Component {
    constructor(props) {
        super(props)

        this.state = {
            search: '',
            listAPNs: props.adminAPN
        }
    }

    /** component did update*/
    componentDidUpdate(prevProps) {
        prevProps.adminAPN !== this.props.adminAPN && this.setState({
            listAPNs: this.props.adminAPN })
    }

    /** handle search */
    handleSearch = (value) => {
        const { adminAPN } = this.props
        if (value === '' ){
            this.setState ({ search:'', listAPNs: adminAPN})
        }else{
            this.setState({ search: value,listAPNs: adminAPN.filter(
                record => record.id.toString().toLowerCase().includes(value.toLowerCase()) ||
                    record.apn_name.toLowerCase().includes(value.toLowerCase())
            )})
        }
    }

    renderHeader = () => {
        const { allOrgs, admin } = this.props
        return (
            <Fragment><Row type="flex" gutter={15} align="middle" className="margin-bottom">
                <Col>
                    <Input.Search
                        placeholder="Search here ..."
                        onSearch={value => this.handleSearch(value)}
                        enterButton
                        autoFocus = {!isMobile}
                    />

                </Col>
            </Row>
            <Row>
                <APNActions.CreateAPNModal admin={admin} orgs={allOrgs}/>
            </Row>
            </Fragment>)
    }

    render() {
        const { listAPNs } = this.state
        const { allOrgs, admin } = this.props
        const columns = [
            {
                title: 'APN Name',
                dataIndex: 'apn_name',
                key: 'apn_name',
                sorter: (a, b) => sortString(a,b,'apn_name'),
            },
            {
                title: 'APN Value',
                dataIndex: 'apn_value',
                key: 'apn_value',
            },
            {
                title: 'Organisation Name',
                dataIndex: 'organization_name',
                sorter: (a, b) => sortString(a,b,'organization_name'),
            },
            {
                title: 'Archived',
                dataIndex: 'apn_archived',
                key: 'apn_archived',
                filters: [
                    {
                        text: 'Yes',
                        value: true,
                    },
                    {
                        text: 'No',
                        value: false,
                    },
                ],
                onFilter: (value, record) => `${record.apn_archived}` === `${value}` ,
                render: (value) => value ? 'Yes' : 'No'
            },
            {
                title: 'Action',
                dataIndex: '',
                key: 'x',
                render: (record) => <APNActions.UpdateAPNModal model={record} admin={admin} orgs={allOrgs}/>
            }
        ]
        return (<Table scroll={{x: true}} className="table" loading={listAPNs === null} columns={columns}
            dataSource={listAPNs}
            rowKey="id"
            title={this.renderHeader} />)
    }
}

export default connect(mapStateToProps,{})(AdminAPNs)
