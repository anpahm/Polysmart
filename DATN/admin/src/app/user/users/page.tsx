import React from "react";
import User from "@/components/User";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {};

const UserPage = () => {
  return (
    <DefaultLayout>
      <User />
    </DefaultLayout>
  );
};

export default UserPage;
