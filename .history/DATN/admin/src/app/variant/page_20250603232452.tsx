import React from "react";
import Variants from "@/components/Variantproduct";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {};

const ProductsPage = () => {
  return (
    <DefaultLayout>
      <Variantproduct />
    </DefaultLayout>
  );
};

export default ProductsPage;
