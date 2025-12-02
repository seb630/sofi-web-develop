import {useState} from 'react'
import {Button} from 'antd'
import {blue, brown, green, grey, red} from '@/scss/colours.scss'

export enum ColorEnum {
    RED = 'red',
    BLUE = 'blue',
    GREEN = 'green',
    GRAY = 'grey',
    BROWN = 'brown',
    NONE = ''
}

export const colors = {
    red: red,
    blue: blue,
    green: green,
    grey: grey,
    brown: brown
}

interface PropertyColorItemProps {
    color: ColorEnum;
    selected: boolean;
    onChange: Function;
}

const Color = (
    {
        color,
        selected = false,
        onChange
    }: PropertyColorItemProps) => {

    const [isHover, setIsHover] = useState(false)

    const propertyColorItemStyle = {
        borderWidth: 2,
        borderColor: isHover || selected ? 'black' : 'white',
        backgroundColor: colors[color],
        transition: 'transform 250ms',
        transform: isHover || selected ? 'scale(1.2)' : 'scale(1)',
    }

    return (
        <Button
            type="primary"
            style={propertyColorItemStyle}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={() => onChange(color)}>
            &nbsp;&nbsp;</Button>
    )
}

export default Color
