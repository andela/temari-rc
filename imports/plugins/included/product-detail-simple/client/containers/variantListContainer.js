import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { ReactionProduct } from "/lib/api";
import { Reaction } from "/client/api";
import { VariantList } from "../components";
import { getChildVariants } from "../selectors/variants";
import { Products, Media } from "/lib/collections";
import update from "react/lib/update";
import { getVariantIds } from "/lib/selectors/variants";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";

function variantIsSelected(variantId) {
  const current = ReactionProduct.selectedVariant();
  if (current && typeof current === "object" && (variantId === current._id || ~current.ancestors.indexOf(variantId))) {
    return true;
  }

  return false;
}

function variantIsInActionView(variantId) {
  const actionViewVariant = Reaction.getActionView().data;

  if (actionViewVariant) {
    // Check if the variant is selected, and also visible & selected in the action view
    return variantIsSelected(variantId) && variantIsSelected(actionViewVariant._id) && Reaction.isActionViewOpen();
  }

  return false;
}

function getTopVariants() {
  let inventoryTotal = 0;
  const variants = ReactionProduct.getTopVariants();
  if (variants.length) {
    // calculate inventory total for all variants
    for (const variant of variants) {
      if (variant.inventoryManagement) {
        const qty = ReactionProduct.getVariantQuantity(variant);
        if (typeof qty === "number") {
          inventoryTotal += qty;
        }
      }
    }
    // calculate percentage of total inventory of this product
    for (const variant of variants) {
      const qty = ReactionProduct.getVariantQuantity(variant);
      variant.inventoryTotal = inventoryTotal;
      if (variant.inventoryManagement && inventoryTotal) {
        variant.inventoryPercentage = parseInt(qty / inventoryTotal * 100, 10);
      } else {
        // for cases when sellers doesn't use inventory we should always show
        // "green" progress bar
        variant.inventoryPercentage = 100;
      }
      if (variant.title) {
        variant.inventoryWidth = parseInt(variant.inventoryPercentage -
          variant.title.length, 10);
      } else {
        variant.inventoryWidth = 0;
      }
    }
    // sort variants in correct order
    variants.sort((a, b) => a.index - b.index);

    return variants;
  }
  return [];
}

function isSoldOut(variant) {
  return ReactionProduct.getVariantQuantity(variant) < 1;
}

class VariantListContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isDigital: true
    };
  }
  componentWillReceiveProps() {
    this.setState({});
  }

  get variants() {
    return (this.state && this.state.variants) || this.props.variants;
  }

  handleCreateVariant = () => {
    const selectedProduct =  ReactionProduct.selectedProduct();

    Meteor.call("products/createVariant", selectedProduct._id);
  }

  get products() {
    return this.props.product;
  }

  get isDigital() {
    return this.props.isDigital;
  }

  handleVariantClick = (event, variant, ancestors = -1) => {
    if (Reaction.isActionViewOpen()) {
      this.handleEditVariant(event, variant, ancestors);
    } else {
      const selectedProduct = ReactionProduct.selectedProduct();

      ReactionProduct.setCurrentVariant(variant._id);
      Session.set("variant-form-" + variant._id, true);
      Reaction.Router.go("product", {
        handle: selectedProduct.handle,
        variantId: variant._id
      }, {
        as: Reaction.Router.getQueryParam("as")
      });
    }
  }

  handleEditVariant = (event, variant, ancestors = -1) => {
    const selectedProduct = ReactionProduct.selectedProduct();
    let editVariant = variant;
    if (ancestors >= 0) {
      editVariant = Products.findOne(variant.ancestors[ancestors]);
    }

    ReactionProduct.setCurrentVariant(variant._id);
    Session.set("variant-form-" + editVariant._id, true);
    Reaction.Router.go("product", {
      handle: selectedProduct.handle,
      variantId: variant._id
    }, {
      as: Reaction.Router.getQueryParam("as")
    });

    if (Reaction.hasPermission("createProduct")) {
      Reaction.showActionView({
        label: "Edit Variant",
        i18nKeyLabel: "productDetailEdit.editVariant",
        template: "variantForm",
        data: editVariant
      });
    }

    // Prevent the default edit button `onEditButtonClick` function from running
    return false;
  }

  handleVariantVisibilityToggle = (event, variant, variantIsVisible) => {
    Meteor.call("products/updateProductField", variant._id, "isVisible", variantIsVisible);
  }

  handleMoveVariant = (dragIndex, hoverIndex) => {
    const variant = this.props.variants[dragIndex];

    // Apply new sort order to variant list
    const newVariantOrder = update(this.props.variants, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, variant]
      ]
    });

    // Set local state so the component does't have to wait for a round-trip
    // to the server to get the updated list of variants
    this.setState({
      variants: newVariantOrder
    });

    // Save the updated positions
    Meteor.defer(() => {
      Meteor.call("products/updateVariantsPosition", getVariantIds(newVariantOrder));
    });
  }

  render() {
    return (
      <DragDropProvider>
        <VariantList
          onEditVariant={this.handleEditVariant}
          onMoveVariant={this.handleMoveVariant}
          onVariantClick={this.handleVariantClick}
          onVariantVisibiltyToggle={this.handleVariantVisibilityToggle}
          isDigital={this.isDigital}
          onCreateVariant={this.handleCreateVariant}
          {...this.props}
          products={this.products}
          variants={this.variants}
        />
      </DragDropProvider>
    );
  }
}

function composer(props, onData) {
  let childVariantMedia = [];
  const childVariants = getChildVariants();

  if (Array.isArray(childVariants)) {
    childVariantMedia = Media.find({
      "metadata.variantId": {
        $in: getVariantIds(childVariants)
      }
    }, {
      sort: {
        "metadata.priority": 1
      }
    }).fetch();
  }

  let editable;
  const products = props.product;
  if (Reaction.Router.getQueryParam("as") === "customer") {
    editable = false;
  } else {
    editable = Reaction.hasPermission(["createProduct"]);
  }

  onData(null, {
    variants: getTopVariants(),
    variantIsSelected,
    variantIsInActionView,
    products,
    childVariants,
    childVariantMedia,
    displayPrice: ReactionProduct.getVariantPriceRange,
    isSoldOut: isSoldOut,
    editable
  });
}

VariantListContainer.propTypes = {
  isDigital: PropTypes.any,
  product: PropTypes.object,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default composeWithTracker(composer)(VariantListContainer);
