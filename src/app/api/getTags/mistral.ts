import { fromBase64, fromPath } from "pdf2pic";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import axios from "axios";
import * as fs from "fs";
import { Mistral } from "@mistralai/mistralai";
import { readdir } from "fs/promises";
import * as pdfjsLib from "pdfjs-dist";
import { createCanvas, loadImage } from "canvas";

// Type definitions
type ExamDetail = {
  "course-name": string;
  slot: string;
  "course-code": string;
  "exam-type": string;
};

type AnalysisResult = {
  examDetail: ExamDetail;
  rawAnalysis: string;
};

type MistralResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

// Custom error type
class ProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProcessingError";
  }
}

// Function to ensure output directory exists
function ensureOutputDirectory(): string {
  const outputDir = join(process.cwd(), "output_images");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  return outputDir;
}

// Function to convert the downloaded PDF to images
async function convertPDFToImages(binaryData: string): Promise<string> {
  // Function to convert BinaryData to an image and return the base64 representation
    try {
      // Initialize PDF.js with the BinaryData
      const pdfDoc = await pdfjsLib.getDocument({ data: atob(binaryData) }).promise;

      // Get the first page of the PDF
      const page = await pdfDoc.getPage(1);

      // Get the dimensions and scale of the PDF page
      const viewport = page.getViewport({ scale: 1 });

      // Create a canvas and rendering context
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      // Render the PDF page as an image on the canvas
      await page.render({ canvasContext: context, viewport }).promise;

      // Convert the canvas content to a data URL (base64)
      const imageDataURL = canvas.toDataURL("image/png"); // Change 'image/png' to the desired format if needed

      return imageDataURL;
    } catch (error) {
      // Handle any errors that occur during the conversion
      throw new Error(`Error converting PDF to image: ${error}`);
    }
  };

  
  // Function to parse Mistral's response into ExamDetail format
  function parseExamDetail(analysis: string): ExamDetail {
      try {
          // Try to find JSON in the response
          const jsonMatch = analysis.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
      const examDetail = JSON.parse(jsonMatch[0]);
      return examDetail as ExamDetail;
    }
    
    throw new Error("Could not parse exam details from response");
} catch (error) {
    console.error("Error parsing exam details:", error);
    return {
        "course-name": "Unknown",
        slot: "Unknown",
        "course-code": "Unknown",
        "exam-type": "Unknown",
    };
}
}

