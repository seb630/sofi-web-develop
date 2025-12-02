// mock for window.URL.createObjectURL issue
function noOp () { }
if (typeof window.URL.createObjectURL === 'undefined') {
    Object.defineProperty(window.URL, 'createObjectURL', { value: noOp})
}

// mock for TypeError: window.matchMedia is not a function
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})


// mock for  Error: Not implemented: HTMLCanvasElement.prototype.getContext
window.HTMLCanvasElement.prototype.getContext = () => {}
