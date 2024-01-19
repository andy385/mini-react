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

function Foo() {
    const [count, setCount] = React.useState(10)
    const [bar, setBar] = React.useState('bar')

    console.log('foo ===')
    function handleClick() {
        setCount((c) => c + 1)
        setBar('bar')
    }

    return (
        <div>
            <h1>foo</h1>
            {count}
            <div>{bar}</div>
            <button onClick={handleClick}>click</button>
        </div>
    )
}

let countBar = 1
function Bar() {
    console.log('bar ===')
    const [bar, setBar] = React.useState('')
    function handleClick() {
        setBar((b) => b + 'bar')
    }

    return (
        <div>
            <h1>bar</h1>
            {bar}
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
        </div>
    )
}

export default App;
