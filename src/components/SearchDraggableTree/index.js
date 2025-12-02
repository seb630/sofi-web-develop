import { Component } from 'react'
import { Tree } from 'antd'
import PropTypes from 'prop-types'
import './index.scss'

export default class SearchDraggableTree extends Component {
    constructor(props) {
        super(props)
        this.state = {
            expandedKeys: [],
            autoExpandParent: true,
            gdata: props.treeData,

        }
    }

    componentDidUpdate(prevProps) {
        prevProps.treeData!==this.props.treeData && this.setState({gdata: this.props.treeData})
        prevProps.expandedKeys !== this.props.expandedKeys && this.setState({
            expandedKeys: this.props.expandedKeys,
            autoExpandParent: true,
        })
    }

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        })
    }

    onDrop = info => {
        const {type, updateElement, updateGroup} = this.props
        const dropKey = info.node.props.eventKey
        const dragKey = info.dragNode.props.eventKey
        const dropPos = info.node.props.pos.split('-')
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

        const loop = (data, key, callback) => {
            data.forEach((item, index, arr) => {
                if (item.key === key) {
                    return callback(item, index, arr)
                }
                if (item.children) {
                    return loop(item.children, key, callback)
                }
            })
        }
        const data = [...this.state.gdata]

        // Find dragObject
        let dragObj
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1)
            dragObj = item
        })

        if (!info.dropToGap) {
            // Drop on the content
            loop(data, dropKey, item => {
                item.children = item.children || []
                // where to insert
                item.children.push(dragObj)
            })

            //Check item is leaf or group, if leaf, update group ID, if group, update parent ID
            if (dragObj.isLeaf){
                dragObj[`organization_${type}_group_id`] = dropKey
                updateElement({orgId: dragObj.organization_id, payload: dragObj})
            }else{
                dragObj.parent_id = dropKey
                updateGroup({orgId: dragObj.organization_id, payload: dragObj})
            }
        } else if (
            (info.node.props.children || []).length > 0 && // Has children
            info.node.props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, item => {
                item.children = item.children || []
                // where to insert
                item.children.unshift(dragObj)
            })
            if (dragObj.isLeaf){
                dragObj[`organization_${type}_group_id`] = dropKey
                updateElement({orgId: dragObj.organization_id, payload: dragObj})
            }else{
                dragObj.parent_id = dropKey
                updateGroup({orgId: dragObj.organization_id, payload: dragObj})
            }
        } else {
            let ar
            let i
            let parent
            loop(data, dropKey, (item, index, arr) => {
                parent = item
                ar = arr
                i = index
            })
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj)
            } else {
                ar.splice(i + 1, 0, dragObj)
            }
            //Check item is leaf or group, if leaf, update group ID, if group, update parent ID
            if (dragObj.isLeaf){
                dragObj[`organization_${type}_group_id`] = parent.parent_id
                updateElement({orgId: dragObj.organization_id, payload: dragObj})
            }else{
                dragObj.parent_id = parent.parent_id
                updateGroup({orgId: dragObj.organization_id, payload: dragObj})
            }
        }

        this.setState({
            gdata: data,
        })
    }

    render() {
        const {onSelect} = this.props
        const {gdata, autoExpandParent, expandedKeys} = this.state

        return (
            <Tree.DirectoryTree
                className="margin-bottom"
                draggable
                onExpand={this.onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onSelect={onSelect}
                onDrop={this.onDrop}
                treeData={gdata}
            />
        )
    }
}

SearchDraggableTree.propTypes = {
    treeData: PropTypes.array.isRequired,
    onSelect: PropTypes.func,
    currentOrg: PropTypes.object,
    type: PropTypes.oneOf(['user','device']),
    updateGroup: PropTypes.func,
    updateElement: PropTypes.func,
    expandedKeys: PropTypes.array
}
