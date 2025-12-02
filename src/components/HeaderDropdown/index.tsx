import type { DropDownProps } from 'antd/es/dropdown'
import { Dropdown } from 'antd'
import React from 'react'
import classNames from 'classnames'
import './index.scss'

export type HeaderDropdownProps = {
    overlayClassName?: string;
    overlay: React.ReactNode | (() => React.ReactNode) | any;
    placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
// eslint-disable-next-line no-undef
} & Omit<DropDownProps, 'overlay'>;

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ overlayClassName: cls, ...restProps }) => (
    <div><Dropdown overlayClassName={classNames('HeaderDropdownContainer', cls)} {...restProps} /></div>
)

export default HeaderDropdown
