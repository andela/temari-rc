/* eslint camelcase: 0 */
/* eslint no-undef: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Cart, Shops, Accounts, Packages } from "/lib/collections";
import "./paystack.html";

const getExchangeRate = () => {
  const shop = Shops.find(Reaction.getShopId()).fetch();
  return shop[0].currencies.NGN.rate;
};

const generateTransactionID = () => {
  // generate a random 16 digit id for the transaction
  return Random.id(16);
};

const getOrderPrice = () => {
  const cart = Cart.findOne();
  const exchangeRate = getExchangeRate();
  return parseInt(cart.cartTotal() * exchangeRate, 10);
};

const getPayStackSettings = () => {
  return Packages.findOne({
    name: "paystack-paymentmethod",
    shopId: Reaction.getShopId()
  });
};

const finalizePayment = (payStackMethod) => {
  Meteor.call("cart/submitPayment", payStackMethod);
};

handlePayment = (transactionId, type) => {
  const payStackConfig = getPayStackSettings();
  HTTP.call("GET", `https://api.paystack.co/transaction/verify/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${payStackConfig.settings.secretKey}`
    }
  }, (error, response) => {
    if (error) {
      Alerts.toast("Unable to verify payment", "error");
    } else if (response.data.data.status !== "success") {
      Alerts.toast("Payment was not successful", "error");
    } else {
      const exchangeRate = getExchangeRate();
      const paystackResponse = response.data.data;
      const paystackMethod = {
        processor: "Paystack",
        storedCard: paystackResponse.authorization.last4,
        method: "Paystack",
        transactionId: paystackResponse.reference,
        currency: paystackResponse.currency,
        amount: paystackResponse.amount * exchangeRate,
        status: paystackResponse.status,
        mode: "authorize",
        createdAt: new Date()
      };
      if (type === "payment") {
        paystackMethod.transactions = [];
        paystackMethod.transactions.push({
          amount: paystackResponse.amount,
          transactionId: paystackResponse.reference,
          currency: paystackResponse.currency
        });
        finalizePayment(paystackMethod);
      }
    }
  });
};

const payWithPaystack = (email, amount, transactionId) => {
  const payStackConfig = getPayStackSettings();
  const handler = PaystackPop.setup({
    key: payStackConfig.settings.publicKey,
    email: email,
    amount: amount * 100,
    ref: transactionId,
    callback: (response) => {
      handlePayment(response.reference, "payment");
    }
  });
  handler.openIframe();
};

Template.paystackPaymentForm.events({
  "click #paywithpaystack": (event) => {
    event.preventDefault();
    const accountDetails = Accounts.find(Meteor.userId()).fetch();
    const userMail = accountDetails[0].emails[0].address;
    const amount = getOrderPrice();
    const transactionId = generateTransactionID();
    const mailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/i;
    if (!mailRegex.test(userMail)) {
      Alerts.toast("Invalid email address", "error");
      return false;
    }
    payWithPaystack(userMail, amount, transactionId);
  }
});

Template.paystackPaymentForm.helpers({
  PaystackSchema() {
    return PaystackSchema;
  }
});
