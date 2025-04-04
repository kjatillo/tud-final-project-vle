namespace VleProjectApi.Services.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string filePath);
    Task<Stream> DownloadFileAsync(string filePath);
    Task<bool> DeleteFileAsync(string filePath);
    string GetBlobSasUri(string filePath, DateTimeOffset expiryTime);
}
