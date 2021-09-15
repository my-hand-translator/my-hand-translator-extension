import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import MyTranslations from "./MyTranslations";
import EditGlossary from "./EditGlossary";
import Popup from "./Popup";
import DetailOtherGlossary from "./DetailOtherGlossary";
import Layout from "./shared/layouts";
import OtherGlossaries from "./OtherGlossaries";

import {
  MY_GLOSSARY,
  MY_TRANSLATIONS,
  OTHER_GLOSSARIES,
  OTHER_GLOSSARY,
  POPUP,
} from "../constants/url";

function Options() {
  return (
    <Router>
      <Layout>
        <Switch>
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
            <DetailOtherGlossary />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
}

export default Options;
