import React, { Component, PropTypes } from "react";
import { Alert, Translation } from "/imports/plugins/core/ui/client/components";


class AddToCartButton extends Component {
  get hasVariants() {
    console.log(this.props.variants, 'variants');
    return Array.isArray(this.props.variants) && this.props.variants.length > 0;
  }
  hanleCartQuantityChange = (event) => {
    if (this.props.onCartQuantityChange) {
      this.props.onCartQuantityChange(event, event.target.value);
    }
  }

  render() {
    if (this.hasVariants) {
      return (
        <div className="pdp add-to-cart block">
          <input
            className="form-control input-md"
            id="add-to-cart-quantity"
            min="1"
            name="addToCartQty"
            onChange={this.hanleCartQuantityChange}
            type={this.props.inputType}
            value={this.props.cartQuantity}
          />
          <button
            className="input-group-addon add-to-cart-text js-add-to-cart"
            data-i18n="productDetail.addToCart"
            onClick={this.props.onClick || this.props.onAddToCart}
          >
            <Translation defaultValue="Add to cart" i18nKey="productDetail.addToCart" />
          </button>
        </div>
      );
    }

    if (this.props.editable && this.hasVariants === false) {
      return (
        <Alert>
          <Translation defaultValue="Add options to enable 'Add to Cart' button" i18nkey="productVariant.addVariantOptions" />
        </Alert>
      );
    }
    return null;
  }
}

AddToCartButton.propTypes = {
  cartQuantity: PropTypes.number,
  inputType: PropTypes.string,
  editable: PropTypes.bool,
  onAddToCart: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  onClick: PropTypes.func,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default AddToCartButton;
