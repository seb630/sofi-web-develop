import { Component } from 'react'
import { Table} from 'antd'
import { sortString } from '../../../../../../utility/Common'

export default class Privileges extends Component{
    constructor(props) {
        super(props)
    }

    render(){
        const {privileges} = this.props
        const dataSource = privileges
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                sorter: (a, b) => sortString(a,b,'name')
            },
            {
                title: 'Description',
                dataIndex: 'description',
            }
        ]
        return (
            <div className="contentPage">
                <Table scroll={{x: true}} className="table"
                    dataSource={dataSource}
                    columns={columns}
                    rowKey="security_privilege_id"
                />
            </div>)
    }
}



