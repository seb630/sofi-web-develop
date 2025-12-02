import {render} from '@testing-library/react/pure'
import '@testing-library/jest-dom'
import ItemForm from '@/pages/Radar/Setting/ObjectsFurniture/index.item.form'
import {ColorEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.color'
import {ItemModel, ItemTypeEnum} from '@/pages/Radar/Setting/ObjectsFurniture/index.item.properties'

describe('Property Form', () => {

    let getByLabelText: Function
    const model:ItemModel = {
        id: 1,
        name: 'Test',
        color: ColorEnum.BLUE,
        height: 100,
        length: 100,
        width: 100,
        coord: {x:0,y:0,z:0},
        type: ItemTypeEnum.BED,
        rotation: 0,
    }
    beforeAll(() => {

        ({
            getByLabelText,
        } = render(
            <ItemForm
                onUpdate={(item: ItemModel)=> {console.log(JSON.stringify(item))}}
                model={model}
            />))
    })

    //name
    test('has <Form.Item/> with text Object/Furniture Name', () => {
        const givenObjectFurnitureNameItemText = 'Name'
        const objectFurnitureNameItemComponent = getByLabelText(givenObjectFurnitureNameItemText)
        expect(objectFurnitureNameItemComponent).toBeInTheDocument()
    })
    test.todo('should edit Object/Furniture Name')

    //width
    test('has <Form.Item/> with text Width', () => {
        const givenWidthItemText = 'Width'
        const widthFormItemComponent = getByLabelText(givenWidthItemText)
        expect(widthFormItemComponent).toBeInTheDocument()

    })
    test.todo('should edit text Width')

    //length
    test('has <Form.Item/> with text Length', () => {
        const givenLengthItemText = 'Length'
        const lengthFormItemComponent = getByLabelText(givenLengthItemText)
        expect(lengthFormItemComponent).toBeInTheDocument()
    })
    test.todo('should edit text Length')


    //height
    test('has <Form.Item/> with text Height', () => {
        const givenHeightItemText = 'Height'
        const heightFormItemComponent = getByLabelText(givenHeightItemText)
        expect(heightFormItemComponent).toBeInTheDocument()
    })

    test.todo('should edit text Height')

    test.todo('should Height only for Bed Object')

})
