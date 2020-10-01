import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

// Pages
import home from "./pages/home";
import login from "./pages/login";
import signup from "./pages/signup";

// Components
import NavBar from "./components/Navbar";

import "./App.css";

function App() {
  return (
    <div className="App">
      <Router>
        <NavBar />
        <div className="container">
          <Switch>
            <Route path="/" exact component={home} />
            <Route path="/login" exact component={login} />
            <Route path="/signup" exact component={signup} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
