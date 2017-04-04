import { StaticPages } from "/lib/collections";
import { Meteor } from "meteor/meteor";

Meteor.publish("staticPages", function () {
  return StaticPages.find({
    pageOwner: this.userId
  });
});

Meteor.publish("viewPages", function () {
  return StaticPages.find();
});
