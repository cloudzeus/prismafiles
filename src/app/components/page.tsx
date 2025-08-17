"use client";
import { useState } from "react";
import {
  Card3DEffect,
  BackgroundBeams,
  CardHoverEffect,
  FloatingNavbar,
  Meteors,
  Sparkles,
  AnimatedModal,
} from "@/components/ui/aceternity";
import { Logo } from "@/components/ui/logo";

export default function ComponentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navbarItems = [
    { name: "Home", href: "/" },
    { name: "Components", href: "/components" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <div className="min-h-screen bg-black">
      <FloatingNavbar items={navbarItems} />
      
      <BackgroundBeams className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <Logo size="xl" className="mx-auto mb-6" />
            <Sparkles>
              <h1 className="text-6xl font-bold text-white mb-6">
                Aceternity UI Components
              </h1>
            </Sparkles>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Explore the beautiful and interactive components from Aceternity UI
            </p>
          </div>

          {/* Component Showcase */}
          <div className="space-y-16">
            {/* 3D Card Effect */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                3D Card Effect
              </h2>
              <div className="flex justify-center">
                <Card3DEffect>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Interactive 3D Card</h3>
                    <p className="text-gray-300">
                      Move your mouse over this card to see the 3D effect in action.
                      The card rotates and scales based on mouse position.
                    </p>
                  </div>
                </Card3DEffect>
              </div>
            </section>

            {/* Card Hover Effect */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Card Hover Effect
              </h2>
              <div className="flex justify-center">
                <CardHoverEffect>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Hover to Reveal</h3>
                    <p className="text-gray-300">
                      Hover over this card to see the spotlight effect and scaling animation.
                    </p>
                  </div>
                </CardHoverEffect>
              </div>
            </section>

            {/* Meteors Effect */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Meteors Effect
              </h2>
              <div className="relative h-64 w-full rounded-lg border border-white/20 bg-black/20 backdrop-blur-sm">
                <Meteors number={30} />
                <div className="relative z-10 flex h-full items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Shooting Stars
                    </h3>
                    <p className="text-gray-300">
                      Watch the meteors streak across the screen
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sparkles Effect */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Sparkles Effect
              </h2>
              <div className="flex justify-center">
                <div className="text-center">
                  <Sparkles sparklesCount={30}>
                    <div className="p-8 rounded-lg border border-white/20 bg-black/20 backdrop-blur-sm">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        ✨ Magical Sparkles ✨
                      </h3>
                      <p className="text-gray-300">
                        This text is surrounded by animated sparkles
                      </p>
                    </div>
                  </Sparkles>
                </div>
              </div>
            </section>

            {/* Animated Modal */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Animated Modal
              </h2>
              <div className="flex justify-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                >
                  Open Modal
                </button>
              </div>
            </section>
          </div>
        </div>
      </BackgroundBeams>

      {/* Modal */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Aceternity UI Modal"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is an example of the Animated Modal component from Aceternity UI.
            It features smooth spring animations and a beautiful backdrop.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
}
