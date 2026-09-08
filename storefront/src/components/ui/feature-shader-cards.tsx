"use client"

import type React from "react"

import { Warp } from "@paper-design/shaders-react"
import { Palette, Zap, Puzzle, Settings, Smartphone, Code } from "lucide-react"

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

const features: Feature[] = [
  {
    title: "Elegant Design",
    description:
      "Beautiful shader effects that enhance your content without overwhelming it. Perfect for modern web experiences.",
    icon: <Palette className="w-12 h-12 text-white" />
  },
  {
    title: "High Performance",
    description: "Optimized WebGL shaders that run smoothly on all devices while maintaining stunning visual quality.",
    icon: <Zap className="w-12 h-12 text-white" />
  },
  {
    title: "Easy Integration",
    description: "Simple React components that can be dropped into any project with minimal configuration required.",
    icon: <Puzzle className="w-12 h-12 text-white" />
  },
  {
    title: "Customizable",
    description: "Extensive customization options to match your brand colors, animations, and visual style perfectly.",
    icon: <Settings className="w-12 h-12 text-white" />
  },
  {
    title: "Responsive",
    description: "Fully responsive design that looks great on desktop, tablet, and mobile devices of all sizes.",
    icon: <Smartphone className="w-12 h-12 text-white" />
  },
  {
    title: "Modern Tech",
    description: "Built with the latest web technologies including WebGL, React, and TypeScript for reliability.",
    icon: <Code className="w-12 h-12 text-white" />
  },
]

export default function FeaturesCards() {
  const getShaderConfig = (index: number) => {
    const configs = [
      {
        proportion: 0.3,
        softness: 0.8,
        distortion: 0.15,
        swirl: 0.6,
        swirlIterations: 8,
        shape: "checks" as const,
        shapeScale: 0.08,
        colors: ["hsl(280, 100%, 30%)", "hsl(320, 100%, 60%)", "hsl(340, 90%, 40%)", "hsl(300, 100%, 70%)"],
      },
      {
        proportion: 0.4,
        softness: 1.2,
        distortion: 0.2,
        swirl: 0.9,
        swirlIterations: 12,
        shape: "stripes" as const,
        shapeScale: 0.12,
        colors: ["hsl(200, 100%, 25%)", "hsl(180, 100%, 65%)", "hsl(160, 90%, 35%)", "hsl(190, 100%, 75%)"],
      },
      {
        proportion: 0.35,
        softness: 0.9,
        distortion: 0.18,
        swirl: 0.7,
        swirlIterations: 10,
        shape: "checks" as const,
        shapeScale: 0.1,
        colors: ["hsl(120, 100%, 25%)", "hsl(140, 100%, 60%)", "hsl(100, 90%, 30%)", "hsl(130, 100%, 70%)"],
      },
      {
        proportion: 0.45,
        softness: 1.1,
        distortion: 0.22,
        swirl: 0.8,
        swirlIterations: 15,
        shape: "stripes" as const,
        shapeScale: 0.09,
        colors: ["hsl(30, 100%, 35%)", "hsl(50, 100%, 65%)", "hsl(40, 90%, 40%)", "hsl(45, 100%, 75%)"],
      },
      {
        proportion: 0.38,
        softness: 0.95,
        distortion: 0.16,
        swirl: 0.85,
        swirlIterations: 11,
        shape: "checks" as const,
        shapeScale: 0.11,
        colors: ["hsl(250, 100%, 30%)", "hsl(270, 100%, 65%)", "hsl(260, 90%, 35%)", "hsl(265, 100%, 70%)"],
      },
      {
        proportion: 0.42,
        softness: 1.0,
        distortion: 0.19,
        swirl: 0.75,
        swirlIterations: 9,
        shape: "stripes" as const,
        shapeScale: 0.13,
        colors: ["hsl(330, 100%, 30%)", "hsl(350, 100%, 60%)", "hsl(340, 90%, 35%)", "hsl(345, 100%, 75%)"],
      },
    ]
    return configs[index % configs.length]
  }

  return (
    <section className="min-h-screen py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-background">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-800 dark:text-white mb-6">Powerful Features</h2>
          <p className="text-xl text-slate-500 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to create stunning visual experiences with elegant shader backgrounds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const shaderConfig = getShaderConfig(index)
            return (
              <div key={index} className="relative h-80">
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <Warp
                    style={{ height: "100%", width: "100%" }}
                    proportion={shaderConfig.proportion}
                    softness={shaderConfig.softness}
                    distortion={shaderConfig.distortion}
                    swirl={shaderConfig.swirl}
                    swirlIterations={shaderConfig.swirlIterations}
                    shape={shaderConfig.shape}
                    shapeScale={shaderConfig.shapeScale}
                    scale={1}
                    rotation={0}
                    speed={0.8}
                    colors={shaderConfig.colors}
                  />
                </div>

                <div className="relative z-10 p-8 rounded-3xl h-full flex flex-col bg-black/80 border border-white/20 dark:border-white/10">
                  <div className="mb-6 filter drop-shadow-lg">{feature.icon}</div>

                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>

                  <p className="leading-relaxed flex-grow text-gray-100 font-medium">{feature.description}</p>

                  <div className="mt-6 flex items-center text-sm font-bold text-gray-200 cursor-pointer">
                    <span className="mr-2">Learn more</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
