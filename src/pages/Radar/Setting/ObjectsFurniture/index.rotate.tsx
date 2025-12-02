import {Button, Col, Row} from 'antd'
import {RotateLeftOutlined, RotateRightOutlined} from '@ant-design/icons'

export enum RotateEnum {
    L = 'L', //rotation left
    R = 'R' //rotation right
}

export interface RotateProps {
    onChange: Function;
}

const Rotate = ({
    onChange,
}: RotateProps) => {

    const handleOnRotateLeft = () => {
        onChange(RotateEnum.L)
    }

    const handleOnRotateRight = () => {
        onChange(RotateEnum.R)
    }

    return (
        <Row justify='center'
            gutter={5}
            style={{marginTop: 3}}>
            <Col>
                <Button
                    icon={<RotateLeftOutlined/>}
                    onClick={handleOnRotateLeft}>
                    Rotate 90°
                </Button>
            </Col>
            <Col>
                <Button
                    onClick={handleOnRotateRight}
                >
                    Rotate 90°
                    <RotateRightOutlined/>
                </Button>
            </Col>
        </Row>
    )
}

export default Rotate
