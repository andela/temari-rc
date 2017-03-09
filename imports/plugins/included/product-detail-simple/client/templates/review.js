/* eslint-disable consistent-return, no-undef */
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import "./review.html";
import { Reviews } from "/lib/collections";
import { Products } from "/lib/collections";

const review = {};
Template.productReview.events({
  "click .stars": () => {
    const rating = $('#rating').data('userrating');
    review.rating = rating;
  },
  "click #send": () => {
    review.comment = document.getElementById("comment").value;
    if (review.comment === "") {
      Alerts.toast("Please enter comment", "error");
      return false;
    }
    this.productId = () => Reaction.Router.getParam("handle");
    review.productId = Products.findOne(this.productId)._id;
    try {
      review.username = Meteor.user().username || Meteor.user().emails[0].address;
      review.dateCreated = new Date;
      Meteor.call("insert/review", review, function (error) {
        if (error) {
          return error;
        }
      });
      document.getElementById("comment").value = "";
    }    catch (error) {
      Alerts.toast("You need to sign in to post a review", "error");
    }
  }
});

Template.showReviews.helpers({
  reviews: () => {
    this.productId = () => Reaction.Router.getParam("handle");
    const productId = Products.findOne(this.productId)._id;
    Meteor.subscribe("Reviews");
    return Reviews.find({productId: productId}).fetch();
  }
});