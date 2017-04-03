/* eslint dot-notation: 0 */
/* eslint-disable no-undef */
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Fixtures from "/server/imports/fixtures";
import { Reaction } from "/server/api";
import { StaticPages } from "/lib/collections";

Fixtures();

describe("Core static pages methods", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    // StaticPages = Factory.create("staticPage");
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("Manage Static Pages", function () {
    beforeEach(function () {
      StaticPages.remove({});
    });

    it("should create new staticPage for valid input", function () {
      sandbox.stub(Meteor, "userId", () => "12345678");
      sandbox.stub(Reaction, "hasOwnerAccess", () => true);
      Meteor.call("insertPage", "title", "slug", "content", "shopId", "12345678", new Date());
      const newStaticPage = StaticPages.find({pageOwner: "12345678"}).count();
      expect(newStaticPage).to.equal(1);
    });
    it("should update a staticPage with valid input", function () {
      sandbox.stub(Meteor, "userId", () => "12345678");
      sandbox.stub(Reaction, "hasOwnerAccess", () => true);
      Meteor.call("insertPage", "title", "slug", "content", "shopId", "12345678", new Date());
      const newStaticPage = StaticPages.find({pageOwner: "12345678"}).fetch();
      Meteor.call("updatePage", newStaticPage[0]._id, "newtitle", "newslug", "newcontent", "shopId");
      const updatedStaticPage = StaticPages.find({pageOwner: "12345678"}).fetch();
      expect(updatedStaticPage[0].title).to.equal("newtitle");
      expect(updatedStaticPage[0].slug).to.equal("newslug");
      expect(updatedStaticPage[0].content).to.equal("newcontent");
    });
    it("should delete a staticPage based on specified id", function () {
      sandbox.stub(Meteor, "userId", () => "12345678");
      sandbox.stub(Reaction, "hasOwnerAccess", () => true);
      Meteor.call("insertPage", "title", "slug", "content", "shopId", "12345678", new Date());
      const newStaticPage = StaticPages.find({pageOwner: "12345678"}).fetch();
      Meteor.call("deletePage", newStaticPage[0]._id);
      const deletedStaticPage = StaticPages.find({_id: newStaticPage[0]._id}).fetch();
      expect(deletedStaticPage[0]).to.be.undefined;
    });
  });
})