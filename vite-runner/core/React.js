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
                const isTextNode = typeof child === 'string' || typeof child === 'number'
                return !isTextNode
                    ? child
                    : createTextNode(child)
            })
        }
    }
}

function render(el, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [el]
        }
    }

    nextWorkOfUnit = wipRoot;
}

function update() {
    let currentFiber = wipFiber

    return () => {

        wipRoot = {
            ...currentFiber,
            alternate: currentFiber
        }

        nextWorkOfUnit = wipRoot
    }

}

let stateHooks = []
let stateHookIndex
function useState(initial) {
    let currentFiber = wipFiber
    const oldHook = currentFiber.alternate?.stateHooks[stateHookIndex]
    const stateHook = {
        state: oldHook ? oldHook.state : initial,
        queue: oldHook ? oldHook.queue : []
    }

    stateHook.queue.forEach((action) => {
        stateHook.state = action(stateHook.state)
    })

    stateHook.queue = []

    stateHookIndex++
    stateHooks.push(stateHook)
    currentFiber.stateHooks = stateHooks

    function setState(action) {
        const eagerState = typeof action === 'function' ? action(stateHook.state) : action

        if (eagerState === stateHook.state) {
            return
        }

        stateHook.queue.push(typeof action === 'function' ? action : () => action)

        wipRoot = {
            ...currentFiber,
            alternate: currentFiber
        }

        nextWorkOfUnit = wipRoot
    }

    return [stateHook.state, setState]
}

function createDom(type) {
    return type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(type)
}

function updateProps(dom, nextProps, prevProps) {


    // 删除
    Object.keys(prevProps).forEach(key => {
        if (key !== 'children') {
            if (!(key in nextProps)) {
                dom.removeAttribute(key)
            }
        }
    })

    // add update
    Object.keys(nextProps).forEach(key => {
        if (key !== 'children') {
            if (nextProps[key] !== prevProps[key]) {
                if (key.startsWith('on')) {
                    const eventName = key.slice(2).toLowerCase()
                    dom.removeEventListener(eventName, prevProps[key])
                    dom.addEventListener(eventName, nextProps[key])
                } else {
                    dom[key] = nextProps[key]
                }
            }
        }
    })
}

function reconcileChildren(fiber, children) {
    let prevChild = null;
    let oldFiber = fiber.alternate?.child
    children.forEach((child, index) => {
        const isSameType = oldFiber && oldFiber.type === child.type
        let newFiber
        if (isSameType) {
            newFiber = {
                type: child.type,
                props: child.props,
                child: null,
                sibling: null,
                parent: fiber,
                dom: oldFiber.dom,
                alternate: oldFiber,
                effectTag: 'update'
            }
        } else {
            if (child) {
                newFiber = {
                    type: child.type,
                    props: child.props,
                    child: null,
                    sibling: null,
                    parent: fiber,
                    dom: null,
                    effectTag: 'placement'
                }
            }

            if (oldFiber) {
                deletions.push(oldFiber)
            }
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevChild.sibling = newFiber
        }
        if (newFiber) {
            prevChild = newFiber
        }
    })

    while (oldFiber) {
        deletions.push(oldFiber)
        oldFiber = oldFiber.sibling
    }

}

function updateFunctionComponent(fiber) {
    stateHooks = []
    stateHookIndex = 0
    wipFiber = fiber
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        const dom = (fiber.dom = createDom(fiber.type))

        updateProps(dom, fiber.props, {})
    }

    const children = fiber.props.children

    reconcileChildren(fiber, children)
}

function performWorkForUnit(fiber) {
    const isFunctionComponent = typeof fiber.type === 'function'
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }

    if (fiber.child) {
        return fiber.child
    }

    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

let wipFiber = null
let deletions = []
// work in progress root
let wipRoot = null;
let currentRoot = null;
let nextWorkOfUnit = null;
function workLoop(deadline) {
    let shouldYield = false

    while (!shouldYield && nextWorkOfUnit) {
        nextWorkOfUnit = performWorkForUnit(nextWorkOfUnit)
        if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
            nextWorkOfUnit = undefined
        }

        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!nextWorkOfUnit && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(workLoop)
}

function commitRoot() {
    deletions.forEach(commitDeletion)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
    deletions = []
}

// planA: 循环找子节点
// function commitDeletion(fiber) {

//     let childFiber = fiber
//     while (!childFiber.dom) {
//         childFiber = fiber.child
//     }
//     console.log(childFiber)
//     fiber.parent.dom.removeChild(childFiber.dom)
// }

// planB: 
function commitDeletion(fiber) {
    if (fiber?.dom) {
        let fiberParent = fiber?.parent
        while (!fiberParent.dom) {
            fiberParent = fiberParent.parent
        }
        fiberParent.dom.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child)
    }
}

function commitWork(fiber) {
    if (!fiber) return
    let fiberParent = fiber?.parent
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent
    }

    if (fiber.effectTag === 'update') {
        updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
    } else if (fiber.effectTag === 'placement') {
        if (fiber.dom) {
            fiberParent.dom.append(fiber.dom)
        }
    }

    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

requestIdleCallback(workLoop)

const React = {
    useState,
    // update,
    render,
    createElement,
}

export default React