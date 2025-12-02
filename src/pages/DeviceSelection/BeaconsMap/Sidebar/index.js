import { Drawer } from 'antd'
import Media from 'react-media'
import Sidebar from './Sidebar'

const SidebarWrapper = props => {
    const { collapsed , onCollapse } = props

    return (
        <Media query="(max-width: 599px)">
            { (isMobile) => {
                if(isMobile) {
                    return (
                        <Drawer
                            open={!collapsed}
                            onClose={onCollapse}
                            placement="left"
                            width={300}
                            bodyStyle={{
                                padding: 0
                            }}
                            style={{
                                padding: 0,
                                height: '100vh',
                            }}
                        >
                            <Sidebar {...props} isMobile={isMobile}/>
                        </Drawer>
                    )
                }

                return (
                    <Sidebar {...props} />
                )
            }
            }
        </Media>
    )
}

export default SidebarWrapper
