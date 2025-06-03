import React from "react";
import Products from "@/components/Products";
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
