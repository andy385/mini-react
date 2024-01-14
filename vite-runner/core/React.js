function createTextNode(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
                return typeof child === 'object'
                    ? child
                    : createTextNode(child)
            })
        }
    }
}

function render(el, container) {
    nextWorkOfUnit = {
        dom: container,
        props: {
            children: [el]
        }
    }
}

function createDom(type) {
    return type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(type)

}

function updateProps(dom, props) {
    Object.keys(props).forEach(key => {
        if (key !== 'children') {
            dom[key] = props[key]
        }
    })
}

function initChildren(fiber) {
    let preChild = null;
    fiber.props.children.forEach((child, index) => {
        const newFiber = {
            type: child.type,
            props: child.props,
            child: null,
            sibling: null,
            parent: fiber,
            dom: null
        }
        if (index === 0) {
            fiber.child = newFiber
        } else {
            preChild.sibling = newFiber
        }
        preChild = child
    })

}

function performWorkForUnit(fiber) {
    if (!fiber.dom) {
        const dom = (fiber.dom = createDom(fiber.type))
        fiber.parent.dom.append(dom)

        updateProps(dom, fiber.props)
    }

    initChildren(fiber)

    if (fiber.child) {
        return fiber.child
    }

    if (fiber.sibling) {
        return fiber.sibling
    }

    return fiber.parent?.sibling
}

let nextWorkOfUnit = null;
function workLoop(deadline) {
    let shouldYield = false

    while (!shouldYield && nextWorkOfUnit) {
        nextWorkOfUnit = performWorkForUnit(nextWorkOfUnit)

        shouldYield = deadline.timeRemaining() < 1;

    }

    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

const React = {
    render,
    createElement,
}

export default React