import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import * as Collections from "/lib/collections";

Meteor.methods({

  "vendor/activateVendor" (memberId) {
    check(memberId, String);

    Collections.Accounts.update({
      userId: memberId
    }, {
      $set: {
        "profile.vendorDetails.0.shopActive": true,
        "profile.vendorDetails.0._id": memberId
      }
    });
  },
  "vendor/deactivateVendor" (memberId) {
    check(memberId, String);

    Collections.Accounts.update({
      userId: memberId
    }, {
      $set: {
        "profile.vendorDetails.0.shopActive": false
      }
    });
  },
  "vendor/getVendorId" () {
    const profile = Collections.Accounts.find({ userId: Meteor.userId() }).fetch();
    if (profile.length > 0 && profile[0].profile !== undefined && profile[0].profile.vendorDetails !== undefined) {
      return (profile[0].profile.vendorDetails[0]._id);
    }
    throw new Meteor.Error(500, "Vendor Id Not Found", "Vendor");
  },
  "vendor/getVendorDetails" () {
    const profile = Collections.Accounts.find({ userId: Meteor.userId() }).fetch();
    if (profile.length > 0 && profile[0].profile !== undefined && profile[0].profile.vendorDetails !== undefined) {
      return (profile[0].profile.vendorDetails[0]);
    }
    throw new Meteor.Error(500, "Vendor Details Not Found", "Vendor");
  },
  "vendor/getVendorDetailsbyShopName" (shopName) {
    check(shopName, String);
    const vendor = Collections.Accounts.find({ "profile.vendorDetails.0.shopName": shopName }).fetch();
    if (vendor.length > 0 && vendor[0].profile !== undefined && vendor[0].profile.vendorDetails !== undefined) {
      return (vendor[0].profile.vendorDetails[0]);
    }
    throw new Meteor.Error(500, "Vendor Details Not Found", "Vendor");
  },
  "vendor/updateDetails" (vendorDetails) {
    check(vendorDetails, Object);
    Collections.Accounts.update({
      userId: Meteor.userId()
    }, {
      $set: {
        "profile.vendorDetails[0]": vendorDetails
      }
    });
  },
  "vendor/upgradeToVendor" (vendorDetails) {
    check(vendorDetails, Object);
    Collections.Accounts.upsert({
      userId: Meteor.userId()
    }, {
      $set: {
        profile: vendorDetails
      }
    });
  }


});