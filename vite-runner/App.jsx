import React from "../core/React.js";

// const App = React.createElement('div', { id: 'app' }, 'app');

function Counter({ num }) {
    return <div>count: { num } </div>;
}

function CounterOne() {
    return <Counter num={10}></Counter>;
}

function App() {
    return (
        <div id="app">
            app
            <CounterOne></CounterOne>
            <Counter num={20}></Counter>
        </div>
    );
}

export default App;
