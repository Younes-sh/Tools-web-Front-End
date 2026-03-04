import Link from 'next/link';

const footerLinks = {
  Product: [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'API Docs', href: '/docs' },
  ],
  Company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  Support: [
    { name: 'Help Center', href: '/help' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ],
  Social: [
    { name: 'Instagram', href: 'https://instagram.com', external: true },
    { name: 'Twitter', href: 'https://twitter.com', external: true },
    { name: 'LinkedIn', href: 'https://linkedin.com', external: true },
    { name: 'GitHub', href: 'https://github.com', external: true },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Top section - Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.name}
                      {link.external && (
                        <span className="ml-1 text-xs">↗</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Middle section - Newsletter */}
        <div className="border-t border-gray-200 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Subscribe to our newsletter
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get the latest news and exclusive offers delivered to your inbox
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom section - Copyright */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">UP</span>
              </div>
              <span className="text-sm text-gray-600">
                &copy; {currentYear} UltraPixel. All rights reserved.
              </span>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Secure payment:</span>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                  Visa
                </div>
                <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                  MC
                </div>
                <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                  PayPal
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex gap-2">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">SSL Secured</span>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">Trustpilot 4.8</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}