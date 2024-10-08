"use client";

import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "../lib/store";
import { initializeAuthState } from "@/lib/features/auth/authSlice";
import Cookies from "js-cookie";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const token = localStorage.getItem(
      "CognitoIdentityServiceProvider.7mh8s938chga9euctdbnbhmf7c.41531dba-b0f1-70bb-c18e-0e4fe90200c1.idToken"
    );

    token && !Cookies.get("token") && Cookies.set("token", token);
  }, []);

  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    if (!isClient) {
      return null;
    }

    storeRef.current = makeStore();
    storeRef.current.dispatch(initializeAuthState());
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
