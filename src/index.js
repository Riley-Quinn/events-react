/**
=========================================================
* Soft UI Dashboard React - v4.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import { AbilityProvider } from "contexts/AbilityContext";
import { defineAbilityFor } from "./casl/defineAbility";
import { SoftUIControllerProvider } from "context";
import { SnackbarProvider } from "components/AlertMessages/SnackbarContext";

const permissions = JSON.parse(localStorage.getItem("permissions")) || [];
const abilityRules = defineAbilityFor(permissions);

ReactDOM.createRoot(document.getElementById("root")).render(
  <AbilityProvider permissions={abilityRules}>
    <BrowserRouter>
      <SoftUIControllerProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </SoftUIControllerProvider>
    </BrowserRouter>
  </AbilityProvider>
);
