import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import jwtDecode from 'jwt-decode';
import axios from 'axios';

// Redux
import { Provider } from 'react-redux';
import store from './redux/store';
import { SET_AUTHENTICATED } from './redux/types';

//Components
import NavBar from './components/Navbar';
import themeObject from './util/theme';
import AuthRoute from './util/AuthRoute';

// Pages
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import { logoutUser, getUserData } from './redux/actions/userActions';

import './App.css';

const theme = createMuiTheme(themeObject);

const token = localStorage.FBIdToken;

if (token) {
  const decodedToken = jwtDecode(token);
	if (decodedToken.exp * 1000 < Date.now()) {
		store.dispatch(logoutUser());   
		window.location.href = '/login';	
  } else {    
		store.dispatch({ type: SET_AUTHENTICATED });
		axios.defaults.headers.common['Authorization'] = token;
		store.dispatch(getUserData());
  }
}

class App extends Component {

  render() {
    return (
			<MuiThemeProvider theme={theme}>
				<Provider store={store}>					
					<BrowserRouter>
						<NavBar />
						<div className="container">
							<Switch>
								<Route exact path="/" component={Home} />
								<AuthRoute exact path="/login" component={Login} />
								<AuthRoute exact path="/signup" component={Signup} />
							</Switch>
						</div>
					</BrowserRouter>				
				</Provider>
      </MuiThemeProvider>
    );
  }

}

export default App;
