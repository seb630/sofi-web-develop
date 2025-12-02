import {render} from '@testing-library/react/pure'
import Rotate from '@/pages/Radar/Setting/ObjectsFurniture/index.rotate'
import '@testing-library/jest-dom'

let getByLabelText: Function

describe('Property Rotate', () => {

    beforeAll(() => {
        ({
            getByLabelText,
        } = render(<Rotate
            onChange={()=> {}}/>))
    })

    test('has Rotate Right <Button/> with title Rotate 90° text and <Icon/> ↺', () => {
        const buttonIconLabel = 'rotate-right'
        const buttonIconComponent = getByLabelText(buttonIconLabel)
        expect(buttonIconComponent).toBeInTheDocument()

        const buttonComponent = buttonIconComponent.parentElement
        const expectedButtonText = 'Rotate 90°'
        expect(buttonComponent).toHaveTextContent(expectedButtonText)
    })

    test.todo('should Rotate Right')

    test('has Rotate Left <Button/> with title <Icon/> ↻ and Rotate 90° text', () => {
        const buttonIconLabel = 'rotate-left'
        const buttonIconComponent = getByLabelText(buttonIconLabel)
        expect(buttonIconComponent).toBeInTheDocument()

        const buttonComponent = buttonIconComponent.parentElement
        const expectedButtonText = 'Rotate 90°'
        expect(buttonComponent).toHaveTextContent(expectedButtonText)
    })

    test.todo('should Rotate Left')

})
