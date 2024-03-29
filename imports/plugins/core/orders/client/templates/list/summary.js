import { Reaction } from "/client/api";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { NumericInput } from "/imports/plugins/core/ui/client/components";
import swal from "sweetalert2";

Template.ordersListSummary.onCreated(function () {
  this.orders = new ReactiveVar();
  this.autorun(() => {
    const instance = this;
    instance.orders.set(Template.currentData().order);
  });
});
/**
 * ordersListSummary helpers
 *
 * @returns paymentInvoice
 */
Template.ordersListSummary.helpers({
  invoice() {
    return this.invoice;
  },

  numericInputProps(value) {
    const { currencyFormat } = Template.instance().data;

    return {
      component: NumericInput,
      value,
      format: currencyFormat,
      isEditing: false
    };
  }
});
Template.ordersListSummary.events({
  "click #cancelOrder": (event) => {
    event.preventDefault();
    const order = Template.instance().orders.get();
    // Make a method call to the server-side to cancel order.
    Meteor.call("orders/cancelOrder", order, (err, result) => {
      // result returns 1 if cancel order is succesful and 0 if false.
      if (result === 1) {
        swal("", "Order Canceled", "success").then(function () {
          return Reaction.Router.go("/");
        });
      } else {
        swal("", "Unable to Cancel", "error");
      }

      Meteor.call("orders/inventoryAdjust", order._id, "cancel");
    });
  }
});
