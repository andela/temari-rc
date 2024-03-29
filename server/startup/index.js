import Accounts from "./accounts";
import i18n from "./i18n";
import Load from "./load-data";
import Packages from "./packages";
import Registry from "./registry";
import Init from "./init";
import Prerender from "./prerender";
import { initTemplates } from "/server/api/core/templates";
import RestApi from "./rest-endpoints";


export default function () {
  Accounts();
  i18n();
  initTemplates();
  Load();
  Packages();
  Registry();
  Init();
  RestApi();
  Prerender();
}
