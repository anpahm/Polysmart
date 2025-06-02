import React from "react";
import Category from "@/components/Category";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {};

const CategoryPage = () => {
  return (
    <DefaultLayout>
      <Category />
    </DefaultLayout>
  );
};

export default CategoryPage;
