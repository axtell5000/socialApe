import React, { Component } from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

//Components
import NavBar from './components/Navbar'

// Pages
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';

import './App.css';

class App extends Component {

  render() {
    return (
      <div className="App">
        <BrowserRouter>
          <NavBar />
          <div className="container">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
            </Switch>
          </div>
        </BrowserRouter>
      </div>
    );
  }

}

export default App;
