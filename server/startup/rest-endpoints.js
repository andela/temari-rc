import { Shops } from '/lib/collections';

// Items = new Mongo.Collection('items');
// Articles = new Mongo.Collection('articles');

if (Meteor.isServer) {
  // Global API configuration
  const Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  // Generates: GET, POST on /api/items and GET, PUT, PATCH, DELETE on
  // /api/items/:id for the Items collection
  Api.addCollection(Shops);

  // Generates: POST on /api/users and GET, DELETE /api/users/:id for
  // Meteor.users collection
}
