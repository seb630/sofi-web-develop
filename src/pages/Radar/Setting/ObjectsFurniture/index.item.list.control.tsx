import ItemListAdd from '@/pages/Radar/Setting/ObjectsFurniture/index.item.list.add'
import ItemListSave from '@/pages/Radar/Setting/ObjectsFurniture/index.item.list.save'
import ItemListUpdate from '@/pages/Radar/Setting/ObjectsFurniture/index.item.list.update'
import {MouseEventHandler} from 'react'

export enum ActionTypeEnum {
    ADD = 'Add new',
    EDIT = 'Edit',
    NONE = 'none'
}

interface ItemListControlProps {
    actionType: ActionTypeEnum;
    onAdd: Function;
    onSave: MouseEventHandler<HTMLElement>;
    onUpdate: MouseEventHandler<HTMLElement>;
    onCancel: MouseEventHandler<HTMLElement>;
}

const ItemListControl = ({
    actionType,
    onAdd,
    onSave,
    onUpdate,
    onCancel,
}: ItemListControlProps) => {

    switch (actionType) {

    case ActionTypeEnum.NONE:
        return <ItemListAdd
            onAdd={onAdd}/>

    case ActionTypeEnum.ADD:
        return <ItemListSave
            onSave={onSave}
            onCancel={onCancel}/>

    case ActionTypeEnum.EDIT:
        return <ItemListUpdate
            onUpdate={onUpdate}
            onCancel={onCancel}/>
    }


}

export default ItemListControl
