import React, { Component } from 'react';
import './App.css';
import { Router, Link } from 'essence-router';

const Hello = () => <div>Hello, <Link to="/world">toWorld</Link></div>;
const World = () => <div>World</div>;

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Hello default />
          <World path="world" />
        </Router>
      </div>
    );
  }
}

export default App;
