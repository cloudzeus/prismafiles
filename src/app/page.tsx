import Link from "next/link"
import { Card3DEffect, BackgroundBeams, CardHoverEffect, FloatingNavbar } from "@/components/ui/aceternity"
import { Logo } from "@/components/ui/logo"

export default function Home() {
  const navbarItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "#features" },
    { name: "Security", href: "#security" },
    { name: "GDPR", href: "#gdpr" },
    { name: "Components", href: "/components" },
    { name: "Login", href: "/auth/signin" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FloatingNavbar items={navbarItems} />
      
      <BackgroundBeams className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Logo size="xl" className="mx-auto mb-8" />
            <h1 className="text-6xl font-bold text-gray-800 mb-6">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                G-FILES
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              The most secure, GDPR-compliant file sharing platform designed for enterprises, 
              legal firms, and organizations that demand the highest standards of data protection 
              and privacy compliance.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Sign In
              </Link>
              <Link
                href="#features"
                className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-600 hover:text-white transition-all duration-200"
              >
                Explore Features
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card3DEffect>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-yellow-300">🔒 Enterprise Security</h3>
                <p className="text-emerald-300">
                  Military-grade encryption, secure file transfer protocols, and comprehensive 
                  audit trails for complete data protection.
                </p>
              </div>
            </Card3DEffect>

            <CardHoverEffect>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-cyan-300">📋 GDPR Compliance</h3>
                <p className="text-blue-300">
                  Built-in GDPR compliance tools including data subject rights management, 
                  consent tracking, and automated data retention policies.
                </p>
              </div>
            </CardHoverEffect>

            <Card3DEffect>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2 text-pink-300">⚡ High Performance</h3>
                <p className="text-green-300">
                  Lightning-fast file transfers with intelligent compression, 
                  parallel processing, and global CDN distribution.
                </p>
              </div>
            </Card3DEffect>
          </div>

          {/* Security Section */}
          <div id="security" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Enterprise-Grade Security</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Your data security is our top priority. We implement the most advanced 
                security measures to protect your sensitive information.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <div className="text-3xl mb-4">🔐</div>
                <h4 className="font-semibold text-gray-800 mb-2">End-to-End Encryption</h4>
                <p className="text-sm text-gray-600">AES-256 encryption for files at rest and in transit</p>
              </div>
              <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <div className="text-3xl mb-4">🛡️</div>
                <h4 className="font-semibold text-gray-800 mb-2">Zero-Knowledge Architecture</h4>
                <p className="text-sm text-gray-600">We cannot access your encrypted files</p>
              </div>
              <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <div className="text-3xl mb-4">📊</div>
                <h4 className="font-semibold text-gray-800 mb-2">Comprehensive Auditing</h4>
                <p className="text-sm text-gray-600">Detailed logs of all file access and modifications</p>
              </div>
              <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <div className="text-3xl mb-4">🌍</div>
                <h4 className="font-semibold text-gray-800 mb-2">Global Compliance</h4>
                <p className="text-sm text-gray-600">SOC 2, ISO 27001, and GDPR certified</p>
              </div>
            </div>
          </div>

          {/* GDPR Section */}
          <div id="gdpr" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">GDPR Compliance Built-In</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Complete compliance with the General Data Protection Regulation (GDPR) 
                and other international privacy laws.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <h4 className="text-xl font-semibold text-gray-800 mb-3">📋 Data Subject Rights</h4>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Right to Access - Complete data export functionality</li>
                    <li>• Right to Rectification - Easy data correction tools</li>
                    <li>• Right to Erasure - Automated data deletion workflows</li>
                    <li>• Right to Portability - Standardized data formats</li>
                  </ul>
                </div>
                
                <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <h4 className="text-xl font-semibold text-gray-800 mb-3">⚙️ Consent Management</h4>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Granular consent tracking and management</li>
                    <li>• Easy consent withdrawal mechanisms</li>
                    <li>• Automated consent renewal notifications</li>
                    <li>• Audit trail for all consent activities</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <h4 className="text-xl font-semibold text-gray-800 mb-3">🕒 Data Retention</h4>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Automated data lifecycle management</li>
                    <li>• Configurable retention policies</li>
                    <li>• Scheduled data cleanup and archiving</li>
                    <li>• Legal hold capabilities for compliance</li>
                  </ul>
                </div>
                
                <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <h4 className="text-xl font-semibold text-gray-800 mb-3">📈 Privacy Impact Assessment</h4>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Built-in privacy impact assessment tools</li>
                    <li>• Risk assessment and mitigation workflows</li>
                    <li>• Regular compliance monitoring and reporting</li>
                    <li>• Expert privacy consultation available</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Perfect For</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Trusted by leading organizations across industries that require 
                the highest standards of security and compliance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg text-center">
                <div className="text-4xl mb-4">⚖️</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3">Legal & Law Firms</h4>
                <p className="text-gray-600 text-sm">
                  Secure document sharing for client files, case management, 
                  and confidential legal communications with full audit trails.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg text-center">
                <div className="text-4xl mb-4">🏥</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3">Healthcare & Pharma</h4>
                <p className="text-gray-600 text-sm">
                  HIPAA-compliant file sharing for medical records, research data, 
                  and clinical trial documentation with end-to-end encryption.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg text-center">
                <div className="text-4xl mb-4">🏦</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-3">Financial Services</h4>
                <p className="text-gray-600 text-sm">
                  Secure file sharing for financial documents, compliance reporting, 
                  and client communications with regulatory compliance built-in.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Built with Enterprise-Grade Technology</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <h4 className="font-semibold text-indigo-600">Next.js 15</h4>
                <p className="text-sm text-indigo-500">Modern App Router</p>
              </div>
              <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <h4 className="font-semibold text-emerald-600">Prisma ORM</h4>
                <p className="text-sm text-emerald-500">Secure Database</p>
              </div>
              <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <h4 className="font-semibold text-purple-600">Tailwind CSS</h4>
                <p className="text-sm text-purple-500">Professional UI</p>
              </div>
              <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <h4 className="font-semibold text-pink-600">Aceternity UI</h4>
                <p className="text-sm text-pink-500">Beautiful Components</p>
              </div>
            </div>
          </div>
        </div>
      </BackgroundBeams>
    </div>
  )
}
