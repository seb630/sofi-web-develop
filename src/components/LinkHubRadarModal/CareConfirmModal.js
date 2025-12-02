import { Divider, Modal, Table } from 'antd'
import { globalConstants } from '@/_constants'

const careConfirmModal = (linkRadarToHub, handleSubmit, handleCancel, userAddToRadar, userAddToHub) => {
    const columns = [{
        title: 'First Name',
        dataIndex: 'first_name',
        key: 'first_name',
    },
    {
        title: 'Last Name',
        dataIndex: 'last_name',
        key: 'last_name',

    },
    {
        title: 'Mobile',
        dataIndex: 'mobile',
        key: 'mobile',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    }]

    return Modal.confirm({
        width: 600,
        content: <div>
            <div>By linking these two devices together this means the {globalConstants.HUB_SOFIHUB} will have the following carers added: </div>
            <Table
                size="small"
                columns={columns}
                dataSource={userAddToHub}
                rowKey="user_id"
                pagination={false}
            />
            <Divider/>
            <div>Additionally this means the {globalConstants.RADAR_HOBA} will have the following carers added: </div>
            <Table
                size="small"
                columns={columns}
                dataSource={userAddToRadar}
                rowKey="user_id"
                pagination={false}
            />
            <div>Are you sure you want to link your {linkRadarToHub? globalConstants.RADAR_HOBA : globalConstants.HUB_SOFIHUB} to {
                linkRadarToHub? globalConstants.HUB_SOFIHUB : globalConstants.RADAR_HOBA} and also add these carers to each device?</div>
        </div>,
        okText: 'Link',
        onOk: handleSubmit,
        onCancel: handleCancel
    })
}

export default careConfirmModal
