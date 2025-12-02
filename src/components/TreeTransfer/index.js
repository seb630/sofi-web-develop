import { Transfer, Table } from 'antd'
import difference from 'lodash/difference'

// Customize Table Transfer
export const TableTransfer = ({ leftColumns, rightColumns, rowKey, ...restProps }) => (
    <Transfer {...restProps} showSelectAll={false}>
        {({
            direction,
            filteredItems,
            onItemSelectAll,
            onItemSelect,
            selectedKeys: listSelectedKeys,
            disabled: listDisabled,
        }) => {
            const columns = direction === 'left' ? leftColumns : rightColumns

            const rowSelection = {
                onSelectAll(selected, selectedRows) {
                    const treeSelectedKeys = selectedRows
                        .filter(item => !item.disabled)
                        .map(({ key }) => key)
                    const diffKeys = selected
                        ? difference(treeSelectedKeys, listSelectedKeys)
                        : difference(listSelectedKeys, treeSelectedKeys)
                    onItemSelectAll(diffKeys, selected)
                },
                onSelect({ key }, selected) {
                    onItemSelect(key, selected)
                },
                selectedRowKeys: listSelectedKeys,
            }

            return (
                <Table scroll={{x: true}}
                    tableLayout="fixed"
                    rowKey={rowKey}
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredItems}
                    size="small"
                    style={{ pointerEvents: listDisabled ? 'none' : null }}
                    onRow={({ key, disabled: itemDisabled }) => ({
                        onClick: () => {
                            if (itemDisabled || listDisabled) return
                            onItemSelect(key, !listSelectedKeys.includes(key))
                        },
                    })}
                />
            )
        }}
    </Transfer>
)
