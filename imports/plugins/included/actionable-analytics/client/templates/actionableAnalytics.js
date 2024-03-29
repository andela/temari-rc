import _ from "lodash";
import { Template } from "meteor/templating";
import { Orders, ProductSearch } from "/lib/collections";
import { formatPriceString } from "/client/api";
import { ReactiveDict } from "meteor/reactive-dict";
import Chart from "chart.js";

let myChart;
let otherChart;
/**
 * Function to fetch the total of all sales made
 * @param {Array} allOrders - Array containing all the orders
 * @return {Object} - an Object containing the necessary overview details
 */
function extractAnalyticsItems(allOrders) {
  let totalSales = 0;
  let ordersCancelled = 0;
  let totalItemsPurchased = 0;
  let totalShippingCost = 0;
  const analytics = {};
  const analyticsStatement = {};
  const ordersAnalytics = [];
  allOrders.forEach((order) => {
    const orderDate = order.createdAt;
    const dateString = orderDate.toISOString().split("T")[0];
    if (order.workflow.status !== "canceled") {
      ordersAnalytics.push({
        date: dateString,
        country: order.billing[0].address.region,
        city: order.billing[0].address.city,
        paymentProcessor: order.billing[0].paymentMethod.processor,
        shipping: order.billing[0].invoice.shipping,
        taxes: order.billing[0].invoice.taxes
      });
      totalSales += order.billing[0].invoice.subtotal;
      totalItemsPurchased += order.items.length;
      totalShippingCost += order.billing[0].invoice.shipping;
      order.items.forEach((item) => {
        if (analytics[item.title]) {
          analytics[item.title].quantitySold += item.quantity;
          analytics[item.title].totalSales += item.variants.price;
        } else {
          analytics[item.title] = {
            quantitySold: item.quantity,
            totalSales: item.variants.price
          };
        }
        const uniqueStamp = `${dateString}::${item.title}`;
        if (analyticsStatement[uniqueStamp] && analyticsStatement[uniqueStamp].title === item.title) {
          analyticsStatement[uniqueStamp].totalSales += item.variants.price;
          analyticsStatement[uniqueStamp].quantity += item.quantity;
        } else {
          analyticsStatement[uniqueStamp] = {
            title: item.title,
            quantity: item.quantity,
            dateString,
            totalSales: item.variants.price
          };
        }
      });
    } else {
      ordersCancelled += 1;
    }
  });
  return { totalSales, totalItemsPurchased, totalShippingCost, analytics, analyticsStatement, ordersAnalytics, ordersCancelled };
}

/**
 * Helper function to calculate the differnce (in days)
 * between 2 dates
 * @param{Object} date1 - older date1 in milliseconds
 * @param{Object} date2 - recent date in milliseconds
 * @return{Number} - Difference between date2 and date1 in days (Number of days between date2 and date1)
 */
function daysDifference(date1, date2) {
  // a Day represented in milliseconds

  const oneDay = 1000 * 60 * 60 * 24;
  // Calculate the difference in milliseconds
  const difference = new Date(new Date(date2).setHours(23)) - new Date(new Date(date1).setHours(0));
  // Convert back to days and return
  return Math.round(difference / oneDay);
}

/**
 * Helper method to set up the average sales total
 * @param{Number} totalSales - total sales
 * @param{Date} fromDate - start date
 * @param{toDate} toDate - end date
 * @return{Number} sales per day
 */
function setUpAverageSales(totalSales, fromDate, toDate) {
  const difference = daysDifference(Date.parse(fromDate), Date.parse(toDate));
  salesPerDay = difference === 0 ? totalSales : totalSales / difference;
  return salesPerDay;
}

Template.actionableAnalytics.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    ordersPlaced: 0,
    beforeDate: new Date(),
    afterDate: new Date(),
    totalSales: 0,
    totalItemsPurchased: 0,
    totalShippingCost: 0,
    salesPerDay: 0,
    ordersCancelled: 0,
    analytics: {},
    analyticsStatement: {},
    ordersAnalytics: [],
    productsAnalytics: []
  });
  const self = this;
  self.autorun(() => {
    const orderSub = self.subscribe("Orders");
    if (orderSub.ready()) {
      const allOrders = Orders.find({
        createdAt: {
          $gte: new Date(self.state.get("beforeDate").setHours(0)),
          $lte: new Date(self.state.get("afterDate").setHours(23))
        }
      }).fetch();
      if (allOrders) {
        const analyticsItems = extractAnalyticsItems(allOrders);
        self.state.set("ordersPlaced", allOrders.length);
        self.state.set("totalSales", analyticsItems.totalSales);
        self.state.set("totalItemsPurchased", analyticsItems.totalItemsPurchased);
        self.state.set("totalShippingCost", analyticsItems.totalShippingCost);
        self.state.set("analytics", analyticsItems.analytics);
        self.state.set("analyticsStatement", analyticsItems.analyticsStatement);
        self.state.set("ordersAnalytics", analyticsItems.ordersAnalytics);
        self.state.set("ordersCancelled", analyticsItems.ordersCancelled);
        self.state.set("salesPerDay",
          setUpAverageSales(self.state.get("totalSales"),
            self.state.get("beforeDate"),
            self.state.get("afterDate")));
      }
    }
  });
});

