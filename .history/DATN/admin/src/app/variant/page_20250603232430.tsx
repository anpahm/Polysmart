import React from "react";
import Variants from "@/components/";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {};

const ProductsPage = () => {
  return (
    <DefaultLayout>
      <Products />
    </DefaultLayout>
  );
};

export default ProductsPage;
