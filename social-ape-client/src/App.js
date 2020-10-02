import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import createMuiTHeme from "@material-ui/core/styles/createMuiTheme";

// Pages
import home from "./pages/home";
import login from "./pages/login";
import signup from "./pages/signup";

// Components
import NavBar from "./components/Navbar";

import "./App.css";

const theme = createMuiTHeme({
  palette: {
    primary: {
      light: "#33c9dc",
      main: "#00bcd4",
      dark: "#008394",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff6333",
      main: "#ff3d00",
      dark: "#b22a00",
      contrastText: "#fff",
    },
  },
});

function App() {
  return (
    <MuiThemeProvider theme={theme}>
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
    </MuiThemeProvider>
  );
}

export default App;
