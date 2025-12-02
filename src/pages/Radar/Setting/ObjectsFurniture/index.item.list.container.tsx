import React, {useState} from 'react'
import {ActionTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.list.control'
import {ColorEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.color'
import {ItemModel, ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'
import ItemList from '@/pages/Radar/Setting/ObjectsFurniture/index.item.list'
import {OnEditActionEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index'
import {DirectionEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.direction'
import {RotateEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.rotate'

interface ItemListContainerProps {
    title: string;
    data: ItemModel[];
    onAdd: Function;
    onSave: Function;
    onUpdate: Function;
    onEdit: Function;
    onCancel: Function;
    onDelete: Function;
    itemMouseOnEnter: Function;
    itemMouseOnLeave: Function;
}

const ItemListContainer = ({
    title,
    data,
    onAdd,
    onSave,
    onUpdate,
    onEdit,
    onCancel,
    onDelete,
    itemMouseOnEnter,
    itemMouseOnLeave
}: ItemListContainerProps) => {

    const emptySelectedItem = (type?: ItemTypeEnum) => {

        const itemModel: ItemModel = {
            id: 0,
            name: type || '',
            type: type || ItemTypeEnum.NONE,
            color: ColorEnum.BLUE,
            height: type===ItemTypeEnum.BED ? 60 : type===ItemTypeEnum.DOOR ? 200: type===ItemTypeEnum.WINDOW ? 100: 0,
            length: type===ItemTypeEnum.BED ? 200 : 0,
            width: type===ItemTypeEnum.BED ? 150 : type===ItemTypeEnum.DOOR ? 100: type===ItemTypeEnum.WINDOW ? 200: 0,
            coord: {
                x: type!==ItemTypeEnum.NONE ? 1 : 0,
                y: type===ItemTypeEnum.BED ? 2 : 0,
                z: type===ItemTypeEnum.WINDOW ? 0.6: 0,
            },
            rotation: 0,
        }

        return itemModel
    }

    const container: any = React.createRef()

    const [isItemListDrawerOpened, setIsItemListDrawerOpened] = useState(false)
    const [selectedItemType, setSelectedItemType] = useState<ItemTypeEnum>(ItemTypeEnum.NONE)
    const [selectedItem, setSelectedItem] = useState<ItemModel>(emptySelectedItem())
    const [actionType, setActionType] = useState(ActionTypeEnum.NONE)

    const handleOnUpdate = () => {
        onUpdate(selectedItem)
        setIsItemListDrawerOpened(false)
        setActionType(ActionTypeEnum.NONE)
        setSelectedItem(emptySelectedItem())
    }

    const handleOnAdd = (itemType: ItemTypeEnum) => {
        const newItem = emptySelectedItem(itemType)
        setActionType(ActionTypeEnum.ADD)
        setSelectedItemType(itemType)
        setIsItemListDrawerOpened(true)
        setSelectedItem(newItem)
        onAdd(newItem)
    }

    const handleOnSelect = (item: ItemModel) => {
        setActionType(ActionTypeEnum.EDIT)
        setSelectedItem(item)
        setSelectedItemType(item.type)
        setIsItemListDrawerOpened(true)
    }

    const handleOnSave = () => {
        selectedItem.type = selectedItemType
        onSave(selectedItem)

        setIsItemListDrawerOpened(false)
        setActionType(ActionTypeEnum.NONE)
        setSelectedItem(emptySelectedItem())
    }

    const handleColorOnChange = (color: ColorEnum) => {
        setSelectedItem((prevSelectedItem) => {
            prevSelectedItem.color = color
            return prevSelectedItem
        })
        onEdit(OnEditActionEnum.COLOR,
            selectedItem)
    }

    const handleFormOnUpdate = (changedField: any) => {
        const changedFieldName = changedField.name
        const changedFieldValue = changedField.value

        setSelectedItem((prevItem) => {
            prevItem[changedFieldName] = changedFieldValue
            return prevItem
        })

        onEdit(OnEditActionEnum.FORM, selectedItem)
    }

    const handleOnCancel = () => {
        setSelectedItem(emptySelectedItem())
        setIsItemListDrawerOpened(false)
        setActionType(ActionTypeEnum.NONE)
        onCancel()
    }

    const handleItemListDrawerOnClose = () => {
        setSelectedItem(emptySelectedItem())
        setIsItemListDrawerOpened(false)
        setActionType(ActionTypeEnum.NONE)
        onCancel()
    }

    const handleDirectionOnChange = (direction: DirectionEnum) => {
        setSelectedItem((prevSelectedItem) => {
            prevSelectedItem.lastDirection = direction
            return prevSelectedItem
        })

        onEdit(OnEditActionEnum.DIRECTION,
            selectedItem)
    }

    const handleRotateOnChange = (rotate: RotateEnum) => {
        setSelectedItem((prevSelectedItem) => {
            prevSelectedItem.lastRotation = rotate
            return prevSelectedItem
        })

        onEdit(OnEditActionEnum.ROTATION,
            selectedItem)
    }

    const handleItemMouseOnEnter = (id: number) => {
        itemMouseOnEnter(id)
    }

    const handleItemMouseOnLeave = (id: number) => {
        itemMouseOnLeave(id)
    }

    const handleOnDelete = (id: number) => {
        onDelete(id)
    }

    return (
        <ItemList title={title}
            data={data}
            selectedItem={selectedItem}
            isDrawerOpen={isItemListDrawerOpened}
            container={container}
            onSelect={handleOnSelect}
            actionType={actionType}
            selectedItemType={selectedItemType}
            drawerOnClose={handleItemListDrawerOnClose}
            formOnUpdate={handleFormOnUpdate}
            colorOnChange={handleColorOnChange}
            onAdd={handleOnAdd}
            onSave={handleOnSave}
            onUpdate={handleOnUpdate}
            onCancel={handleOnCancel}
            onDelete={handleOnDelete}
            directionOnChange={handleDirectionOnChange}
            rotateOnChange={handleRotateOnChange}
            itemOnMouseEnter={handleItemMouseOnEnter}
            itemOnMouseLeave={handleItemMouseOnLeave}/>
    )
}

export default ItemListContainer
