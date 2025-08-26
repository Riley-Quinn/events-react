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

import { useState } from "react";

// react-router-dom components
import { useNavigate } from "react-router-dom";

// @mui material components
import Switch from "@mui/material/Switch";

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";
import authAxios from "authAxios";
// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgggbggggg1 from "../../../assets/images/bgmain.jpg";
import { ability } from "../../../contexts/AbilityContext";
import { defineAbilityFor } from "../../../casl/defineAbility";
import { useSnackbar } from "components/AlertMessages/SnackbarContext";
function SignIn() {
  const { fetchError, fetchSuccess } = useSnackbar();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const res = await authAxios.post("/auth/login", {
        email,
        password,
      });
      const { token, user, permissions } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("permissions", JSON.stringify(permissions));
      ability.update(defineAbilityFor(permissions));
      window.location.reload();
      navigate("/about", { replace: true });
      fetchSuccess(res?.data?.message);
    } catch (err) {
      console.error("Error", err);
      fetchError(err?.response?.data?.message || "Login failed. Please try again.");
    }
  };
  return (
    <CoverLayout
      title="Welcome back"
      description="Enter your email and password to sign in"
      image={bgggbggggg1}
    >
      <SoftBox
        component="form"
        role="form"
        className="loginPage"
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <SoftBox mb={2}>
          <SoftBox mb={1} ml={0.5}>
            <SoftTypography component="label" variant="caption" fontWeight="bold">
              Email
            </SoftTypography>
          </SoftBox>
          <SoftInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </SoftBox>
        <SoftBox mb={2}>
          <SoftBox mb={1} ml={0.5}>
            <SoftTypography component="label" variant="caption" fontWeight="bold">
              Password
            </SoftTypography>
          </SoftBox>
          <SoftInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </SoftBox>

        <SoftBox mt={4} mb={1}>
          <SoftButton
            variant="gradient"
            type="submit"
            fullWidth
            onClick={handleLogin}
            className="add-usr-button"
          >
            sign in
          </SoftButton>
        </SoftBox>
        <SoftBox mt={3} textAlign="center"></SoftBox>
      </SoftBox>
    </CoverLayout>
  );
}

export default SignIn;
