import React from 'react'
import { BellOutlined } from '@ant-design/icons'
import { Badge, Spin, Tabs } from 'antd'
import useMergedState from 'rc-util/es/hooks/useMergedState'
import classNames from 'classnames'
import type { NoticeIconTabProps } from './NoticeList'
import NoticeList from './NoticeList'
import HeaderDropdown from '../HeaderDropdown/index'

import './index.scss'

export type NoticeIconData = {
  avatar?: string | React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  datetime?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
  key?: string | number;
  read?: boolean;
};

export type NoticeIconProps = {
  count?: number;
  bell?: React.ReactNode;
  className?: string;
  loading?: boolean;
  onClear?: (tabName: string, tabKey: string) => void;
  onItemClick?: (item: NoticeIconData, tabProps: NoticeIconTabProps) => void;
  onViewMore?: (tabProps: NoticeIconTabProps, e: MouseEvent) => void;
  onTabChange?: (tabTile: string) => void;
  style?: React.CSSProperties;
  onPopupOpenChange?: (open: boolean) => void;
  popupOpen?: boolean;
  clearText?: string;
  viewMoreText?: string;
  clearClose?: boolean;
  emptyImage?: string;
  children: React.ReactElement<NoticeIconTabProps>[];
};

const NoticeIcon: React.FC<NoticeIconProps> & {
  Tab: typeof NoticeList;
} = (props) => {
    const getNotificationBox = (): React.ReactNode => {
        const {
            children,
            loading,
            onClear,
            onTabChange,
            onItemClick,
            onViewMore,
            clearText,
            viewMoreText,
        } = props
        if (!children) {
            return null
        }
        const items: any['items'] = []
        React.Children.forEach(children, (child: React.ReactElement<NoticeIconTabProps>): void => {
            if (!child) {
                return
            }
            const { list, title, count, tabKey, showClear, showViewMore } = child.props
            const len = list?.length ? list.length : 0
            const msgCount = count || count === 0 ? count : len
            const tabTitle: string = msgCount > 0 ? `${title} (${msgCount})` : title
            items.push(
                {
                    key: tabKey,
                    label: tabTitle,
                    children: <NoticeList
                        {...child.props}
                        clearText={clearText}
                        viewMoreText={viewMoreText}
                        data={list}
                        onClear={(): void => {
                            onClear?.(title, tabKey)
                        }}
                        onClick={(item): void => {
                            onItemClick?.(item, child.props)
                        }}
                        onViewMore={(event): void => {
                            onViewMore?.(child.props, event)
                        }}
                        showClear={showClear}
                        showViewMore={showViewMore}
                        title={title}
                    />
                }
            )
        })
        return (
            <Spin spinning={loading} delay={300}>
                <Tabs className="noticeIconTabs" items={items} onChange={onTabChange} centered />
            </Spin>
        )
    }

    const { className, count, bell } = props

    const [open, setOpen] = useMergedState<boolean>(false, {
        value: props.popupOpen,
        onChange: props.onPopupOpenChange,
    })
    const noticeButtonClass = classNames(className, 'noticeButton')
    const notificationBox = getNotificationBox()
    const NoticeBellIcon = bell || <BellOutlined className="noticeIconIcon" />
    const trigger = (
        <span className={classNames(noticeButtonClass, { opened: open })}>
            <Badge count={count} style={{ boxShadow: 'none' }} className="noticeIconBadge">
                {NoticeBellIcon}
            </Badge>
        </span>
    )
    if (!notificationBox) {
        return trigger
    }
    return (
        <HeaderDropdown
            placement="bottomRight"
            overlay={notificationBox}
            overlayClassName="noticeIconPopover"
            trigger={['click']}
            open={open}
            onOpenChange={setOpen}
        >
            {trigger}
        </HeaderDropdown>
    )
}

NoticeIcon.defaultProps = {
    emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
    loading: false
}

NoticeIcon.Tab = NoticeList

export default NoticeIcon
