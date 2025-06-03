import React from "react";
import Variantproduct from "@/components/Variantproduct";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {};

interface VariantproductProps {
  productId: string;
}

const VariantproductPage = ({ params }: { params: { id: string } }) => {
  return (
    <DefaultLayout>
      <Variantproduct productId={params.id} />
    </DefaultLayout>
  );
};

export default VariantproductPage;
