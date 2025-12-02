import { Component } from 'react'
import { actions } from 'mirrorx'
import { DeleteOutlined } from '@ant-design/icons'
import { Table, Popconfirm, Tooltip, message } from 'antd'
import PropTypes from 'prop-types'
import Media from 'react-media'
import EditNotification from './Modal'

class RadarUsers extends Component {

    disassociate = (user) => {
        const payload = {
            user_id: user.user_id,
            product_id: this.props.selectedRadar.id
        }
        actions.radar.disassociateRadar(payload).then(()=>{
            message.success('disassociated')
            actions.radar.fetchRadarUsers(this.props.selectedRadar.id)
        })
    }

    render() {
        const { radarUsers, selectedRadar, me } = this.props
        const columns = [
            {
                title: 'ID',
                dataIndex: ['flat_user','user_id'],
                key: 'user_id',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.flat_user.user_id - b.flat_user.user_id,
            },
            {
                title: 'Username',
                dataIndex: ['flat_user','username'],
                key: 'username',
                sorter: (a, b) => a.flat_user.username.localeCompare(b.flat_user.username),
            },
            {
                title: 'First Name',
                dataIndex: ['flat_user','first_name'],
                key: 'first_name',
                sorter: (a, b) => a.flat_user.first_name.localeCompare(b.flat_user.first_name),
            },
            {
                title: 'Last Name',
                dataIndex: ['flat_user','last_name'],
                key: 'last_name',
                sorter: (a, b) => a.flat_user.last_name.localeCompare(b.flat_user.last_name),
            },
            {
                title: 'Mobile',
                dataIndex: ['flat_user','mobile'],
                key: 'mobile',
            },
            {
                title: 'Notifications',
                key: 'notification',
                render: (text, user) => (
                    <EditNotification
                        me={me}
                        radarUser = {user}
                        userId={user.flat_user.user_id}
                        radarId={selectedRadar.id}
                    />
                )
            },
            {
                title: 'Action',
                key: 'action',
                render: (text, user) => (
                    <Popconfirm
                        title="Are you sure disassociate this user?"
                        onConfirm={()=>this.disassociate(user.flat_user)}
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
            <Table
                scroll={{x: true}}
                className="margin-bottom"
                loading={radarUsers == null} columns={columns}
                dataSource={radarUsers}
                rowKey={record => record.flat_user.user_id}
            />
        )
    }
}

RadarUsers.propTypes = {
    radarUsers: PropTypes.arrayOf(PropTypes.shape({
        user_id: PropTypes.number,
        username: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        mobile: PropTypes.string
    })),
    selectedRadar: PropTypes.shape({
        id: PropTypes.number
    }),
}

export default RadarUsers
