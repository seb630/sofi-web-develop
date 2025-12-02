import {Button, Col, Row} from 'antd'
import {ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'
import {PlusOutlined} from '@ant-design/icons'

const ItemListAdd = ({onAdd}:{onAdd: Function}) => {
    return(
        <Row gutter={[5, 5]}>
            <Col>
                <Button
                    type='primary'
                    key='addDoor'
                    icon={<PlusOutlined/>}
                    onClick={() =>
                        onAdd(ItemTypeEnum.DOOR)
                    }>Door
                </Button>
            </Col>
            <Col>
                <Button
                    type='primary'
                    key='addWindow'
                    icon={<PlusOutlined/>}
                    onClick={() => onAdd(ItemTypeEnum.WINDOW)}>
                    Window
                </Button>
            </Col>
            <Col>
                <Button
                    type='primary'
                    key='addBed'
                    icon={<PlusOutlined/>}
                    onClick={() => onAdd(ItemTypeEnum.BED)}>
                    Bed
                </Button>
            </Col>
        </Row>
    )
}

export default ItemListAdd
