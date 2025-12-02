import {DirectionEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.direction'
import {ItemModel, ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'
import {RotateEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.rotate'

export const move = (item: ItemModel) => {

    switch (item.lastDirection) {
    case DirectionEnum.L:
        item.coord.x += item.rotation % 2 ===1 ? -0.1 : 0.1
        break
    case DirectionEnum.R:
        item.coord.x -= item.rotation % 2 ===1 ? -0.1 : 0.1
        break
    case DirectionEnum.F:
        if (item.type===ItemTypeEnum.BED){
            item.coord.y += 0.1
        } else {
            item.coord.z += 0.1
        }
        break
    case DirectionEnum.B:
        if (item.type===ItemTypeEnum.BED){
            item.coord.y -= 0.1
        }  else {
            item.coord.z -= 0.1
        }
        break
    }

    return item
}


export const rotate = (item: ItemModel) => {
    switch (item.lastRotation) {
    case RotateEnum.L:
        item.rotation = item.rotation === 0 ? 3: item.rotation-1
        break
    case RotateEnum.R:
        item.rotation = item.rotation === 3 ? 0: item.rotation+1
        break
    }
    return item
}



// export const rotateLeft = (data: any) => {
//     const theta = -1.57079633
//     let xArr:any[] = []
//     let yArr:any[] = []
//
//     const width = Math.max(...data.x) - Math.min(...data.x)
//     const height = Math.max(...data.y) - Math.min(...data.y)
//
//     data.x.forEach((x: number, index: number) => {
//         xArr.push(x * Math.cos(theta) - data.y[index] * Math.sin(theta))
//         yArr.push(data.y[index] * Math.cos(theta) + x * Math.sin(theta) + width * height + 0.7)
//     })
//
//     data.x = xArr
//     data.y = yArr
//
//     return data
// }
