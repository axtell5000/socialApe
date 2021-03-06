import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import PostScream from "../scream/PostScream";
import AppButton from "../../util/AppButton";
import Notifications from './Notifications';

// MUI stuff - more effecient doing it like this
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";

// MUI Icons
import HomeIcon from "@material-ui/icons/Home";

class Navbar extends Component {
  render() {
    const { authenticated } = this.props;
    return (
      <AppBar>
        <Toolbar className="nav-container">
          {authenticated ? (
            <Fragment>
              <PostScream />
              <Link to="/">
                <AppButton tip="Home">
                  <HomeIcon />
                </AppButton>
              </Link>
              <Notifications />
              
            </Fragment>
          ) : (
            <Fragment>
              <Button
                color="inherit"
                title="Login"
                component={Link}
                to="/login"
              >
                Login
              </Button>
              <Button color="inherit" title="Home" component={Link} to="/">
                Home
              </Button>
              <Button
                color="inherit"
                title="Signup"
                component={Link}
                to="/signup"
              >
                Signup
              </Button>
            </Fragment>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

Navbar.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  authenticated: state.user.authenticated,
});

export default connect(mapStateToProps)(Navbar);
