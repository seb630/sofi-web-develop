import {Card, Col, Row} from 'antd'
import ItemDirection, {DirectionEnum, DirectionProps,} from '@/pages/Radar/Setting/ObjectsFurniture/index.direction'
import ItemForm, {PropertyFormProps} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.form'
import ColorList, {PropertyColorProps} from '@/pages/Radar/Setting/ObjectsFurniture/index.color.list'
import {ColorEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.color'
import Rotate, {RotateEnum, RotateProps} from '@/pages/Radar/Setting/ObjectsFurniture/index.rotate'

export enum ItemTypeEnum {
    DOOR = 'door',
    BED = 'bed',
    WINDOW = 'window',
    NONE = ''
}

export interface ItemModel {
    id: number;
    name: string;
    type: ItemTypeEnum;
    width: number;
    length: number;
    height: number;
    color: ColorEnum;
    coord: Coordinate;
    rotation: number;
    lastDirection?: DirectionEnum;
    lastRotation?: RotateEnum;
}

export interface Coordinate {
    x: number,
    y: number,
    z: number
}

interface PropertyProps {
    formProps: PropertyFormProps;
    colorProps: PropertyColorProps;
    directionProps: DirectionProps;
    rotateProps: RotateProps;
}

const ItemProperties = ({
    formProps,
    colorProps,
    directionProps,
    rotateProps
}: PropertyProps) => {
    const {
        onUpdate: formOnUpdate,
        model: formModel
    } = formProps
    const {
        onChange: colorOnChange,
        selectedColor,
    } = colorProps
    const {onChange: directionOnChange, itemType} = directionProps
    const {onChange: rotateOnChange} = rotateProps

    return (
        <div data-testid='propertyTestId' className="margin-bottom">
            <Row gutter={[10, 10]}>
                <Col flex={2}>
                    <ItemForm
                        onUpdate={formOnUpdate}
                        model={formModel}/>
                </Col>
                <Col flex={2}>
                    <Row
                        gutter={[10, 10]}
                        style={{height: '100%'}}>
                        <Col flex={1}>
                            <Card
                                data-testid='propertyDirectionTestId'
                                style={{height: '100%'}}>
                                <ItemDirection
                                    itemType={itemType}
                                    onChange={directionOnChange}
                                />
                                {formModel.type!==ItemTypeEnum.BED && <Rotate
                                    onChange={rotateOnChange}/>
                                }
                            </Card>

                        </Col>
                        <Col flex={1}>
                            <ColorList
                                itemType={itemType}
                                selectedColor={selectedColor}
                                onChange={colorOnChange}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}

export default ItemProperties
