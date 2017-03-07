import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

const validationMethods = {
  /**
   * Username validation
   * @summary Determins if a username meets the minimum requirement of 3 characters
   * @param  {String} username Username to validate
   * @return {Boolean|Object} true if valid, error object if invalid
   */
  username(username) {
    check(username, Match.OptionalOrNull(String));

    // Valid
    if (username.length >= 3) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_USERNAME",
      reason: "Username must be at least 3 characters long",
      i18nKeyReason: "accountsUI.error.usernameMinLength"
    };
  },

  /**
   * Email validation
   * @summary Validates both required and optional email addresses.
   * @param  {String} email Email address to validate
   * @param  {Boolean} optional If set to true, validation will pass if email is blank
   * @return {Boolean|Object} Returns true if valid; Returns an error object if invalid
   */
  email(email, optional) {
    check(email, Match.OptionalOrNull(String));
    check(optional, Match.OptionalOrNull(Boolean));

    const processedEmail = email.trim();

    // Valid
    if (optional === true && processedEmail.length === 0) {
      return true;
    } else if (processedEmail.indexOf("@") !== -1) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_EMAIL",
      reason: "Email address is invalid",
      i18nKeyReason: "accountsUI.error.invalidEmail"
    };
  },

  /**
   * Password validation
   * Passwords may be validated 2 ways.
   * "exists" (options.validationLevel = "exists") - Password must not be blank. Thats is the only rule. Used to validate a sign in.
   * undefined (options.validationLevel = undefined) - Password must meet the lenght and other criteria to validate. Used for validating a new sign up.
   * @param  {String} password Password to validate
   * @param  {Object} options Options to apply to the password validator
   * @param  {String} options.validationLevel "exists" | undefined (default)
   * @return {Boolean|[{error: String, reason: String}]} true if valid | Error object otherwise
   */
  password(password, options) {
    check(password, Match.OptionalOrNull(String));
    check(options, Match.OptionalOrNull(Object));

    const passwordOptions = options || {};
    const errors = [];

    // Only check if a password has been entered at all.
    // This is usefull for the login forms
    if (passwordOptions.validationLevel === "exists") {
      if (password.length > 0) {
        return true;
      }

      errors.push({
        error: "INVALID_PASSWORD",
        reason: "Password is required",
        i18nKeyReason: "accountsUI.error.passwordRequired"
      });
    } else {
      // Validate the password on some rules
      // This is useful for cases where a password needs to be created or updated.
      if (password.length < 6) {
        errors.push({
          error: "INVALID_PASSWORD",
          reason: "Password must be at least 6 characters long.",
          i18nKeyReason: "accountsUI.error.passwordMustBeAtLeast6CharactersLong"
        });
      }
    }

    if (errors.length) {
      return errors;
    }

    // Otherwise the password is valid
    return true;
  },

  /**
   * ShopName validation
   * @summary Determins if a username meets the minimum requirement of 3 characters
   * @param  {String} shopName Username to validate
   * @return {Boolean|Object} true if valid, error object if invalid
   */
  shopName(shopName) {
    check(shopName, Match.OptionalOrNull(String));

    const nameExist = Accounts.find({ "profile.vendorDetails.[0].shopName": shopName }).fetch();
    if (nameExist.length > 0) {
      // Invalid
      return {
        error: "INVALID_SHOPNAME",
        reason: "Shop Name already Exist",
        i18nKeyReason: "Shop Name already Exist"
      };
    }

    // Valid
    if (/\w+/g.test(shopName) && shopName.length <= 15) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_SHOPNAME",
      reason: "Shop Name must be max of 15 characters Long and Contain No special Characters",
      i18nKeyReason: "Shop Name must be max of 15 characters Long and Contain No special Characters"
    };
  },

  /**
   * ShopPhone validation
   * @summary Determins if a username meets the minimum requirement of 3 characters
   * @param  {String} username Username to validate
   * @return {Boolean|Object} true if valid, error object if invalid
   */
  shopPhone(shopPhone) {
    check(shopPhone, Match.OptionalOrNull(String));

    // Valid
    try {
      phoneUtil.isValidNumber(phoneUtil.parse(shopPhone));
      return true;
    } catch (err) {
      return {
        error: "INVALID_SHOPPHONE",
        reason: "Invalid Phone Number",
        i18nKeyReason: "Invalid Phone Number"
      };
    }
  },
  /**
   * ShopAddress validation
   * @summary Determins if a shopAddress meets the minimum requirement of 3 characters
   * @param  {String} shopAddress Username to validate
   * @return {Boolean|Object} true if valid, error object if invalid
   */
  shopAddress(shopAddress) {
    check(shopAddress, Match.OptionalOrNull(String));

    // Valid
    if (/\w+/g.test(shopAddress) && shopAddress.length <= 250) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_SHOPADDRESS",
      reason: "Invalid Shop Address",
      i18nKeyReason: "Invalid Shop Address"
    };
  }
};

// Export object globally
LoginFormValidation = validationMethods;

// Register validation methods as meteor methods
Meteor.methods({
  "accounts/validation/username": validationMethods.username,
  "accounts/validation/email": validationMethods.email,
  "accounts/validation/password": validationMethods.password
});