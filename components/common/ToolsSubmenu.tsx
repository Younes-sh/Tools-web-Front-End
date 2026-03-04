'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PhotoIcon, 
  DocumentTextIcon,
  DocumentDuplicateIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  ChevronDownIcon,
  SparklesIcon,
  ArrowPathIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// تعریف ساختار ابزارها
interface ToolCategory {
  name: string;
  icon: React.ElementType;
  tools: {
    name: string;
    href: string;
    icon: React.ElementType;
    description?: string;
    isNew?: boolean;
    isPopular?: boolean;
  }[];
}

const toolCategories: ToolCategory[] = [
  {
    name: 'Image Tools',
    icon: PhotoIcon,
    tools: [
      { 
        name: 'AI Image Upscaler', 
        href: '/upscale', 
        icon: SparklesIcon,
        description: 'Enhance image quality up to 4x',
        isPopular: true
      },
      { 
        name: 'Image Compressor', 
        href: '/image-compress', 
        icon: ArrowPathIcon,
        description: 'Reduce image file size',
        isNew: true
      },
      { 
        name: 'Image Converter', 
        href: '/image-convert', 
        icon: PhotoIcon,
        description: 'Convert between formats'
      },
      { 
        name: 'Background Remover', 
        href: '/remove-bg', 
        icon: CpuChipIcon,
        description: 'Remove image backgrounds'
      },
    ]
  },
  {
    name: 'PDF Tools',
    icon: DocumentTextIcon,
    tools: [
      { 
        name: 'Merge PDF', 
        href: '/pdf-merge', 
        icon: DocumentDuplicateIcon,
        description: 'Combine multiple PDFs',
        isNew: true
      },
      { 
        name: 'Split PDF', 
        href: '/pdf-split', 
        icon: DocumentArrowUpIcon,
        description: 'Split PDF into separate files'
      },
      { 
        name: 'PDF to Word', 
        href: '/pdf-to-word', 
        icon: DocumentTextIcon,
        description: 'Convert PDF to editable Word'
      },
      { 
        name: 'Word to PDF', 
        href: '/word-to-pdf', 
        icon: DocumentArrowDownIcon,
        description: 'Convert Word to PDF'
      },
      { 
        name: 'PDF Compressor', 
        href: '/pdf-compress', 
        icon: ArrowPathIcon,
        description: 'Reduce PDF file size'
      },
    ]
  },
  {
    name: 'Document Tools',
    icon: DocumentTextIcon,
    tools: [
      { 
        name: 'Word to PDF', 
        href: '/word-to-pdf', 
        icon: DocumentArrowDownIcon,
        description: 'Convert Word documents'
      },
      { 
        name: 'Excel to PDF', 
        href: '/excel-to-pdf', 
        icon: TableCellsIcon,
        description: 'Convert Excel spreadsheets'
      },
      { 
        name: 'PPT to PDF', 
        href: '/ppt-to-pdf', 
        icon: PresentationChartBarIcon,
        description: 'Convert PowerPoint presentations'
      },
    ]
  }
];

export default function ToolsSubmenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const pathname = usePathname();

  // تشخیص ابزار فعال
  const isActive = toolCategories.some(category =>
    category.tools.some(tool => pathname === tool.href)
  );

  return (
    <div className="relative">
      {/* دکمه منو */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <PhotoIcon className="w-5 h-5" />
        <span>Tools</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Submenu */}
      {isOpen && (
        <div className="">
          {/* Overlay برای بستن منو با کلیک بیرون */}
          <div
            className="fixed inset-0 z-40 "
            onClick={() => setIsOpen(false)}
          />

          {/* منوی کشویی */}
          <div
            onMouseLeave={() => setIsOpen(false)}
            className="absolute left-0 top-full mt-2 w-[800px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            <div className="flex divide-x divide-gray-100 ">
              {/* دسته‌بندی‌ها - سمت چپ */}
              <div className="w-48 bg-gray-50 p-3 ">
                {toolCategories.map((category, index) => (
                  <button
                    key={index}
                    onMouseEnter={() => setActiveCategory(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeCategory === index
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* ابزارها - سمت راست */}
              <div className="flex-1 p-4 max-h-[400px] overflow-y-auto ">
                <div className="grid grid-cols-2 gap-2 ">
                  {toolCategories[activeCategory].tools.map((tool, index) => {
                    const Icon = tool.icon;
                    const isActiveTool = pathname === tool.href;
                    
                    return (
                      <Link
                        key={index}
                        href={tool.href}
                        onClick={() => setIsOpen(false)}
                        className={`group relative p-4 rounded-xl transition-all ${
                          isActiveTool
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        {/* نشان‌ها */}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {tool.isNew && (
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                          {tool.isPopular && (
                            <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>

                        {/* آیکون و نام */}
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isActiveTool
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm ${
                              isActiveTool ? 'text-blue-600' : 'text-gray-900'
                            }`}>
                              {tool.name}
                            </h4>
                            {tool.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {tool.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* فوتر منو */}
            <div className="bg-gray-50 border-t border-gray-200 p-3 text-center">
              <Link
                href="/all-tools"
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                View All Tools →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}