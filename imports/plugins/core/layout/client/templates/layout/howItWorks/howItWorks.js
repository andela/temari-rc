import { Reaction } from "/client/api";
import {Route} from "/client/api";

/**
 * layoutHeader events
 */
Template.layoutHowItWorks.events({
  "click .onboarding_register_btn": function () {
    return setTimeout(function () {
      return $("#login-email").focus();
    }, 100);
  }
});

Template.layoutHowItWorks.helpers({
  isLanding() {
    const routeName = Reaction.Router.getRouteName();
    let yes = false;
    console.log(routeName,"routeName");
    if (routeName === "index"){
      yes = true;
    }
    return yes;
  }
});
