import React from "react";
import Variantproduct from 

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {};

const VariantsPage = () => {
  return (
    <DefaultLayout>
      <Variantproduct />
    </DefaultLayout>
  );
};

export default VariantsPage;
