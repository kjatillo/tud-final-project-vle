export interface ModuleContent {
    contentId: string;
    pageId: string;
    title: string;
    description: string;
    file: File;
    fileUrl: string;
    fileName: string;
    fileType: string;
    isLink: boolean;
    linkUrl: string;
    isUpload: boolean;
    deadline: Date | null;

    // Frontend property only
    submissionFileName: string;
    submissionFileUrl: string;
    submissionDate: Date;
}
