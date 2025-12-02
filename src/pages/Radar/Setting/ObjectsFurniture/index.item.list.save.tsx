import {Button, Col, Row} from 'antd'
import {MouseEventHandler} from 'react'

interface ItemListSaveProps{
    onSave: MouseEventHandler<HTMLElement>;
    onCancel: MouseEventHandler<HTMLElement>;
}

const ItemListSave = ({
    onSave,
    onCancel}:ItemListSaveProps) => {

    return(
        <Row gutter={[5, 5]}>
            <Col>
                <Button type='primary'
                    onClick={onCancel}>Cancel</Button>
            </Col>
            <Col>
                <Button type='primary'
                    onClick={onSave}>Save</Button>
            </Col>
        </Row>
    )
}

export default ItemListSave
