import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

// MUI Icons
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";

// Redux
import { connect } from "react-redux";
import { likeScream, unlikeScream } from "../../redux/actions/dataActions";

import AppButton from "../../util/AppButton";

class LikeButton extends Component {
  likedScream = () => {
    if (
      this.props.user.likes &&
      this.props.user.likes.find(
        (like) => like.screamId === this.props.screamId
      )
    ) {
      return true;
    } else {
      return false;
    }
  };

  likeScream = () => {
    // console.log(this.props.scream.screamId, "yoyoy");
    this.props.likeScream(this.props.screamId);
  };
  unlikeScream = () => {
    this.props.unlikeScream(this.props.screamId);
  };

  render() {
    const { authenticated } = this.props.user;
    const likesButton = !authenticated ? (
      <Link to="/login">
        <AppButton tip="Like">
          <FavoriteBorder color="primary" />
        </AppButton>
      </Link>
    ) : this.likedScream() ? (
      <AppButton tip="Undo like" onClick={this.unlikeScream}>
        <FavoriteIcon color="primary" />
      </AppButton>
    ) : (
      <AppButton tip="Like" onClick={this.likeScream}>
        <FavoriteBorder color="primary" />
      </AppButton>
    );

    return likesButton;
  }
}

LikeButton.propTypes = {
  user: PropTypes.object.isRequired,
  screamId: PropTypes.string.isRequired,
  likeScream: PropTypes.func.isRequired,
  unlikeScream: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapActionsToProps = {
  likeScream,
  unlikeScream,
};

export default connect(mapStateToProps, mapActionsToProps)(LikeButton);
