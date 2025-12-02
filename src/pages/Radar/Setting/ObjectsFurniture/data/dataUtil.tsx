import {ColorEnum, colors} from '@/pages/Radar/Setting/ObjectsFurniture/index.color'
import bedData from './bed.json'
import layoutData from './layout.json'
import cubeData from './cube.json'
import windowData from './window.json'
import {Coordinate, ItemModel, ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'
import {isMobile} from 'react-device-detect'

export const setDataColor = (data: any, color: ColorEnum) => {
    data.colorscale = [[0, colors[color]], [1, colors[color]]]
    return data
}

export const getLayoutData = (dataRevision: number, settings?: any) => {
    layoutData.datarevision = dataRevision
    const minXYZ = Math.min(settings?.right_length,
        settings?.left_length,
        settings?.radar_height) || 1

    if (settings) {
        layoutData.scene.xaxis.range = [0, settings?.left_length]
        layoutData.scene.yaxis.range = [0, settings?.right_length]
        layoutData.scene.zaxis.range = [0, settings?.radar_height]
        layoutData.scene.aspectratio = {
            x: settings?.right_length / minXYZ * (isMobile ? 0.4 : 0.8),
            y: settings?.left_length / minXYZ * (isMobile ? 0.4 : 0.8),
            z: settings?.radar_height / minXYZ * (isMobile ? 0.4 : 0.8),
        }
    }
    return layoutData
}

export const setObjectDataOpacity = (data: any, opacity: number) => {
    data.opacity = opacity
    return data
}

export const getBedData = (id: number, color: ColorEnum) => {
    return {
        ...bedData,
        id: id,
        colorscale: [[0, color], [1, color]]
    }
}

export const getCubeData = (id: number, color: ColorEnum, length: number,  width: number, height: number, coord: Coordinate) => {
    return {
        ...cubeData,
        id: id,
        colorscale: [[0, color], [1, color]],
        x: [0, 0, length, length, 0, 0, length, length].map(item=>coord.x+item),
        y: [0, width, width, 0, 0, width, width, 0].map(item=>coord.y+item),
        z: [0, 0, 0, 0, height, height, height, height].map(item=>coord.z+item)
    }
}

export const calcRotation = (data: any, maxX: number, maxY: number) => {

    let xArr:any[] = []
    let yArr:any[] = []

    data.x.forEach((x: number, index: number) => {
        switch (data.rotation) {
        case 1: {
            xArr.push(data.y[index])
            yArr.push(data.x[index])
            break
        }
        case 2: {
            xArr.push(x === 0 || x===maxX ? maxX - x : x)
            yArr.push(data.y[index] === 0 || data.y[index]===maxY ? maxY - data.y[index] : data.y[index])
            break
        }
        case 3: {
            xArr.push(maxX)
            yArr.push(x)
            break
        }
        default: {
            xArr.push(x)
            yArr.push(data.y[index])
        }
        }
    })

    data.x = xArr
    data.y = yArr

    return data
}

export const getObjectData = (item: ItemModel, maxX: number, maxY: number) => {
    let {color, length, width, height, coord} = item
    const rgbColor = colors[color]
    const lengthInMeter =length/100
    const widthInMeter = width/100
    const heightInMeter = height/100
    switch (item.type){
    case ItemTypeEnum.BED:
        return {
            ...item,
            ...cubeData,
            color: rgbColor,
            x: [0, 0, lengthInMeter, lengthInMeter, 0, 0, lengthInMeter, lengthInMeter].map(item=>coord.x+item),
            y: [0, widthInMeter, widthInMeter, 0, 0, widthInMeter, widthInMeter, 0].map(item=>coord.y+item),
            z: [0, 0, 0, 0, heightInMeter, heightInMeter, heightInMeter, heightInMeter].map(item=>coord.z+item)
        }

    default: {
        const defaultData = {
            ...item,
            ...windowData,
            color: rgbColor,
            x: [0, 0, widthInMeter, widthInMeter, 0, 0, widthInMeter, widthInMeter].map(item => coord.x + item),
            y: [0, lengthInMeter, lengthInMeter, 0, 0, lengthInMeter, lengthInMeter, 0].map(item => coord.y + item),
            z: [0, 0, 0, 0, heightInMeter, heightInMeter, heightInMeter, heightInMeter].map(item => coord.z + item)
        }

        return calcRotation(defaultData, maxX, maxY)
    }
    }
}
