import { Shops,  Accounts, Cart, Orders, Products } from '/lib/collections';

export default () => {
  const Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  const additional = (collection) => {
    return {
      routeOptions: {
        authRequired: true
      },
      endpoints: {
        put: {
          roleRequired: ['owner', 'admin'],
          action: () => {
            const isUpdated = collection.update(this.urlParams.id, {
              $set: this.bodyParams
            });
            if (isUpdated) {
              return { statusCode: 201, status: 'success', data: isUpdated }
            }
            return { status: 'fail', message: 'Record not found' }
          }
        },

        delete: {
          roleRequired: 'admin'
        }
      }
    };
  };
  Api.addCollection(Shops, additional(Shops));
  Api.addCollection(Accounts, additional(Accounts));
  Api.addCollection(Cart, additional(Cart));
  Api.addCollection(Orders, additional(Orders));
  Api.addCollection(Products, additional(Products));
};
