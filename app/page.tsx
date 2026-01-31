"use client"

import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";

import { title, subtitle } from "@/components/primitives";
import { Button } from "@heroui/button";
import { useState } from "react";
import React from "react";
import HestonForm from "./HestonForm";


interface Props {
  hestonVisible: string
}

const heston = ["Kappa", "Theta", "Sigma", "Rho", "V0"];
const heston2dPDE = ["Kappa", "Theta", "Sigma", "Rho", "V0"];
const fBm = ["T", "H", "N", "S0"];
const McFBM = ["T", "H", "N", "S0"];


export default function Home() {
  const [viewHeston, setHestonVisible] = useState("");


  function DisplayHeston({ hestonVisible }: Props) {
    switch (hestonVisible) {
      case "heston": return <HestonForm fields={heston} />
      case "heston2dPDE": return <HestonForm fields={heston2dPDE} />;
      case "fBm": return <HestonForm fields={fBm} />;
      case "McFBM": return <HestonForm fields={McFBM} />;
    }
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Visualise financial </span>
        <span className={title({ color: "violet" })}>Models</span>
        <br />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button color="primary" onPress={() => setHestonVisible("heston")}> Heston </Button>
        <Button color="primary" onPress={() => setHestonVisible("heston2dPDE")}> Heston 2d pde</Button>
        <Button color="primary" onPress={() => setHestonVisible("fBm")}> Fractional Brownian Motion </Button>
        <Button color="primary" onPress={() => setHestonVisible("McFBM")}> Monte Carlo Fractional Brownian Motion</Button>
      </div>
        <DisplayHeston hestonVisible={viewHeston} />

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Get started by editing <Code color="primary">app/page.tsx</Code>
          </span>
        </Snippet>
      </div>
    </section>
  );
}
