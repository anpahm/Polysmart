import React from "react";
import News from "@/components/news";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {};

const NewsPage = () => {
  return (
    <DefaultLayout>
      <News />
    </DefaultLayout>
  );
};

export default NewsPage;
