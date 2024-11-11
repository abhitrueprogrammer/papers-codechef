import { fetchPaperID } from "@/app/actions/get-papers-by-id";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PdfViewer from "@/components/pdfViewer";
import Loader from "@/components/ui/loader";
import { PaperResponse } from "@/interface";
import { Metadata } from "next";
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const paper: PaperResponse | null = await fetchPaperID(params.id);

  if (paper) {
    const subject = paper.subject;
    return {
      title: `Papers | ${subject}`,
      openGraph: {
        title: `Papers | ${subject}`,
      },
      twitter: {
        title: `Papers | ${subject}`,
      },
    };
  }

  return {
    title: "Paper not found",
  };
}
const PaperPage = async ({ params }: { params: { id: string } }) => {
  const paper = await fetchPaperID(params.id);

  if (!paper) {
    return <Loader prop="h-screen w-screen" />;
  }
  return (
    <div>
      <Navbar />
      <h1 className="jost mb-4 text-center text-2xl font-semibold md:mb-10 md:text-3xl">
        {paper.subject} {paper.exam} {paper.slot} {paper.year}
      </h1>
      <center>
        <PdfViewer url={paper.finalUrl}></PdfViewer>
      </center>
      <Footer />
    </div>
  );
};
export default PaperPage;
