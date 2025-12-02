import { Tabs } from 'antd'
import SubscriptionSettings from '@/pages/Subscription/SubscriptionSettings'
import SubscriptionHistory from '@/pages/Subscription/SubscriptionHistory'

const SubscriptionTab = (props) => {
    return <Tabs>
        <Tabs.TabPane tab="Subscription Settings" key='settings'>
            <SubscriptionSettings {...props} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Subscription History" key='history'>
            <SubscriptionHistory {...props} />
        </Tabs.TabPane>
    </Tabs>
}


export default SubscriptionTab
