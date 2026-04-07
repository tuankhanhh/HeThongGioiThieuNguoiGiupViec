"use client";
import Banner from "@/components/home/Banner";
import ServiceList from "@/components/home/ServiceList";
import StepList from "@/components/home/StepList";
import FeatureMaids from "@/components/home/MaidCarousel";
import FeatureItem from "@/components/home/FeatureGrid";
import ReviewSlider from "@/components/home/ReviewSlider";

export default function Home() {
  return (
    <>
      <Banner />
      <ServiceList limit={4} />
      <StepList />
      <FeatureMaids />
      <FeatureItem />
      <ReviewSlider />
    </>
  );
}
