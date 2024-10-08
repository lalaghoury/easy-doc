import { createAsyncThunk } from "@reduxjs/toolkit";
import { signin as signinAction, signout as signoutAction } from "./authSlice";
import { toast } from "sonner";
import Cookies from "js-cookie";

import { Amplify } from "aws-amplify";
Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: "ap-south-1:078985fd-8b8a-4c30-af5e-01230ae8fd0b",
      userPoolClientId: "7mh8s938chga9euctdbnbhmf7c",
      userPoolId: "ap-south-1_Qxwvbnwna",
    },
  },
});

import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  resendSignUpCode,
  decodeJWT,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
} from "aws-amplify/auth";
import { userPoolClientId } from "@/constants";

export const authThunks = {
  signup: createAsyncThunk(
    "auth/signup",
    async (
      {
        values,
        router,
      }: {
        values: {
          name: string;
          email: string;
          password: string;
          phone: string;
          role: string;
        };
        router: any;
      },
      { rejectWithValue }
    ) => {
      try {
        const { nextStep } = await signUp({
          username: values.email,
          password: values.password,
          options: {
            userAttributes: {
              name: values.name,
              email: values.email,
              phone_number: values.phone,
              "custom:role": values.role,
            },
          },
        });

        const { codeDeliveryDetails }: any = nextStep;

        toast.success("Sign up successful!");
        router.push(
          "/auth/confirm-email?destination=" +
            codeDeliveryDetails.destination +
            "&email=" +
            values.email
        );
      } catch (error: any) {
        return rejectWithValue(error.message || "Something went wrong");
      }
    }
  ),

  signin: createAsyncThunk(
    "auth/signin",
    async (
      {
        values,
        router,
      }: {
        values: { email: string; password: string };
        router: any;
      },
      { rejectWithValue, dispatch }
    ) => {
      try {
        await signIn({
          username: values.email,
          password: values.password,
        });

        const { userId } = await getCurrentUser();

        const token =
          localStorage.getItem(
            `CognitoIdentityServiceProvider.${userPoolClientId}.${userId}.idToken`
          ) || "";

        !Cookies.get("token") && Cookies.set("token", token);

        const payload = decodeJWT(token).payload;

        dispatch(signinAction({ payload }));

        toast.success("Sign in successful!");
        router.push(`/`);
      } catch (error: any) {
        console.log("🚀 ~ error:", error);
        if (error._type === "UserNotConfirmedException") {
          toast.error("Please confirm your email");
        } else {
          toast.error("Sign in failed!");
        }
        return rejectWithValue(error.response.data.message);
      }
    }
  ),

  confirmCode: createAsyncThunk(
    "auth/confirmCode",
    async (
      {
        values,
        router,
      }: {
        values: { confirmationCode: string; email: string };
        router: any;
      },
      { rejectWithValue, dispatch }
    ) => {
      try {
        await confirmSignUp({
          username: values.email,
          confirmationCode: values.confirmationCode,
        });

        toast.success("Email Confirmed Successfully");
        router.push(`/auth/sign-in`);
      } catch (error: any) {
        toast.error(error.message);
        return rejectWithValue(error.message);
      }
    }
  ),

  resendConfirmationCode: createAsyncThunk(
    "auth/resendConfirmationCode",
    async (
      {
        values,
      }: {
        values: { email: string };
      },
      { rejectWithValue, dispatch }
    ) => {
      try {
        await resendSignUpCode({
          username: values.email,
        });
        toast.success("Code sent successfully");
      } catch (error: any) {
        toast.error(error.message);
        return rejectWithValue(error.message);
      }
    }
  ),

  signout: createAsyncThunk(
    "auth/signout",
    async (router: any, { rejectWithValue, dispatch }) => {
      try {
        await signOut();

        Cookies.get("token") && Cookies.remove("token");
        // localStorage.clear();

        toast.success("Logged out Successfully");
        dispatch(signoutAction());
        router.push("/auth/sign-in");
        return true;
      } catch (error: any) {
        return rejectWithValue(error.response.data.message);
      }
    }
  ),

  requestPasswordReset: createAsyncThunk(
    "auth/requestPasswordReset",
    async (
      {
        email,
        router,
      }: {
        email: string;
        router: any;
      },
      { rejectWithValue }
    ) => {
      try {
        const { nextStep } = await resetPassword({
          username: email,
        });

        const { codeDeliveryDetails }: any = nextStep;

        toast.success("Password reset code sent to your email.");
        router.push(
          `/auth/confirm-password-reset?email=${email}&destination=${codeDeliveryDetails.destination}`
        );
      } catch (error: any) {
        toast.error(error.message || "Failed to request password reset.");
        return rejectWithValue(error.message || "Something went wrong");
      }
    }
  ),

  confirmPasswordReset: createAsyncThunk(
    "auth/confirmPasswordReset",
    async (
      {
        code,
        email,
        newPassword,
        router,
      }: {
        email: string;
        code: string;
        newPassword: string;
        router: any;
      },
      { rejectWithValue }
    ) => {
      try {
        await confirmResetPassword({
          username: email,
          confirmationCode: code,
          newPassword: newPassword,
        });

        toast.success("Password reset successful!");
        router.push("/auth/sign-in");
      } catch (error: any) {
        toast.error(error.message || "Failed to reset password.");
        return rejectWithValue(error.message || "Something went wrong");
      }
    }
  ),
};