// Function to analyze images using Mistral AI
async function analyzeImage(
    imageBase64: string,
): Promise<AnalysisResult[]> {
    try {
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            throw new ProcessingError("MISTRAL_API_KEY environment variable not set");
        }
        const client = new Mistral({ apiKey });
        
        const results: AnalysisResult[] = [];
        
        const dataUrl = `data:image/png;base64,${imageBase64}`;
        
        const prompt = `Please analyze this exam paper image and extract the following details in JSON format:
        - course-name: The full name of the course (3-4 words, no numbers or special characters)
        - slot: One of A1|A2|B1|B2|C1|C2|D1|D2|E1|E2|F1|F2|G1|G2
        - course-code: The course code (format: department letters + numbers)
        - exam-type: One of "Final Assessment Test|Continuous Assessment Test - 1|Continuous Assessment Test - 2"
        
        Provide the response in this exact format:
        {
            "course-name": "...",
            "slot": "...",
            "course-code": "...",
            "exam-type": "..."
            }`;
            
            const chatResponse = (await client.chat.complete({
                model: "pixtral-12b",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", imageUrl: dataUrl },
                        ],
                    },
                ],
            })) as MistralResponse;
            
            if (!chatResponse?.choices?.[0]?.message?.content) {
                throw new ProcessingError("Invalid response from Mistral API");
            }
            
            const rawAnalysis = chatResponse.choices[0].message.content;
            const examDetail = parseExamDetail(rawAnalysis);
            
            results.push({
                examDetail,
                rawAnalysis,
            });
            
            return results;
        } catch (error: unknown) {
            const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
            console.error("Error analyzing images:", errorMessage);
            
            return [
                {
                    examDetail: {
                        "course-name": "Error",
                        slot: "Error",
                        "course-code": "Error",
                        "exam-type": "Error",
                    },
        rawAnalysis: `Error analyzing image: ${errorMessage}`,
      },
    ];
}
}
export default async function processAndAnalyze({
    files,
    isPdf,
    }: {
        files: File[];
        isPdf: boolean;
    }) {
        let firstPage ;
        if (isPdf) {
            const arrayBuffer = await files[0]?.arrayBuffer()
            if(arrayBuffer)
                {
                    const buffer = Buffer.from(arrayBuffer);
                    const dataUrl = `data:${"application/pdf"};base64,${buffer.toString("base64")}`;
                    
                    firstPage= await convertPDFToImages(dataUrl);
                    
                }
                else{
                    
                    throw "Error converting file to buffer array"
                    return
                }
            }
            else{
                const bytes = await files[0]?.arrayBuffer();
    if(bytes)
    {
        const buffer = await Buffer.from(bytes);
        firstPage = `data:${"image/png"};base64,${buffer.toString("base64")}`;
    }
    if(firstPage)
        {
            const analysisResult =   await analyzeImage(firstPage)
            return analysisResult[0]?.examDetail
        }
        else
        {
            throw "Error Creating the Image"
        }
    }
}
// Main function to process everything
// async function processPDFAndAnalyze(pdfUrl: string): Promise<void> {
    //     try {
        //         // Convert PDF to images and get the output directory
        //         const outputDir = await convertPDFToImages(pdfUrl);
        
        //         // Analyze all the generated images
        //         const analysisResults = await analyzeImages(outputDir);
        
        //         // Save results to a JSON file
        //         const resultsPath = join(outputDir, 'analysis_results.json');
        //         fs.writeFileSync(
            //             resultsPath,
            //             JSON.stringify(analysisResults, null, 2)
            //         );
            
            //         console.log('Analysis completed. Results saved to:', resultsPath);
            
            //         // Log results to console
            //         analysisResults.forEach(result => {
                //             console.log(`\nAnalysis for ${result.imageName}:`);
                //             console.log('Exam Details:', result.examDetail);
                //             console.log('Raw Analysis:', result.rawAnalysis);
                //         });
                
//     } catch (error: unknown) {
    //         const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    //         console.error('Error in processing:', errorMessage);
    //         throw new ProcessingError(errorMessage);
    //     }
    // }
    
    // Example usage - Replace with your PDF URL
    // const pdfUrl =
    //   "https://res.cloudinary.com/dtorpaj1c/image/upload/v1731668830/papers/mykcs2yxaman61kx0jvj.pdf";
    
    // Run the complete process
    // processPDFAndAnalyze(pdfUrl)
    // .then(() => console.log('Complete processing finished'))
    // .catch(error => console.error('Processing failed:', error));
    
    // Function to download the PDF from the URL
    
    // async function downloadPDF(url: string): Promise<string> {
        //     try {
            //         const tmpFile = tmp.fileSync({ postfix: '.pdf' });
            //         const response = await axios({
                //             method: 'GET',
                //             url,
                //             responseType: 'arraybuffer',
                //         });
                //         fs.writeFileSync(tmpFile.name, response.data);
                //         return tmpFile.name;
                //     } catch (error: unknown) {
                    //         const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    //         console.error('Error downloading PDF:', errorMessage);
                    //         throw new ProcessingError(errorMessage);
                    //     }
                    // }
                    
                    // // Function to convert image to base64
                    // function imageToBase64(image: Buffer): string {
                    //   try {
                    //     return Buffer.from(image).toString("base64");
                    //   } catch (error: unknown) {
                    //     const errorMessage =
                    //       error instanceof Error ? error.message : "Unknown error occurred";
                    //     throw new ProcessingError(
                    //       `Error converting image to base64: ${errorMessage}`,
                    //     );
                    //   }
                    // }