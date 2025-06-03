import React from "react";
import Variantproduct from "@/components/"
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {};

const VariantproductPage = () => {
  return (
    <DefaultLayout>
      <Variantproduct />
    </DefaultLayout>
  );
};

export default VariantproductPage;
