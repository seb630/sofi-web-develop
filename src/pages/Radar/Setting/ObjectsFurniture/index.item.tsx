import {Col, List, message, Row} from 'antd'
import {CaretRightOutlined} from '@ant-design/icons'
import {useState} from 'react'
import {ItemModel} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'
import ItemDeletePopConfirm from '@/pages/Radar/Setting/ObjectsFurniture/index.item.delete.popconfirm'

interface ItemProps {
    item: ItemModel;
    onSelect: Function;
    onMouseEnter: Function;
    onMouseLeave: Function;
    onDelete: Function;
}

const Item = ({
    item,
    onSelect,
    onMouseEnter,
    onMouseLeave,
    onDelete
}: ItemProps) => {

    const [itemMouseOverId, setItemMouseOverId] = useState<number | null>()

    const handleOnMouseEnter = (id: number) => {
        setItemMouseOverId(id)
        onMouseEnter(id)
    }

    const handleOnMouseLeave = (id: number) => {
        setItemMouseOverId(null)
        onMouseLeave(id)
    }

    const handleOnDeleteConfirm = (id: number, name: string) => {
        message.success(`${name} was deleted`)
        onDelete(id)
    }

    return (
        <List.Item
            actions={[<a key='list-item-edit'>Edit</a>,
                <ItemDeletePopConfirm
                    key='list-item-delete'
                    item={item}
                    onDeleteConfirm={handleOnDeleteConfirm}/>]
            }
            onMouseEnter={() => handleOnMouseEnter(item.id)}
            onMouseLeave={() => handleOnMouseLeave(item.id)}
            onClick={() => {
                onSelect({...item})
            }}
            style={{
                fontWeight: itemMouseOverId ? 'bold' : 'normal',
                cursor: itemMouseOverId ? 'pointer' : 'none'
            }}
        >
            <Row gutter={20}>
                <Col>
                    {itemMouseOverId === item.id ?
                        <CaretRightOutlined/> : <CaretRightOutlined style={{color: 'white'}}/>
                    }
                </Col>
                <Col>
                    <div>{item.name}</div>
                </Col>
                <Col>
                    <div>{item.type}</div>
                </Col>
            </Row>
        </List.Item>
    )
}

export default Item
