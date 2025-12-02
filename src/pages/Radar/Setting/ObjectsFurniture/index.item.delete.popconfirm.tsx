import {Button, Popconfirm} from 'antd'
import {DeleteOutlined} from '@ant-design/icons'
import {ItemModel} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'

interface ItemDeleteProps {
    item: ItemModel;
    onDeleteConfirm: Function;
}

const ItemDeletePopConfirm = ({
    item,
    onDeleteConfirm,
}: ItemDeleteProps) => {

    const handleOnDeleteConfirm = (id: number,
        name: string) => {
        onDeleteConfirm(id, name)
    }

    return (
        <Popconfirm
            key='delete-confirm'
            title={`Are you sure to delete ${item.name} ?`}
            onConfirm={(event) => {
                event?.stopPropagation()
                handleOnDeleteConfirm(item.id, item.name)
            }}
            onCancel={(event)=> {
                event?.stopPropagation()
            }}
            okText="Yes"
            cancelText="No"
        >
            <Button key="list-delete"
                onClick={(event) => {
                    event.stopPropagation()
                }}
                icon={<DeleteOutlined/>}
            />

        </Popconfirm>
    )
}

export default ItemDeletePopConfirm
