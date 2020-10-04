import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import createMuiTHeme from "@material-ui/core/styles/createMuiTheme";
import jwtDecode from "jwt-decode";

// Pages
import home from "./pages/home";
import login from "./pages/login";
import signup from "./pages/signup";

// Components
import NavBar from "./components/Navbar";

import AuthRoute from "./util/AuthRoute";
import themeFile from "./util/theme";
import "./App.css";

const theme = createMuiTHeme(themeFile);

let authenticated;
const token = localStorage.FBIdToken;

if (token) {
  const decodedToken = jwtDecode(token);

  // checking if token has expired
  if (decodedToken.exp * 1000 < Date.now()) {
    window.Location.href = "/login";
    authenticated = false;
  } else {
    authenticated = true;
  }
}

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <Router>
          <NavBar />
          <div className="container">
            <Switch>
              <Route path="/" exact component={home} />
              <AuthRoute
                path="/login"
                exact
                component={login}
                auhenticated={authenticated}
              />
              <AuthRoute
                path="/signup"
                exact
                component={signup}
                auhenticated={authenticated}
              />
            </Switch>
          </div>
        </Router>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
