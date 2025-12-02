import { Component, Fragment } from 'react'
import { actions, connect } from 'mirrorx'
import { sortDateTime, sortString } from '@/utility/Common'
import { Col, Input, Row, Table } from 'antd'
import moment from 'moment'
import { globalConstants } from '@/_constants'
import { isMobile } from 'react-device-detect'
import { titleCase } from 'change-case'

const mapStateToProps = state => ({
    allSubscriptions: state.billing.allSubscriptions,
    hubs: state.hub.hubs,
    beacons: state.sofiBeacon.allBeacons
})

class SubscriptionTable extends Component {
    constructor(props) {
        super(props)

        this.state = {
            search: '',
            listSubscriptions: props.allSubscriptions
        }
    }

    /** component did update*/
    componentDidUpdate(prevProps) {
        prevProps.allSubscriptions !== this.props.allSubscriptions && this.setState({
            listSubscriptions: this.props.allSubscriptions })
    }

    /** handle search */
    handleSearch = (value) => {
        const { allSubscriptions } = this.props
        if (value === '' ){
            this.setState ({ search:'', listSubscriptions: allSubscriptions})
        }else{
            this.setState({ search: value,listSubscriptions: allSubscriptions.filter(
                record => record.product_id.toLowerCase().includes(value.toLowerCase()) ||
                    record.display_name.toLowerCase().includes(value.toLowerCase()) ||
                    record.email && record.email.toLowerCase().includes(value.toLowerCase())
            )})
        }
    }

    renderHeader = () => {
        return (<Fragment>
            <Row align="middle" className="margin-bottom">
                <Col>
                    <Input.Search
                        placeholder="Search here ..."
                        onSearch={value => this.handleSearch(value)}
                        enterButton
                        autoFocus = {!isMobile}
                    />

                </Col>
            </Row>
        </Fragment>
        )
    }

    navigateDevice = (subscription, route) => {
        const isHub = subscription.product_type==='HUB'
        if (isHub){
            const hub = this.props.hubs.find(hub=>hub.hub_id === subscription.product_id)
            actions.hub.selectHub(hub)
            actions.common.save({adminPortal: false})
            actions.routing.push(`/${route}`)
        }else {
            const beacon = this.props.beacons.find(beacon=>beacon.pub_id === subscription.product_id)
            actions.sofiBeacon.selectBeacon(beacon).then(()=>{
                actions.common.save({adminPortal: false})
                actions.routing.push(`/beacon/${route}`)
            })
        }
    }

    render() {
        const { listSubscriptions } = this.state
        const columns = [
            {
                title: 'Product ID',
                dataIndex: 'product_id',
                key: 'product_id',
            },
            {
                title: 'Product',
                dataIndex: 'product_type',
                key: 'product_type',
                filters: [
                    {
                        text: titleCase(globalConstants.PENDANT_GENERIC),
                        value: 'BEACON',
                    },
                    {
                        text: titleCase(globalConstants.HUB_GENERIC),
                        value: 'HUB',
                    },
                    {
                        text: titleCase(globalConstants.RADAR_GENERIC),
                        value: 'RADAR',
                    },
                ],
                onFilter: (value, record) => record.product_type === value ,
            },
            {
                title: 'Product Name',
                dataIndex: 'display_name',
                key: 'display_name',
                sorter: (a, b) => sortString(a,b,'display_name'),
            },
            {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
            },
            {
                title: 'Price',
                dataIndex: 'price',
                key: 'price',
            },
            {
                title: 'Currency',
                dataIndex: 'currency',
                key: 'currency',
            },
            {
                title: 'Subscription Status',
                dataIndex: 'subscription_status',
                key: 'subscription_status',
                filters: [
                    {
                        text: 'Active',
                        value: 'ACTIVE',
                    },
                    {
                        text: 'Payment Required',
                        value: 'require',
                        children: [
                            {
                                text: 'cancelled',
                                value: 'CANCELED',
                            },
                            {
                                text: 'Incomplete',
                                value: 'INCOMPLETE',
                            },
                            {
                                text: 'Incomplete_expired',
                                value: 'INCOMPLETE_EXPIRED',
                            },
                            {
                                text: 'Past due',
                                value: 'PAST_DUE',
                            },
                            {
                                text: 'Unpaid',
                                value: 'UNPAID',
                            }
                        ]
                    },
                    {
                        text: 'No Payment Required',
                        value: 'notRequired',
                        children: [
                            {
                                text: 'Third party billing',
                                value: 'THIRD_PARTY_BILLING',
                            },
                            {
                                text: 'Manual',
                                value: 'MANUAL',
                            },
                            {
                                text: 'Grace period',
                                value: 'GRACE_PERIOD',
                            },
                            {
                                text: 'Loan period',
                                value: '"LOAN_PERIOD"',
                            },
                            {
                                text: 'Free',
                                value: 'FREE',
                            },
                            {
                                text: 'Contract',
                                value: '"CONTRACT"',
                            }
                        ]
                    },
                ],
                onFilter: (value, record) => {
                    return record.subscription_status === value
                },
            },
            {
                title: 'Period End',
                dataIndex: 'period_end',
                key: 'period_end',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => sortDateTime(a.period_end, b.period_end),
                render: (text) => text && moment(text).format(globalConstants.DATE_FORMAT)
            },

        ]
        return (
            <Table scroll={{x: true}}
                loading={listSubscriptions === null}
                columns={columns}
                dataSource={listSubscriptions}
                rowKey="product_id"
                title={this.renderHeader}
                onRow={(record) => {
                    return {
                        onClick: () => this.navigateDevice(record, 'settings/subscription')
                    }
                }}
            />)
    }
}

export default connect(mapStateToProps,{})(SubscriptionTable)
