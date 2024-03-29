import { ProductDetailContainer } from "../containers";
import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";
import { ReactiveDict } from "meteor/reactive-dict";

Template.productDetailSimple.onDestroyed(() => {
  const handle = this.state.get("handle");
  if (handle) {
    Meteor.call("products/updateViews", handle);
  }
});

Template.productDetailSimple.onCreated(() => {
  this.state = new ReactiveDict();
  this.state.setDefault({
    handle: ""
  });
  this.state.set("handle", Reaction.Router.current().params.handle);
});

Template.productDetailSimple.helpers({
  isEnabled() {
    return isRevisionControlEnabled();
  },
  PDC() {
    return ProductDetailContainer;
  }
});
// Template.disqus.helpers({
//   getDisqus() {
//     const script = document.createElement("script");
//     script.src = "//anbu-rc.disqus.com/embed.js";
//     script.setAttribute("data-timestamp", +new Date());
//     (document.head || document.body).appendChild(script);
//   }
// });
