import React from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import MyTranslations from "./MyTranslations";

import reset from "../config/reset";

import { globalCss } from "../config/stitches.config";

import Layout from "./shared/layouts";
import EditGlossary from "./EditGlossary";
import Popup from "./Popup";
import OtherGlossaries from "./OtherGlossaries";

function Options() {
  globalCss(reset)();
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/">
            <Redirect to="/options.html" />
          </Route>
          <Route exact path="/popup">
            <Popup />
          </Route>
          <Route exact path="/my-glossary">
            <EditGlossary />
          </Route>
          <Route exact path="/my-translations">
            <MyTranslations />
          </Route>
          <Route exact path="/other-glossaries">
            <OtherGlossaries />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
}

export default Options;
