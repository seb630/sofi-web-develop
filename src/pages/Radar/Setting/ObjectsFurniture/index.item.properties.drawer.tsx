import {Drawer} from 'antd'
import React from 'react'
import {isMobile} from 'react-device-detect'

interface ItemListContentProps{
    title: string;
    onClose: any;
    open: boolean;
    container: any;
    children: React.ReactNode;
}

const ItemPropertiesDrawer = ({
    title,
    onClose,
    open,
    container,
    children
}: ItemListContentProps) => {
    return(
        <Drawer
            title={title}
            placement={isMobile? 'bottom': 'right'}
            closable={true}
            onClose={onClose}
            open={open}
            mask={false}
            zIndex={1}
            getContainer={container.current}
            destroyOnClose={true}
            style={{
                position: 'absolute',
                height: isMobile? 850: 750,
                marginTop: 80,
                overflow: 'hidden'
            }}
        >
            {children}
        </Drawer>
    )
}

export default ItemPropertiesDrawer
