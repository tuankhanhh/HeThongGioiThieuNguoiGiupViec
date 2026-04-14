"use client";
import Banner from "@/components/componentsCustomer/home/Banner";
import ServiceList from "@/components/componentsCustomer/home/ServiceList";
import StepList from "@/components/componentsCustomer/home/StepList";
import FeatureMaids from "@/components/componentsCustomer/home/MaidCarousel";
import FeatureItem from "@/components/componentsCustomer/home/FeatureGrid";
import ReviewSlider from "@/components/componentsCustomer/home/ReviewSlider";
import Footer from "@/components/footer/app.footer";
import Header from "@/components/header/app.header";

export default function Home() {
  return (
    <>
      <Header />
      <Banner />
      <ServiceList limit={4} />
      <StepList />
      <FeatureMaids />
      <FeatureItem />
      <ReviewSlider />
      <Footer />
    </>
  );
}
