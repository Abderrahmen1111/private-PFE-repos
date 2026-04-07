"use client";

import React, { type SVGProps } from "react";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { LogoCarousel } from "@/components/ui/logo-carousel";

const Img1 = (props: React.SVGProps<SVGSVGElement>) => <img src="/sponsor_logo/1.png" className={props.className as string} alt="Sponsor 1" />;
const Img2 = (props: React.SVGProps<SVGSVGElement>) => <img src="/sponsor_logo/2.png" className={props.className as string} alt="Sponsor 2" />;
const Img3 = (props: React.SVGProps<SVGSVGElement>) => <img src="/sponsor_logo/3.png" className={props.className as string} alt="Sponsor 3" />;
const Img4 = (props: React.SVGProps<SVGSVGElement>) => <img src="/sponsor_logo/4.png" className={props.className as string} alt="Sponsor 4" />;
const Img5 = (props: React.SVGProps<SVGSVGElement>) => <img src="/sponsor_logo/5.png" className={props.className as string} alt="Sponsor 5" />;
const Img6 = (props: React.SVGProps<SVGSVGElement>) => <img src="/sponsor_logo/6.png" className={props.className as string} alt="Sponsor 6" />;
const Img7 = (props: React.SVGProps<SVGSVGElement>) => <img src="/sponsor_logo/7.png" className={props.className as string} alt="Sponsor 7" />;
const Img8 = (props: React.SVGProps<SVGSVGElement>) => <img src="/sponsor_logo/8.png" className={props.className as string} alt="Sponsor 8" />;
const Img9 = (props: React.SVGProps<SVGSVGElement>) => <img src="/sponsor_logo/9.png" className={props.className as string} alt="Sponsor 9" />;

const allLogos = [
  { name: "Sponsor 1", id: 1, img: Img1 },
  { name: "Sponsor 2", id: 2, img: Img2 },
  { name: "Sponsor 3", id: 3, img: Img3 },
  { name: "Sponsor 4", id: 4, img: Img4 },
  { name: "Sponsor 5", id: 5, img: Img5 },
  { name: "Sponsor 6", id: 6, img: Img6 },
  { name: "Sponsor 7", id: 7, img: Img7 },
  { name: "Sponsor 8", id: 8, img: Img8 },
  { name: "Sponsor 9", id: 9, img: Img9 },
];

export function LogoCarouselDemo() {
  return (
    <div className="space-y-8 text-white py-24">
      <div className="mx-auto flex w-full max-w-screen-lg flex-col items-center space-y-8">
        <div className="text-center">
          <GradientHeading variant="secondary">
            The best are already here
          </GradientHeading>
          <GradientHeading size="xxl">Join new cult</GradientHeading>
        </div>
        <LogoCarousel columnCount={3} logos={allLogos} />
      </div>
    </div>
  );
}