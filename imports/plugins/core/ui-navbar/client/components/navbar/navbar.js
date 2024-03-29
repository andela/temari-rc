import { FlatButton } from "/imports/plugins/core/ui/client/components";
import { NotificationContainer } from "/imports/plugins/included/notifications/client/containers";
import { Reaction, Router } from "/client/api";
import { Tags, Accounts } from "/lib/collections";
import * as Collections from "/lib/collections";
import { playTour } from "/imports/plugins/included/tour/client/tour.js";


Template.CoreNavigationBar.onCreated(function () {
  this.state = new ReactiveDict();
  const searchPackage = Reaction.Apps({ provides: "ui-search" });
  if (searchPackage.length) {
    this.state.set("searchEnabled", true);
    this.state.set("searchTemplate", searchPackage[0].template);
  } else {
    this.state.set("searchEnabled", false);
  }
});

Template.CoreNavigationBar.onRendered(function () {
  currentRoute = Router.getRouteName();
  this.autorun(() => {
    if (Accounts.findOne(Meteor.userId())) {
      if (!Accounts.findOne(Meteor.userId()).takenTour && Accounts.findOne(Meteor.userId()).emails[0]) {
        playTour();
      }
    }
  });
});

/**
 * layoutHeader events
 */
Template.CoreNavigationBar.events({
  "click .navbar-accounts .dropdown-toggle": function () {
    return setTimeout(function () {
      return $("#login-email").focus();
    }, 100);
  },
  "click .header-tag, click .navbar-brand": function () {
    return $(".dashboard-navbar-packages ul li").removeClass("active");
  },
  "click .search": function () {
    const instance = Template.instance();
    const searchTemplateName = instance.state.get("searchTemplate");
    const searchTemplate = Template[searchTemplateName];
    Blaze.renderWithData(searchTemplate, {}, $("body").get(0));
    $("body").css("overflow", "hidden");
    $("#search-input").focus();
  },
  "click .notification-icon": function () {
    $("body").css("overflow", "hidden");
    $("#notify-dropdown").focus();
  }
});

Template.CoreNavigationBar.helpers({
  isSearchEnabled() {
    const instance = Template.instance();
    return instance.state.get("searchEnabled");
  },

  searchTemplate() {
    const instance = Template.instance();
    if (instance.state.get("searchEnabled")) {
      return instance.state.get("searchTemplate");
    }
  },
  shopDetails() {
    let account;
    if (Roles.userIsInRole(Meteor.userId(), ["vendor"], Reaction.shopId)) {
      account = Collections.Accounts.findOne({ userId: Meteor.userId() });
      return account.profile.vendorDetails[0];
    }
    return false;
  },
  IconButtonComponent() {
    return {
      component: FlatButton,
      icon: "fa fa-search",
      kind: "flat"
    };
  },
  notificationButtonComponent() {
    return {
      component: NotificationContainer
    };
  },
  staticPagesMenu() {
    return {
      component: FlatButton,
      kind: "flat",
      label: "More Pages"
    };
  },

  TourButtonComponent() {
    return {
      component: FlatButton,
      icon: "fa fa-blind",
      kind: "flat",
      onClick() {
        playTour();
      }
    };
  },

  onMenuButtonClick() {
    const instance = Template.instance();
    return () => {
      if (instance.toggleMenuCallback) {
        instance.toggleMenuCallback();
      }
    };
  },

  tagNavProps() {
    const instance = Template.instance();
    const tags = Tags.find({
      isTopLevel: true
    }, {
      sort: {
        position: 1
      }
    }).fetch();

    return {
      name: "coreHeaderNavigation",
      editable: Reaction.hasAdminAccess(),
      isEditing: true,
      tags: tags,
      onToggleMenu(callback) {
        // Register the callback
        instance.toggleMenuCallback = callback;
      }
    };
  }
});
