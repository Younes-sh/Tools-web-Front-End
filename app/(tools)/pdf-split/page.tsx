import PDFSplitter from '../../../components/tools/PDFSplitter';

export default function PDFSplitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PDFSplitter />
      </div>
    </div>
  );
}