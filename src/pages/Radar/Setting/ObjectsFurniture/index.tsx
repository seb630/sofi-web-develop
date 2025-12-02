import Preview from '@/pages/Radar/Setting/ObjectsFurniture/index.preview'
import {useEffect, useState} from 'react'
import {getLayoutData, personData, radarData} from '@/pages/Radar/Setting/ObjectsFurniture/data'
import {Col, Row} from 'antd'
// import {ColorEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.color'
import ItemListContainer from '@/pages/Radar/Setting/ObjectsFurniture/index.item.list.container'
import {move, rotate} from '@/pages/Radar/Setting/ObjectsFurniture/moveUtil'
import {ItemModel} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'
import {getObjectData, setObjectDataOpacity} from '@/pages/Radar/Setting/ObjectsFurniture/data/dataUtil'
//@ts-ignore
import * as _ from 'lodash'
//@ts-ignore
import {actions} from 'mirrorx'

interface ObjectsFurnitureProps {
    previewTitle: string,
    itemListTitle: string,
    settings: any
}

export enum OnEditActionEnum{
    COLOR = 'color',
    DIRECTION = 'direction',
    ROTATION = 'rotation',
    FORM = 'form'
}

const ObjectsFurniture = (props: ObjectsFurnitureProps) => {

    const {
        previewTitle,
        itemListTitle,
        settings,
    } = props

    // const initialItemListData: ItemModel[] = [
    //     {
    //         id: 201,
    //         name: 'Door 1',
    //         type: ItemTypeEnum.DOOR,
    //         height: 200,
    //         width: 90,
    //         length: 0,
    //         color: ColorEnum.GRAY,
    //         coord: {x:1.5,y:0,z:0},
    //         rotation: 0,
    //     },
    //     {
    //         id: 101,
    //         name: 'Window 1',
    //         type: ItemTypeEnum.WINDOW,
    //         height: 80,
    //         width: 260,
    //         length: 0,
    //         color: ColorEnum.BLUE,
    //         coord: {x:1,y:0,z:0.8},
    //         rotation: 0,
    //     },
    //
    //     {
    //         id: 4,
    //         name: 'Cube 1',
    //         type: ItemTypeEnum.BED,
    //         height: 60,
    //         width: 180,
    //         length: 200,
    //         color: ColorEnum.BLUE,
    //         coord: {x:0,y:2,z:0},
    //         rotation: 0,
    //     },
    // ]

    const defaultFrames: any = []
    const defaultConfig = {responsive: false, displayModeBar: false}
    const [previewData, setPreviewData] = useState<any[]>([])

    const [itemListDataTemp, setItemListDataTemp] = useState<ItemModel[]>([])
    const [itemListData, setItemListData] = useState<ItemModel[]>([])
    //@ts-ignore
    const [revision, setRevision] = useState(1)

    // useEffect(()=>actions.radar.fetchRadarSurrounds(settings?.id).then((data: any)=>{
    //     data?.surrounds && setItemListData(JSON.parse(data.surrounds))
    //     data?.surrounds && setItemListDataTemp(JSON.parse(data.surrounds))
    // }),[settings])

    const handleOnEdit = (action: OnEditActionEnum,
        item:ItemModel) => {

        const updatedId = item.id
        setItemListData((itemListData) => {
            const updatedIndex = itemListData.findIndex((item) => {
                return item.id === updatedId
            })

            switch(action){
            case OnEditActionEnum.DIRECTION:
                item = move(item)
                break
            case OnEditActionEnum.ROTATION:
                item = rotate(item)
                break
            }

            itemListData[updatedIndex] = item

            return [...itemListData]
        })

        setRevision(revision + 1)
    }

    const handleOnUpdate = (item: ItemModel) => {
        const updatedId = item.id
        setItemListData((itemList) => {
            const updatedIndex = itemList.findIndex((item) => {
                return item.id === updatedId
            })
            resetItemOpacity(previewData)
            itemList[updatedIndex] = item
            setItemListDataTemp(_.cloneDeep(itemList))
            const payload = {
                radar_id: settings.id,
                surrounds: JSON.stringify([...itemList])
            }
            actions.radar.updateRadarSurrounds(payload)
            return [...itemList]
        })

    }

    const resetItemOpacity = (previewData: any) => {
        setPreviewData(previewData.map((item: any)=>setObjectDataOpacity(item, 0.5)
        ))
    }

    const handleOnAddNotSave = (newItem: ItemModel) => {
        newItem.id = Math.round(Math.random() * 900)
        setItemListData((itemList) => {
            return [...itemList, newItem]
        })

        setRevision((prevRevision)=> {
            return prevRevision + 1
        })
    }

    const handleOnSave = () => {

        setItemListData((itemList) => {
            resetItemOpacity(previewData)
            setItemListDataTemp(_.cloneDeep([...itemList]))
            const payload = {
                radar_id: settings.id,
                surrounds: JSON.stringify([...itemList])
            }
            actions.radar.updateRadarSurrounds(payload)
            return [...itemList]
        })
        setRevision((prevRevision)=> {
            return prevRevision + 1
        })
    }

    const handleOnCancel = () => {
        setItemListData(_.cloneDeep(itemListDataTemp))
    }

    const handleItemMouseOnEnter = (id: number) => {
        setPreviewData(previewData.map(item=> item.id !== id ? setObjectDataOpacity(item, 0.1) : item))
        setRevision(revision + 1)
    }

    const handleItemMouseOnLeave = (id: number) => {
        setPreviewData(previewData.map(item=> item.id !== id ? setObjectDataOpacity(item, 0.5) : item))
        setRevision(revision + 1)
    }

    const handleOnDelete = (id: number) => {
        setItemListData((itemList)=> {
            itemList = itemList.filter((item)=> {
                return item.id !== id
            })
            resetItemOpacity(previewData)
            setItemListDataTemp(_.cloneDeep(itemList))
            const payload = {
                radar_id: settings.id,
                surrounds: JSON.stringify(itemList)
            }
            actions.radar.updateRadarSurrounds(payload)
            return itemList
        })

        setRevision(revision + 1)
    }

    useEffect(() => {
        let objectsData: any = [radarData, personData]
        itemListData.forEach((item) => {
            objectsData = [...objectsData,getObjectData(item, settings?.left_length, settings?.right_length)]
        })
        setPreviewData(objectsData)
        setRevision((prevRevision)=> {
            return prevRevision + 1
        })
    }, [itemListData, settings])


    return (
        <Row gutter={[0, 10]}>
            <Col flex='auto'>
                <Row gutter={[12,12]}>
                    <Col xs={24} xl={14} flex='auto'>
                        <Preview title={previewTitle}
                            data={previewData}
                            layout={getLayoutData(revision + 1, settings)}
                            frames={defaultFrames}
                            config={defaultConfig}
                            revision={revision}
                            onChange={handleOnEdit}
                        />
                    </Col>
                    <Col xs={24} xl={9} flex='auto'>
                        <ItemListContainer
                            title={itemListTitle}
                            data={itemListData}
                            onEdit={handleOnEdit}
                            onSave={handleOnSave}
                            onAdd={handleOnAddNotSave}
                            onUpdate={handleOnUpdate}
                            onCancel={handleOnCancel}
                            onDelete={handleOnDelete}
                            itemMouseOnEnter={handleItemMouseOnEnter}
                            itemMouseOnLeave={handleItemMouseOnLeave}/>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

export default ObjectsFurniture
