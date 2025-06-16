"use client";
import React, { useEffect } from 'react';
import { Provider } from "react-redux";
import { store } from "../store";
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';

function ClientReduxProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      console.log("ReduxProvider: Stored user from localStorage", storedUser);
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log("ReduxProvider: Parsed user from localStorage", user);
          dispatch(setUser(user));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          localStorage.removeItem('user');
        }
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}><ClientReduxProvider>{children}</ClientReduxProvider></Provider>;
} 