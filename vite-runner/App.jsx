import React from "./core/React.js";

let showBar = false
const foo = <div>foo<p>aaa</p></div>
const bar = <div>bar</div>
// function Foo() {
//     return <div>FOO</div>
// }

function Counter() {

    function handleShowBar() {
        showBar = !showBar
        React.update()
    }

    return (
        <div id="count">
            count
            { showBar && bar }
            <button onClick={handleShowBar}>show bar</button>
        </div>
    );
}

let countFoo = 1
function Foo() {
    console.log('foo ===')
    const update = React.update()
    function handleClick() {
        countFoo++
        update()
    }

    return (
        <div>
            <h1>foo</h1>
            {countFoo}
            <button onClick={handleClick}>click</button>
        </div>
    )
}

let countBar = 1
function Bar() {
    console.log('bar ===')
    const update = React.update()
    function handleClick() {
        countBar++
        update()
    }

    return (
        <div>
            <h1>bar</h1>
            {countBar}
            <button onClick={handleClick}>click</button>
        </div>
    )
}

function App() {
    return (
        <div id='app'>
            hi,mini-react
            <Foo></Foo>
            <Bar></Bar>
            aaa
            bbb
        </div>
    )
}

export default App;