const display = () => {
  const ctx = document.getElementById("ProductChart");
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Products Sold',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
};
const render = () => {
  const ctx = document.getElementById("EarningChart");
  otherChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Products Sold',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
};

Template.actionableAnalytics.onRendered(() => {
  const instance = Template.instance();
  let fromDatePicker = {};
  const toDatePicker = new Pikaday({
    field: $("#todatepicker")[0],
    format: "DD/MM/YYYY",
    onSelect: function () {
      const nextDate = this.getDate();
      instance.state.set("afterDate", nextDate);
    }
  });

  fromDatePicker = new Pikaday({
    field: $("#fromdatepicker")[0],
    format: "DD/MM/YYYY",
    onSelect: function () {
      toDatePicker.setMinDate(this.getDate());
      const nextDate = this.getDate();
      if (Date.parse(toDatePicker.getDate()) < Date.parse(nextDate)) {
        toDatePicker.setDate(nextDate);
      } else {
        instance.state.set("beforeDate", this.getDate());
      }
    }
  });
  fromDatePicker.setMaxDate(new Date());
  toDatePicker.setMaxDate(new Date());
  fromDatePicker.setDate(new Date());
  toDatePicker.setDate(fromDatePicker.getDate());
  display();
  render();
});

Template.actionableAnalytics.helpers({
  ordersPlaced() {
    const instance = Template.instance();
    const orders = instance.state.get("ordersPlaced");
    return orders - Template.instance().state.get("ordersCancelled");
  },
  totalSales() {
    const instance = Template.instance();
    return formatPriceString(instance.state.get("totalSales"));
  },
  totalItemsPurchased() {
    const instance = Template.instance();
    return instance.state.get("totalItemsPurchased");
  },
  totalShippingCost() {
    const instance = Template.instance();
    return formatPriceString(instance.state.get("totalShippingCost"));
  },
  salesPerDay() {
    const instance = Template.instance();
    return formatPriceString(instance.state.get("salesPerDay"));
  },
  bestSelling() {
    const products = [];
    const instance = Template.instance();
    const analytics = instance.state.get("analytics");


    for (const key in analytics) {
      if (key) {
        products.push({
          product: key,
          quantitySold: analytics[key].quantitySold
        });
      }
    }
    let chartData = [];
    let chartProduct = [];
    products.forEach((arrayItem) => {
      chartProduct.push(arrayItem.product);
      chartData.push(arrayItem.quantitySold);
    });
    if (myChart) {
      myChart.config.data = {
        labels: chartProduct,
        datasets: [{
          label: 'Products Selling',
          data: chartData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      };
      myChart.update();
    }

    return _.orderBy(
      products,
      (product) => {
        return product.quantitySold;
      },
      "desc"
    );
  },
  topEarning() {
    const products = [];
    const instance = Template.instance();
    const analytics = instance.state.get("analytics");
    for (const key in analytics) {
      if (key) {
        products.push({
          product: key,
          salesSorter: analytics[key].totalSales,
          totalSales: formatPriceString(analytics[key].totalSales)
        });
      }
    }
    let earnData = [];
    let earnProduct = [];
    products.forEach((arrayItem) => {
      earnProduct.push(arrayItem.product);
      earnData.push(arrayItem.salesSorter);
    });
    if (myChart) {
      otherChart.config.data = {
        labels: earnProduct,
        datasets: [{
          label: 'Products Selling',
          data: earnData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      };
      otherChart.update();
    }
    return _.orderBy(
      products,
      (product) => {
        return product.salesSorter;
      },
      "desc"
    );
  },
  statements() {
    const statements = [];
    const instance = Template.instance();
    const analyticsStatement = instance.state.get("analyticsStatement");
    for (const key in analyticsStatement) {
      if (key) {
        statements.push(analyticsStatement[key]);
        analyticsStatement[key].totalSales = formatPriceString(analyticsStatement[key].totalSales);
      }
    }
    return _.orderBy(
      statements,
      (statement) => {
        return Date.parse(statement.dateString);
      },
      "desc");
  },
  orders() {
    const instance = Template.instance();
    const orders = instance.state.get("ordersAnalytics");
    return _.orderBy(
      orders,
      (order) => {
        order.taxes = formatPriceString(order.taxes);
        order.shipping = formatPriceString(order.shipping);
        return Date.parse(order.date);
      },
      "desc"
    );
  },
  products() {
    const instance = Template.instance();
    const productsAnalytics = instance.state.get("productsAnalytics");
    return _.orderBy(productsAnalytics,
      (product) => {
        return product.views;
      },
      "desc"
    );
  },
  ordersCancelled() {
    return Template.instance().state.get("ordersCancelled");
  }
});
