import { Component, Fragment } from 'react'
import { actions } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { Popconfirm, Table, Tooltip, Typography } from 'antd'
import PropTypes from 'prop-types'
import Media from 'react-media'

const {Paragraph, Text} = Typography


class BeaconCarers extends Component {

    /** disassociate user */
    disassociate = async (user) => {

        const { beacon } = this.props
        await actions.sofiBeacon.disassociateBeaconUser({ userId: user.user_id ,
            beaconId: beacon.id, beaconPubId: beacon.pub_id })
    }

    render() {
        const { users } = this.props
        const columns = [
            {
                title: 'ID',
                dataIndex: 'user_id',
                key: 'user_id',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.user_id - b.user_id,
            },
            {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
                sorter: (a, b) => a.username.localeCompare(b.username),
            },
            {
                title: 'First Name',
                dataIndex: 'first_name',
                key: 'first_name',
                sorter: (a, b) => a.first_name.localeCompare(b.first_name),
            },
            {
                title: 'Last Name',
                dataIndex: 'last_name',
                key: 'last_name',
                sorter: (a, b) => a.last_name.localeCompare(b.last_name),
            },
            {
                title: 'Mobile',
                dataIndex: 'mobile',
                key: 'mobile',
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, user) => (
                    <Popconfirm
                        title="Are you sure disassociate this user?"
                        onConfirm={()=>this.disassociate(user)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a className="test-button-disconnect">
                            <Media query='(max-width:599px)'>
                                { matches => matches ? (
                                    <DeleteOutlined />
                                ) : (
                                    <Tooltip title="Disassociate this user"><DeleteOutlined /></Tooltip>
                                ) }
                            </Media>
                        </a>
                    </Popconfirm>
                ),
            },
        ]

        return (
            <Fragment>
                <Paragraph>
                    <Text strong>Note:</Text> A carer is someone who can access the portal. By default a carer is not listed as an emergency contact.
                    You can add new people as emergency contacts <a onClick={()=>this.props?.onTabChanged('general', 'ec')}>here</a>.
                </Paragraph>
                <Table
                    scroll={{x: true}}
                    className="margin-bottom"
                    loading={users == null}
                    columns={columns}
                    dataSource={users}
                    rowKey="user_id"/>
            </Fragment>

        )
    }
}

BeaconCarers.propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({
        user_id: PropTypes.number,
        username: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        mobile: PropTypes.string
    })),
    beacon: PropTypes.shape({
        beacon_id: PropTypes.number
    }),
}

export default BeaconCarers
