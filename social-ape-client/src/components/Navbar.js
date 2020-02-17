import React, { Component } from 'react';
import {Link} from 'react-router-dom';

// Material UI stuff
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';

class Navbar extends Component {
	render() {
		return (
			<AppBar>
				<Toolbar className="nav-container">
					<Button color="inherit" title="Login" component={Link} to="/login">Login</Button>
					<Button color="inherit" title="Home" component={Link} to="/">Home</Button>
					<Button color="inherit" title="Signup" component={Link} to="/signup">Signup</Button>
				</Toolbar>
			</AppBar>
		);
	}
}

export default Navbar;
