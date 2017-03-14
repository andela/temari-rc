import { Shops, Accounts, Cart, Orders, Products } from '/lib/collections';

export default () => {
  const Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  const apiOptions = (collection) => {
    return {
      routeOptions: {
        authRequired: true
      },
      endpoints: {
        put: {
          action: function () {
            if (Roles.userIsInRole(this.userId, ['owner', 'admin'])) {
              const isUpdated = collection.update(this.urlParams.id, {
                $set: this.bodyParams
              });
              if (isUpdated) {
                return { statusCode: 201, status: 'success', data: isUpdated }
              }
              return { status: 'fail', message: 'Record not found' }
            }
            return {
              statusCode: 403,
              message: 'You are not allowed to access this route '
            };
          }
        },
        delete: {
          roleRequired: 'admin'
        }
      }
    };
  };
  const productApi = (collection) => {
    return {
      routeOptions: {
        authRequired: true
      },
      endpoints: {
        post: {
          action: function () {
            if (Roles.userIsInRole(this.userId, ['createProduct'])) {
              const isUpdated = collection.insert(this.bodyParams);
              if (isUpdated) {
                return { statusCode: 201, status: 'success', data: isUpdated }
              }
              return { status: 'fail', message: 'Record not found' }
            }
            return {
              statusCode: 403,
              message: ' You are not allowed to access this route'
            };
          }
        },
        put: {
          action: function () {
            if (Roles.userIsInRole(this.userId, ['admin'])) {
              const isUpdated = Products.upsert(this.urlParams.id, {
                $set: this.bodyParams
              });
              if (isUpdated) {
                return { statusCode: 201, status: 'success', data: isUpdated };
              }
              return { status: 'fail', message: 'Product not found' }
            }
            return {
              statusCode: 403,
              message: ' You are not allowed to access this route'
            };
          }
        },
        delete: {
          roleRequired: 'admin'
        }
      }
    };
  };
  Api.addCollection(Shops, apiOptions(Shops));
  Api.addCollection(Accounts, apiOptions(Accounts));
  Api.addCollection(Orders, apiOptions(Orders));
  Api.addCollection(Cart, apiOptions(Cart));
  Api.addCollection(Products, productApi(Products));
};
