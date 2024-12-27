// declare module 'pdf2pic' {
//     interface Options {
//         density?: number;
//         saveFilename?: string;
//         savePath?: string;
//         format?: string;
//         width?: number;
//         height?: number;
//     }

//     interface ConvertResponse {
//         bulk: (pageNumber: number, options?: { responseType: string }) => Promise<any[]>;
//     }

//     export function fromPath(path: string, options?: Options): ConvertResponse;
// }