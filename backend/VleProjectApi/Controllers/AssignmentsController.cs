using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VleProjectApi.Dtos;
using VleProjectApi.Entities;
using VleProjectApi.Enums;
using VleProjectApi.Repositories.Interfaces;
using VleProjectApi.Services;

namespace VleProjectApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AssignmentsController : ControllerBase
{
    private readonly IModuleSubmissionRepository _moduleSubmissionRepository;
    private readonly BlobStorageService _blobStorageService;
    private readonly UserManager<ApplicationUser> _userManager;

    public AssignmentsController(
        IModuleSubmissionRepository moduleSubmissionRepository,
        BlobStorageService blobStorageService,
        UserManager<ApplicationUser> userManager)
    {
        _moduleSubmissionRepository = moduleSubmissionRepository ?? throw new ArgumentNullException(nameof(moduleSubmissionRepository));
        _blobStorageService = blobStorageService ?? throw new ArgumentNullException(nameof(blobStorageService));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    /// <summary>
    /// Uploads a submission for a specific content within a module page.
    /// </summary>
    /// <param name="addSubmissionDto">The data transfer object containing the details of the submission.</param>
    /// <returns>A success message with the file URL if the submission is uploaded successfully, otherwise an error message.</returns>
    [HttpPost]
    [Authorize(Roles = nameof(Role.Student))]
    public async Task<IActionResult> AddSubmission([FromForm] AddSubmissionDto addSubmissionDto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        if (addSubmissionDto.File == null)
        {
            return BadRequest(new { Status = "Error", Message = "File is required for submission." });
        }

        var existingSubmission = await _moduleSubmissionRepository
            .GetSubmissionsByContentIdAsync(addSubmissionDto.ContentId);
        var userSubmission = existingSubmission.FirstOrDefault(s => s.UserId == user.Id);
        if (userSubmission != null && !string.IsNullOrEmpty(userSubmission.FileUrl))
        {
            await _blobStorageService.DeleteFileAsync(userSubmission.FileUrl);
            await _moduleSubmissionRepository.DeleteSubmissionAsync(userSubmission.SubmissionId);
        }

        using var stream = addSubmissionDto.File.OpenReadStream();
        var filePath = $"modules/{addSubmissionDto.ModuleId}/pages/{addSubmissionDto.PageId}" +
            $"/assignments/{addSubmissionDto.ContentId}/{addSubmissionDto.File.FileName}";
        await _blobStorageService.UploadFileAsync(stream, filePath);

        // Generate a SAS token that is valid for 10 years
        var fileUrl = _blobStorageService.GetBlobSasUri(filePath, DateTimeOffset.UtcNow.AddYears(10));

        var submission = new ModuleSubmission
        {
            ContentId = addSubmissionDto.ContentId,
            UserId = user.Id,
            FileUrl = fileUrl,
            FileName = addSubmissionDto.FileName,
            SubmittedDate = DateTime.UtcNow
        };

        await _moduleSubmissionRepository.AddSubmissionAsync(submission);

        return Ok(new { Status = "Success", Message = "Submission uploaded successfully.", FileUrl = fileUrl });
    }

    /// <summary>
    /// Retrieves the file name of the submission for the specified content by the current user.
    /// </summary>
    /// <param name="contentId">The ID of the content.</param>
    /// <returns>The submission file name if found, otherwise a NotFound result.</returns>
    [HttpGet("{contentId}")]
    [Authorize]
    public async Task<IActionResult> GetSubmissionByContentId(Guid contentId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var submission = await _moduleSubmissionRepository.GetSubmissionByContentIdAndUserIdAsync(contentId, user.Id);
        if (submission == null || string.IsNullOrEmpty(submission.FileName))
        {
            return NotFound(new { Status = "Error", Message = "Submission not found." });
        }

        return Ok(submission);
    }
}
