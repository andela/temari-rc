import React, { Children, Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { EditButton, VisibilityButton, Translation } from "/imports/plugins/core/ui/client/components";
import { composeWithTracker } from "/lib/api/compose";
import * as Collections from "/lib/collections";

class EditContainer extends Component {

  handleEditButtonClick = (event) => {
    const props = this.props;

    if (this.props.onEditButtonClick) {
      const returnValue = this.props.onEditButtonClick(event, props);

      if (returnValue === false) {
        return returnValue;
      }
    }

    Reaction.showActionView({
      label: props.label,
      i18nKeyLabel: props.i18nKeyLabel,
      template: props.editView,
      data: {
        data: props.data,
        viewProps: {
          field: props.field
        }
      }
    });

    Reaction.state.set("edit/focus", props.field);

    return true;
  }

  handleVisibilityButtonClick = (event) => {
    const props = this.props;

    if (this.props.onVisibilityButtonClick) {
      const returnValue = this.props.onVisibilityButtonClick(event, props);

      if (returnValue === false) {
        return returnValue;
      }
    }

    return true;
  }

  renderVisibilityButton() {
    if (this.props.showsVisibilityButton) {
      return (
        <VisibilityButton
          onClick={this.handleVisibilityButtonClick}
          toggleOn={this.props.data.isVisible}
        />
      );
    }

    return null;
  }

  renderEditButton() {
    let status;
    let tooltip;
    let hasChange = false;

    if (this.props.data.__draft && this.props.field) {
      const draft = this.props.data.__draft;

      if (Array.isArray(draft.diff)) {
        for (const diff of draft.diff) {
          let hasChangedField = false;

          if (Array.isArray(this.props.field)) {
            if (this.props.field.indexOf(diff.path[0]) >= 0) {
              hasChangedField = true;
            }
          } else if (typeof this.props.field === "string" && this.props.field === diff.path[0]) {
            hasChangedField = true;
          }

          if (hasChangedField) {
            status = "warning";

            tooltip = (
              <span>
                <Translation defaultValue="Unpublished Changes" i18nKey="revisions.unpublishedChanges" />
              </span>
            );

            hasChange = true;
          }
        }
      }
    } else if (this.props.data.__draft) {
      status = "warning";

      tooltip = (
        <span>
          <Translation defaultValue="Unpublished Changes" i18nKey="revisions.unpublishedChanges" />
        </span>
      );
    }

    if (this.props.autoHideEditButton && hasChange === false) {
      return null;
    }

    return (
      <EditButton
        onClick={this.handleEditButtonClick}
        status={status}
        tooltip={tooltip}
      />
    );
  }

  render() {
    // Display edit button if the permissions allow it.
    if (this.props.hasPermission) {

      // If children were passed as props to this component,
      // copy the children and inject the edit buttons
      if (this.props.children) {
        return React.cloneElement(this.props.children, {
          visibilityButton: this.renderVisibilityButton(),
          editButton: this.renderEditButton()
        });
      }

      // Otherwise, render a container for the edit buttons
      return (
        <span className="rui edit-container">
          {this.renderVisibilityButton()}
          {this.renderEditButton()}
        </span>
      );
    }

    // If permissions don't allow the edit buttons to be shown and there are
    // no child elements, then cancel rendering.
    if (!this.props.children) {
      return null;
    }

    // If permissions don't allow the edit buttons to be shown and there are
    // child elements, render them normally
    return (
      Children.only(this.props.children)
    );
  }
}

EditContainer.propTypes = {
  autoHideEditButton: PropTypes.bool,
  children: PropTypes.node,
  data: PropTypes.object,
  field: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  hasPermission: PropTypes.bool,
  onEditButtonClick: PropTypes.func,
  onVisibilityButtonClick: PropTypes.func,
  showsVisibilityButton: PropTypes.bool
};

function composer(props, onData) {
  let hasPermission;
  const viewAs = Reaction.Router.getQueryParam("as");
  if (props.disabled === true || viewAs === "customer") {
    hasPermission = false;
  } else {
    if (editPermission() || Reaction.hasAdminAccess()) {
      hasPermission = Reaction.hasPermission(props.permissions);
    }
  }

  onData(null, {
    hasPermission
  });
}

function editPermission() {
  let canEditProduct = false;
  let vendor;
  let product;
  let vendorShopName;
  let productVendor;
  if (Roles.userIsInRole(Meteor.userId(), ["vendor"], Reaction.shopId)) {
    vendor = Collections.Accounts.findOne({userId: Meteor.userId()});
    vendorShopName = vendor.profile.vendorDetails[0].shopName;
    product = Collections.Products.findOne({ vendor: vendorShopName });
    productVendor = product ? product.vendor : null;

    if (vendorShopName === productVendor) {
      canEditProduct = true;
    }
  }
  return canEditProduct;
}
export default composeWithTracker(composer)(EditContainer);
