import {Card, Form, Input} from 'antd'
import {ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'

export interface PropertyFormProps {
    onUpdate: any;
    model: PropertyFormModel
}

export interface PropertyFormModel {
    name?: string;
    type?: ItemTypeEnum;
    width?: number;
    length?: number;
    height?: number;
}

const ItemForm = ({
    onUpdate,
    model,
}: PropertyFormProps) => {

    const initialValues ={
        ...model
    }

    return (
        <Card data-testid='propertyFormTestId'>
            <Form initialValues={initialValues}
                onFieldsChange={(changedFields) => {
                    const changedField = changedFields[0]

                    onUpdate(changedField)
                }}>
                <Form.Item
                    label='Name'
                    name='name'>
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Width'
                    name='width'>
                    <Input/>
                </Form.Item>
                {model.type===ItemTypeEnum.BED && <Form.Item
                    label='Length'
                    name='length'>
                    <Input/>
                </Form.Item>}
                <Form.Item
                    label='Height'
                    name='height'>
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Type'
                    name='type'>
                    <Input disabled />
                </Form.Item>
            </Form>
        </Card>)
}

export default ItemForm
