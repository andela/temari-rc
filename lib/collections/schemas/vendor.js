/* eslint-disable consistent-return */
import { SimpleSchema } from "meteor/aldeed:simple-schema";

/**
 * Reaction Schemas Address
 */

export const Vendor = new SimpleSchema({
  _id: {
    type: String,
    label: "Vendor Id",
    optional: true
  },
  shopName: {
    type: String,
    label: "Shop Name"
  },
  shopActive: {
    type: Boolean,
    label: "Shop Active",
    defaultValue: false
  },
  shopPhone: {
    label: "Shop Phone",
    type: String,
    optional: true
  },
  shopAddress: {
    label: "Shop Address",
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      return new Date;
    }
  }
});