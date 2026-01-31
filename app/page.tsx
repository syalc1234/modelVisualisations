"use client"

import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";

import { title, subtitle } from "@/components/primitives";
import { Button } from "@heroui/button";
import { useState } from "react";
import React from "react";
import HestonForm from "./HestonForm";
import MyChart from "./charts";


interface Props {
  hestonVisible: string
}

const heston = ["Kappa", "Theta", "Sigma", "Rho", "V0", "S", "paths", "steps", "Xi"];
const heston2dPDE = ["Kappa", "Theta", "Sigma", "Rho", "r", "q",
  "K",
  "T",
  "NAS",
  "NVS",
  "NTS"];
const fBm = ["T", "H", "N", "nPaths"];
const McFBM = ["T", "H", "N", "S0"];


export default function Home() {
  const [viewHeston, setHestonVisible] = useState("");
  const [chartData, setChartData] = useState<Record<string, unknown> | null>(null);
  const [activeField, setActiveField] = useState("")


  function DisplayHeston({ hestonVisible }: Props) {
    switch (hestonVisible) {
      case "heston": return <HestonForm fields={heston} onResult={setChartData} activeField={activeField} />
      case "heston2dPDE": return <HestonForm fields={heston2dPDE} onResult={setChartData} activeField={activeField} />;
      case "fBM": return <HestonForm fields={fBm} onResult={setChartData} activeField={activeField} />;
      case "McFBM": return <HestonForm fields={McFBM} onResult={setChartData} activeField={activeField} />;
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
        <Button color="primary" onPress={() => { setActiveField("heston"), setHestonVisible("heston") }}> Heston </Button>
        <Button color="primary" onPress={() => { setActiveField("heston2dPDE"), setHestonVisible("heston2dPDE") }}> Heston 2d pde</Button>
        <Button color="primary" onPress={() => { setActiveField("fBM"), setHestonVisible("fBM") }}> Fractional Brownian Motion </Button>
        <Button color="primary" onPress={() => { setActiveField("McFBM"), setHestonVisible("McFBM") }}> Monte Carlo Fractional Brownian Motion</Button>
      </div>
      <DisplayHeston hestonVisible={viewHeston} />


      <div className="w-full max-w-6xl">
        <MyChart data={chartData} />
      </div>

    </section>
  );
}
