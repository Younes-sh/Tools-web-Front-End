import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon, SparklesIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - بخش اصلی */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 overflow-hidden">
        {/* پس‌زمینه دایره‌های گرادیان */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* متن سمت چپ */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <SparklesIcon className="w-5 h-5" />
                <span>AI-Powered Image Enhancement</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Transform Your Images with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Ultra Quality
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Enhance your photos with cutting-edge AI technology. Increase resolution up to 4x without losing quality. Perfect for photographers, designers, and content creators.
              </p>

              {/* دکمه‌های CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/upscale"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  View Gallery
                </Link>
              </div>

              {/* آمار */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-gray-900">1M+</div>
                  <div className="text-sm text-gray-600">Images Enhanced</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Happy Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">4x</div>
                  <div className="text-sm text-gray-600">Resolution Boost</div>
                </div>
              </div>
            </div>

            {/* تصویر سمت راست - نمونه کار */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/assets/Images/Image-Upscale.jpg"  // ✅ مسیر مستقیم از public
                  alt="Before and After comparison"
                  fill
                  className="object-cover"
                />
                {/* برچسب Before/After */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                  Before
                </div>
                <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                  After (4x Upscaled)
                </div>
              </div>
              
              {/* نشانگر کیفیت */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">AI Enhanced</div>
                    <div className="text-sm text-gray-500">Lossless Quality</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - ویژگی‌ها */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose UltraPixel?
            </h2>
            <p className="text-xl text-gray-600">
              We combine cutting-edge AI technology with user-friendly experience to deliver the best image upscaling service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BoltIcon className="w-8 h-8" />,
                title: 'Lightning Fast',
                description: 'Process your images in seconds with our optimized AI models and cloud infrastructure.'
              },
              {
                icon: <SparklesIcon className="w-8 h-8" />,
                title: 'Superior Quality',
                description: 'Our advanced AI preserves details and textures while increasing resolution up to 4x.'
              },
              {
                icon: <ShieldCheckIcon className="w-8 h-8" />,
                title: 'Secure & Private',
                description: 'Your images are encrypted and automatically deleted after processing.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow group"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - نحوه کار */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to enhance your images with AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Your Image',
                description: 'Drag and drop or select any JPG, PNG, or WebP image up to 20MB.'
              },
              {
                step: '02',
                title: 'AI Processing',
                description: 'Our advanced neural network analyzes and enhances your image.'
              },
              {
                step: '03',
                title: 'Download Result',
                description: 'Get your high-resolution image instantly, up to 4x the original size.'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg relative z-10">
                  <div className="text-6xl font-bold text-blue-100 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
                {/* خط اتصال بین steps */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview - پیش‌نمایش قیمت */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start with 3 free images. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* پلن رایگان */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
              <p className="text-gray-600 mb-6">Perfect for trying out</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span> 3 free images
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span> Up to 2x upscale
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="text-gray-300">○</span> Basic support
                </li>
              </ul>
              <Link
                href="/register"
                className="block text-center bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* پلن حرفه‌ای - محبوب */}
            <div className="bg-blue-600 rounded-2xl p-8 shadow-xl relative transform scale-105">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="text-4xl font-bold text-white mb-4">$9.99</div>
              <p className="text-blue-100 mb-6">/month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-white">
                  <span className="text-green-300">✓</span> 100 images/month
                </li>
                <li className="flex items-center gap-2 text-white">
                  <span className="text-green-300">✓</span> Up to 4x upscale
                </li>
                <li className="flex items-center gap-2 text-white">
                  <span className="text-green-300">✓</span> Priority support
                </li>
                <li className="flex items-center gap-2 text-white">
                  <span className="text-green-300">✓</span> Batch processing
                </li>
              </ul>
              <Link
                href="/register"
                className="block text-center bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* پلن سازمانی */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Business</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">$29.99</div>
              <p className="text-gray-600 mb-6">/month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span> Unlimited images
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span> 8x upscale
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span> API access
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span> Dedicated support
                </li>
              </ul>
              <Link
                href="/register"
                className="block text-center bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - نظرات کاربران */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Creators Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about UltraPixel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Photographer',
                image: '/images/avatar1.jpg',
                content: 'The quality is amazing! I use it for all my client photos now.'
              },
              {
                name: 'Michael Chen',
                role: 'Graphic Designer',
                image: '/images/avatar2.jpg',
                content: 'Saved me hours of work. The AI is incredibly accurate.'
              },
              {
                name: 'Emma Davis',
                role: 'Content Creator',
                image: '/images/avatar3.jpg',
                content: 'Best investment for my content creation workflow.'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    {/* <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    /> */}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">&ldquo;{testimonial.content}&rdquo;</p>
                {/* ستاره‌ها */}
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - فراخوان نهایی */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Enhance Your Images?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of happy users and start your free trial today.
          </p>
          <Link
            href="/upscale"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Try It Now - It&apos;s Free
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <p className="text-white/80 text-sm mt-4">
            No credit card required • 3 free images
          </p>
        </div>
      </section>
    </div>
  );
}