"use client";
import Banner from "@/components/home/Banner";
import ServiceList from "@/components/home/ServiceList";
import StepList from "@/components/home/StepList";
import FeatureMaids from "@/components/home/MaidCarousel";
import FeatureItem from "@/components/home/FeatureGrid";
import ReviewSlider from "@/components/home/ReviewSlider";
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
