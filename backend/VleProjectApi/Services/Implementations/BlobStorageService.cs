using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using VleProjectApi.Services.Interfaces;

namespace VleProjectApi.Services.Implementations;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _containerClient;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureBlobStorage:ConnectionString"];
        var containerName = configuration["AzureBlobStorage:ResourceContainer"];
        _containerClient = new BlobContainerClient(connectionString, containerName);
        _containerClient.CreateIfNotExists(PublicAccessType.None);
    }

    /// <summary>
    /// Uploads a file to Azure Blob Storage.
    /// </summary>
    /// <param name="fileStream">The stream of the file to be uploaded.</param>
    /// <param name="filePath">The path where the file will be stored in the blob container.</param>
    /// <returns>The URI of the uploaded blob as a string.</returns>
    /// <remarks>
    /// This method uploads the provided file stream to the specified file path in the Azure Blob Storage container.
    /// If a blob already exists at the specified path, it will be overwritten.
    /// </remarks>
    public async Task<string> UploadFileAsync(Stream fileStream, string filePath)
    {
        var blobClient = _containerClient.GetBlobClient(filePath);
        await blobClient.UploadAsync(fileStream, true);

        return blobClient.Uri.ToString();
    }

    /// <summary>
    /// Downloads a file from Azure Blob Storage.
    /// </summary>
    /// <param name="filePath">The path of the file to be downloaded from the blob container.</param>
    /// <returns>A stream containing the content of the downloaded file.</returns>
    /// <remarks>
    /// This method retrieves the file from the specified file path in the Azure Blob Storage container.
    /// If the file exists, it returns a stream of the file content.
    /// </remarks>
    public async Task<Stream> DownloadFileAsync(string filePath)
    {
        var blobClient = _containerClient.GetBlobClient(filePath);
        var downloadInfo = await blobClient.DownloadAsync();

        return downloadInfo.Value.Content;
    }

    /// <summary>
    /// Deletes a file from Azure Blob Storage.
    /// </summary>
    /// <param name="filePath">The path of the file to be deleted from the blob container.</param>
    /// <returns>A boolean indicating whether the file was successfully deleted.</returns>
    /// <remarks>
    /// This method deletes the file at the specified file path in the Azure Blob Storage container.
    /// If the file path is a SAS URL, it extracts the actual blob name from the URL.
    /// If the file exists, it deletes the file and returns true. Otherwise, it returns false.
    /// </remarks>
    public async Task<bool> DeleteFileAsync(string filePath)
    {
        // Extract the actual blob name from the SAS URL
        if (Uri.TryCreate(filePath, UriKind.Absolute, out Uri? uri) && uri != null)
        {
            string containerName = _containerClient.Name + "/";
            int startIndex = uri.AbsolutePath.IndexOf(containerName) + containerName.Length;
            filePath = uri.AbsolutePath[startIndex..];

            filePath = Uri.UnescapeDataString(filePath);
        }

        var blobClient = _containerClient.GetBlobClient(filePath);
        if (await blobClient.ExistsAsync())
        {
            var response = await blobClient.DeleteIfExistsAsync();
            return response.Value;
        }

        return false;
    }

    /// <summary>
    /// Generates a Shared Access Signature (SAS) URI for a blob in Azure Blob Storage.
    /// </summary>
    /// <param name="filePath">The path of the blob for which the SAS URI is to be generated.</param>
    /// <param name="expiryTime">The expiration time for the SAS token.</param>
    /// <returns>The SAS URI as a string.</returns>
    /// <remarks>
    /// This method generates a SAS URI for the specified blob, allowing read access until the specified expiry time.
    /// If the BlobClient cannot generate a SAS URI, an InvalidOperationException is thrown.
    /// </remarks>
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
