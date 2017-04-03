
import { BrowserPolicy } from "meteor/browser-policy-common";
/*
 * set browser policies
 */
BrowserPolicy.content.allowOriginForAll("*.facebook.com");
BrowserPolicy.content.allowOriginForAll("*.reactioncommerce.com");
BrowserPolicy.content.allowOriginForAll("*.maxcdn.bootstrapcdn.com");
