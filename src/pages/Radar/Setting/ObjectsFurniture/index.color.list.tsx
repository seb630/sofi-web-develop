import {Card, Col, Row} from 'antd'
import Color, {ColorEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.color'
import {useEffect, useState} from 'react'
import {ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'

export interface PropertyColorProps {
    open?: boolean;
    selectedColor: ColorEnum;
    onChange: Function;
    itemType?: ItemTypeEnum
}

const ColorList = ({
    open = true,
    selectedColor,
    itemType,
    onChange
}: PropertyColorProps) => {

    const [color, setColor] = useState<ColorEnum>(selectedColor)

    useEffect(()=> {
        setColor(selectedColor)
    }, [selectedColor])

    const isSelected = (itemColor: ColorEnum) => {
        return itemColor === color
    }

    const handleOnChange = (color:ColorEnum) => {
        onChange(color)
        setColor(color)
    }

    return (
        open ? <Card
            data-testid='propertyColorTestId'
            style={{height: '100%'}}>
            {itemType===ItemTypeEnum.BED ? <Row
                gutter={10}
                style={{marginBottom: 10}}>
                <Col>
                    <Color
                        color={ColorEnum.BLUE}
                        selected={isSelected(ColorEnum.BLUE)}
                        onChange={handleOnChange}/>
                </Col>
                <Col>
                    <Color
                        color={ColorEnum.RED}
                        selected={isSelected(ColorEnum.RED)}
                        onChange={handleOnChange}/>
                </Col>
                <Col>
                    <Color
                        color={ColorEnum.GREEN}
                        selected={isSelected(ColorEnum.GREEN)}
                        onChange={handleOnChange}/>
                </Col>
            </Row>
                :<Row gutter={10}>
                    <Col>
                        <Color
                            color={ColorEnum.BLUE}
                            selected={isSelected(ColorEnum.BLUE)}
                            onChange={handleOnChange}/>
                    </Col>
                    <Col>
                        <Color
                            color={ColorEnum.BROWN}
                            selected={isSelected(ColorEnum.BROWN)}
                            onChange={handleOnChange}/>
                    </Col>
                    <Col>
                        <Color
                            color={ColorEnum.GRAY}
                            selected={isSelected(ColorEnum.GRAY)}
                            onChange={handleOnChange}/>
                    </Col>
                </Row>
            }
        </Card> : <></>
    )
}

export default ColorList
