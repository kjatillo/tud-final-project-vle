using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;

namespace VleProjectApi.Services;

public class BlobStorageService
{
    private readonly BlobContainerClient _containerClient;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureBlobStorage:ConnectionString"];
        var containerName = configuration["AzureBlobStorage:ResourceContainer"];
        _containerClient = new BlobContainerClient(connectionString, containerName);
        _containerClient.CreateIfNotExists(PublicAccessType.None);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string filePath)
    {
        var blobClient = _containerClient.GetBlobClient(filePath);
        await blobClient.UploadAsync(fileStream, true);

        return blobClient.Uri.ToString();
    }

    public async Task<Stream> DownloadFileAsync(string filePath)
    {
        var blobClient = _containerClient.GetBlobClient(filePath);
        var downloadInfo = await blobClient.DownloadAsync();

        return downloadInfo.Value.Content;
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        var blobClient = _containerClient.GetBlobClient(filePath);
        var response = await blobClient.DeleteIfExistsAsync();

        return response.Value;
    }

    public string GetBlobSasUri(string filePath, DateTimeOffset expiryTime)
    {
        var blobClient = _containerClient.GetBlobClient(filePath);

        if (blobClient.CanGenerateSasUri)
        {
            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = _containerClient.Name,
                BlobName = blobClient.Name,
                Resource = "b",
                ExpiresOn = expiryTime
            };

            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            var sasUri = blobClient.GenerateSasUri(sasBuilder);
            return sasUri.ToString();
        }
        else
        {
            throw new InvalidOperationException("BlobClient cannot generate SAS URI.");
        }
    }
}
