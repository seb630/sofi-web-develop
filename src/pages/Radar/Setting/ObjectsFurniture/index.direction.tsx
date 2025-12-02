import {Button, Col, Row} from 'antd'
import {DownOutlined, LeftOutlined, RightOutlined, UpOutlined} from '@ant-design/icons'
import {ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'

export enum DirectionEnum {
    L = 'L', //left
    R = 'R', //right
    F = 'F', //forward
    B = 'B', //backward
    NONE = 'NONE'
}

export interface DirectionProps {
    onChange: Function;
    itemType?: ItemTypeEnum
}

const Direction = ({onChange, itemType}: DirectionProps) => {

    return itemType!==ItemTypeEnum.BED ?  <>
        <Row justify='center'>
            <Col style={{padding: '3px 3px'}}>
                <Button
                    icon={<UpOutlined />}
                    onClick={() => {
                        onChange(DirectionEnum.F)
                    }}
                />
            </Col>
        </Row>
        <Row justify='center'>
            <Col style={{padding: '3px 3px'}}>
                <Button
                    icon={<LeftOutlined />}
                    onClick={() => {
                        onChange(DirectionEnum.L)
                    }}
                />
            </Col>
            <Col style={{padding: '3px 3px'}}>
                <Button
                    icon={<RightOutlined />}
                    onClick={() => {
                        onChange(DirectionEnum.R)
                    }}
                />
            </Col>
        </Row>
        <Row justify='center'>
            <Col style={{padding: '3px 3px'}}>
                <Button
                    icon={<DownOutlined />}
                    onClick={() => {
                        onChange(DirectionEnum.B)
                    }}
                />
            </Col>
        </Row>
    </> :<>
        <Row justify='center'>
            <Col style={{padding: '3px 3px'}}>
                <Button
                    icon={<UpOutlined style={{rotate: '-45deg'}}/>}
                    onClick={() => {
                        onChange(DirectionEnum.B)
                    }}
                />
            </Col>
            <Col style={{padding: '3px 3px'}}>
                <Button
                    icon={<UpOutlined style={{rotate: '45deg'}}/>}
                    onClick={() => {
                        onChange(DirectionEnum.R)
                    }}
                />
            </Col>
        </Row>
        <Row justify='center'>
            <Col style={{padding: '3px 3px'}}>
                <Button
                    icon={<DownOutlined style={{rotate: '45deg'}}/>}
                    onClick={() => {
                        onChange(DirectionEnum.L)
                    }}
                />
            </Col>
            <Col style={{padding: '3px 3px'}}>
                <Button
                    icon={<DownOutlined style={{rotate: '-45deg'}}/>}
                    onClick={() => {
                        onChange(DirectionEnum.F)
                    }}
                />
            </Col>
        </Row>
    </>
}

export default Direction
