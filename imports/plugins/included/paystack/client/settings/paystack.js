/* eslint no-undef: 0 */
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { PaystackPackageConfig } from "../../lib/collections/schema";

import "./paystack.html";

Template.paystackSettings.helpers({
  PaystackPackageConfig() {
    return PaystackPackageConfig;
  },
  packageData() {
    return Packages.findOne({
      name: "paystack-paymentmethod",
      shopId: Reaction.getShopId()
    });
  }
});

AutoForm.hooks({
  "paystack-update-form": {
    onSuccess: () => {
      Alerts.removeSeen();
      return Alerts.add("Paystack settings saved.", "success");
    },
    onError: (operation, error) => {
      Alerts.removeSeen();
      return Alerts.add(`Paystack settings update failed. ${error}`, "danger");
    }
  }
});
