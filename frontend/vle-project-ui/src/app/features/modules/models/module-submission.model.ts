export interface ModuleSubmission {
    submissionId: string,
    contentId: string,
    userId: string,
    fileName: string,
    fileUrl: string,
    submittedDate: Date | null;
    grade: number,
    feedback: string,

    // Additional properties
    contentTitle: string,
    userName: string,
    userEmail: string
    originalGrade: number,
    isGradeChanged: boolean
}
