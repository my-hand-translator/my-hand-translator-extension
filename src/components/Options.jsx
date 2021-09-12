import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import MyTranslations from "./MyTranslations";

import reset from "../config/reset";

import { globalCss } from "../config/stitches.config";

import Layout from "./shared/layouts";
import EditGlossary from "./EditGlossary";
import Popup from "./Popup";
import TabContainer from "./shared/TabContainer";

function Options() {
  globalCss(reset)();
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/">
            <TabContainer>
              <Popup />
            </TabContainer>
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
            <div>Other Glossaries</div>
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
}

export default Options;
