import { Template } from "meteor/templating";
import { localeDep, i18nextDep } from  "./main";
import { formatPriceString } from "./currency";
import { Reaction, Logger, i18next } from "/client/api";

/**
 * i18n
 * see: http://i18next.com/
 * pass the translation key as the first argument
 * and the default message as the second argument
 * @param {String} i18nKey - i18nKey
 * @param {String} i18nMessage - message text
 * @example {{i18n "accountsTemplate.error" "Invalid Email"}}
 * @return {String} returns i18n translated message
 */
Template.registerHelper("i18n", function (i18nKey, i18nMessage) {
  if (!i18nKey || typeof i18nMessage !== "string") {
    Logger.info("i18n key string required to translate", i18nKey, i18nMessage);
    return "";
  }
  check(i18nKey, String);
  check(i18nMessage, String);

  i18nextDep.depend();

  // const message = new Spacebars.SafeString(i18nMessage);

  // returning translated key
  return i18next.t(i18nKey, { defaultValue: i18nMessage });
});

/**
 * currencySymbol
 * @summary return shop /locale specific currency format (ie: $)
 * @returns {String} return current locale currency symbol
 */
Template.registerHelper("currencySymbol", function () {
  const locale = Reaction.Locale.get();
  return locale.currency.symbol;
});

/**
 * formatPrice
 * @summary return shop /locale specific formatted price
 * also accepts a range formatted with " - "
 * @param {String} currentPrice - currentPrice or "xx.xx - xx.xx" formatted String
 * @return {String} returns locale formatted and exchange rate converted values
 */
Template.registerHelper("formatPrice", function (formatPrice) {
  localeDep.depend();
  return formatPriceString(formatPrice);
});
