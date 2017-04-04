/* eslint camelcase: 0 */
// meteor modules
import { Meteor } from "meteor/meteor";
// reaction modules
import { Reaction, Logger } from "/server/api";
import { Packages } from "/lib/collections";

Meteor.methods({
  "paystackMethod": function getPayStackSettings() {
    const packages = Packages.findOne({
      name: "paystack-paymentmethod",
      shopId: Reaction.getShopId()
    });
    return packages;
  }
});
