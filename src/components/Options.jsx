import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import MyTranslations from "./MyTranslations";

import {
  MY_GLOSSARY,
  MY_TRANSLATIONS,
  OTHER_GLOSSARIES,
  OTHER_GLOSSARY,
  POPUP,
} from "../constants/url";

import EditGlossary from "./EditGlossary";
import OtherGlossary from "./OtherGlossary";
import OtherGlossaries from "./OtherGlossaries";
import Popup from "./Popup";
import Layout from "./shared/layouts";
import TabContainer from "./shared/TabContainer";

function Options() {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/">
            <TabContainer>
              <Popup />
            </TabContainer>
          </Route>
          <Route exact path={POPUP}>
            <Popup />
          </Route>
          <Route exact path={MY_GLOSSARY}>
            <EditGlossary />
          </Route>
          <Route exact path={MY_TRANSLATIONS}>
            <MyTranslations />
          </Route>
          <Route exact path={OTHER_GLOSSARIES}>
            <OtherGlossaries />
          </Route>
          <Route exact path={OTHER_GLOSSARY}>
            <OtherGlossary />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
}

export default Options;
