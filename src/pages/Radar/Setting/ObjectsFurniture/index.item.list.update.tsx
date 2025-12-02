import {Button, Col, Row} from 'antd'
import {MouseEventHandler} from 'react'

interface ItemListUpdateProps{
    onUpdate: MouseEventHandler<HTMLElement>;
    onCancel: MouseEventHandler<HTMLElement>;
}

const ItemListUpdate = ({
    onUpdate,
    onCancel}: ItemListUpdateProps) => {

    return(
        <Row gutter={[5, 5]}>
            <Col>
                <Button
                    type='primary'
                    onClick={onCancel}>Cancel</Button>
            </Col>
            <Col>
                <Button
                    type='primary'
                    onClick={onUpdate}>Update</Button>
            </Col>
        </Row>
    )
}

export default ItemListUpdate
