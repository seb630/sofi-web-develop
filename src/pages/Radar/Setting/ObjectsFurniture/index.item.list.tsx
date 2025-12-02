import {Card, List} from 'antd'
import {MouseEventHandler} from 'react'
import ItemProperties, {ItemModel, ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'
import ItemListControl, {ActionTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.list.control'
import ItemPropertiesDrawer from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties.drawer'
import Item from '@/pages/Radar/Setting/ObjectsFurniture/index.item'
import {isMobile} from 'react-device-detect'

interface ItemListProps {
    title: string;
    data: ItemModel[];
    selectedItem: ItemModel;
    isDrawerOpen: boolean;
    container: any;
    onSelect: Function;
    actionType: ActionTypeEnum;
    selectedItemType: ItemTypeEnum;
    drawerOnClose: Function;
    formOnUpdate: Function;
    colorOnChange: Function;
    onAdd: Function;
    onSave: MouseEventHandler<HTMLElement>;
    onUpdate: MouseEventHandler<HTMLElement>;
    onCancel: MouseEventHandler<HTMLElement>;
    directionOnChange: Function;
    rotateOnChange: Function;
    itemOnMouseEnter: Function;
    itemOnMouseLeave: Function;
    onDelete: Function;
}

const ItemList = ({
    title,
    data,
    selectedItem,
    isDrawerOpen,
    container,
    onSelect,
    actionType,
    selectedItemType,
    drawerOnClose,
    formOnUpdate,
    colorOnChange,
    onAdd,
    onSave,
    onUpdate,
    onCancel,
    directionOnChange,
    rotateOnChange,
    itemOnMouseEnter,
    itemOnMouseLeave,
    onDelete
}: ItemListProps) => {
    return (
        <Card
            title={title}
            bodyStyle={{
                overflowY: !isDrawerOpen ? 'scroll' : 'hidden'
            }}
            type='inner'>
            <div ref={container}
                style={{
                    minHeight: isMobile ? '100px': '418px',
                    position: 'relative',
                    height: '100%'
                }}>
                <List dataSource={data}
                    style={{overflow: 'auto'}}
                    itemLayout="horizontal"
                    renderItem={(item: ItemModel) => (
                        <Item
                            item={item}
                            onSelect={onSelect}
                            onMouseEnter={itemOnMouseEnter}
                            onMouseLeave={itemOnMouseLeave}
                            onDelete={onDelete}/>
                    )}>
                </List>
                <ItemPropertiesDrawer
                    title={`${actionType} ${selectedItemType}`}
                    onClose={drawerOnClose}
                    open={isDrawerOpen}
                    container={container}>
                    <ItemProperties
                        formProps={{
                            onUpdate: formOnUpdate,
                            model: {
                                name: selectedItem.name,
                                type: selectedItem.type,
                                width: selectedItem.width,
                                length: selectedItem.length,
                                height: selectedItem.height,
                            }
                        }}
                        colorProps={{
                            itemType: selectedItemType,
                            onChange: colorOnChange,
                            selectedColor: selectedItem.color
                        }}
                        directionProps={{
                            itemType: selectedItemType,
                            onChange: directionOnChange,
                        }}
                        rotateProps={{
                            onChange: rotateOnChange,
                        }}
                    />
                    <ItemListControl
                        actionType={actionType}
                        onAdd={onAdd}
                        onSave={onSave}
                        onUpdate={onUpdate}
                        onCancel={onCancel}/>
                </ItemPropertiesDrawer>
            </div>

            {!isDrawerOpen && <ItemListControl
                actionType={actionType}
                onAdd={onAdd}
                onSave={onSave}
                onUpdate={onUpdate}
                onCancel={onCancel}/>}
        </Card>
    )
}

export default ItemList
