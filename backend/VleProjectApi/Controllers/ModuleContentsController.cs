using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VleProjectApi.Dtos;
using VleProjectApi.Entities;
using VleProjectApi.Enums;
using VleProjectApi.Repositories.Interfaces;
using VleProjectApi.Services.Interfaces;

namespace VleProjectApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ModuleContentsController : ControllerBase
{
    private readonly IBlobStorageService _blobStorageService;
    private readonly IMapper _mapper;
    private readonly IModuleContentRepository _moduleContentRepository;
    private readonly IModulePageRepository _modulePageRepository;
    private readonly IModuleRepository _moduleRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public ModuleContentsController(
        IBlobStorageService blobStorageService,
        IMapper mapper,
        IModuleContentRepository moduleContentRepository,
        IModulePageRepository modulePageRepository,
        IModuleRepository moduleRepository, 
        UserManager<ApplicationUser> userManager)
    {
        _mapper = mapper;
        _moduleContentRepository = moduleContentRepository ?? throw new ArgumentNullException(nameof(moduleContentRepository));
        _modulePageRepository = modulePageRepository ?? throw new ArgumentNullException(nameof(modulePageRepository));
        _moduleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        _blobStorageService = blobStorageService ?? throw new ArgumentNullException(nameof(blobStorageService));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    /// <summary>
    /// Retrieves all contents for a specified page within a module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <param name="pageId">The ID of the page.</param>
    /// <returns>A list of contents for the specified page.</returns>
    [HttpGet("{moduleId}/{pageId}")]
    [Authorize]
    public async Task<IActionResult> GetContents(Guid moduleId, Guid pageId)
    {
        var page = await _modulePageRepository.GetModulePageByIdAsync(pageId);
        if (page == null)
        {
            return NotFound();
        }

        if (page.ModuleId != moduleId)
        {
            return BadRequest(new { Status = "Error", Message = "The page does not belong to the specified module." });
        }

        var contents = await _moduleContentRepository.GetContentsByPageIdAsync(pageId);

        return Ok(contents);
    }

    /// <summary>
    /// Retrieves a specific content by its ID within a specified page and module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <param name="pageId">The ID of the page.</param>
    /// <param name="contentId">The ID of the content.</param>
    /// <returns>The content if found, otherwise a NotFound or BadRequest result.</returns>
    [HttpGet("{moduleId}/{pageId}/{contentId}")]
    public async Task<IActionResult> GetContentById(Guid moduleId, Guid pageId, Guid contentId)
    {
        var module = await _moduleRepository.GetModuleByIdAsync(moduleId);
        if (module == null)
        {
            return NotFound();
        }

        var page = await _modulePageRepository.GetModulePageByIdAsync(pageId);
        if (page == null)
        {
            return NotFound();
        }

        var content = await _moduleContentRepository.GetContentByIdAsync(contentId);
        if (content == null)
        {
            return NotFound();
        }

        return Ok(content);
    }

    /// <summary>
    /// Adds a new content to a specified page within a module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <param name="pageId">The ID of the page to add the content to.</param>
    /// <param name="contentDto">The data transfer object containing the details of the content to be added.</param>
    /// <returns>The created content if the operation is successful, otherwise an error message.</returns>
    [HttpPost("{moduleId}/{pageId}")]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> AddContent(Guid moduleId, Guid pageId, [FromForm] AddContentDto contentDto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var module = await _moduleRepository.GetModuleByIdAsync(moduleId);
        if (module == null)
        {
            return NotFound();
        }

        if (module.ModuleInstructor != user.Id)
        {
            return Forbid();
        }

        var page = await _modulePageRepository.GetModulePageByIdAsync(pageId);
        if (page == null)
        {
            return NotFound();
        }

        if (contentDto.IsLink && string.IsNullOrEmpty(contentDto.LinkUrl))
        {
            return BadRequest(new { Status = "Error", Message = "Link URL is required for link content." });
        }

        if (!contentDto.IsLink && !contentDto.IsUpload && contentDto.File == null)
        {
            return BadRequest(new { Status = "Error", Message = "File is required for file content." });
        }

        var content = _mapper.Map<ModuleContent>(contentDto);
        content.PageId = pageId;

        if (!contentDto.IsLink && !contentDto.IsUpload && contentDto.File != null)
        {
            using var stream = contentDto.File.OpenReadStream();
            var filePath = $"modules/{moduleId}/pages/{pageId}/resource/{contentDto.File.FileName}";
            await _blobStorageService.UploadFileAsync(stream, filePath);

            // Generate a SAS token that is valid for 10 years
            var fileUrl = _blobStorageService.GetBlobSasUri(filePath, DateTimeOffset.UtcNow.AddYears(10));

            content.FileUrl = fileUrl;
            content.FileType = contentDto.File.ContentType;
        }

        if (contentDto.IsUpload)
        {
            if (contentDto.Deadline != null)
            {
                content.Deadline = (DateTime)contentDto.Deadline;
            }
        }

        var createdContent = await _moduleContentRepository.AddContentAsync(content);

        return Ok(createdContent);
    }

    /// <summary>
    /// Edits an existing content within a specified page of a module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <param name="pageId">The ID of the page.</param>
    /// <param name="contentId">The ID of the content to be edited.</param>
    /// <param name="contentDto">The data transfer object containing the updated details of the content.</param>
    /// <returns>The updated content if the operation is successful, otherwise an error message.</returns>
    [HttpPut("{moduleId}/{pageId}/{contentId}")]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> EditContent(Guid moduleId, Guid pageId, Guid contentId, [FromForm] EditContentDto contentDto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var module = await _moduleRepository.GetModuleByIdAsync(moduleId);
        if (module == null)
        {
            return NotFound();
        }

        if (module.ModuleInstructor != user.Id)
        {
            return Forbid();
        }

        var page = await _modulePageRepository.GetModulePageByIdAsync(pageId);
        if (page == null)
        {
            return NotFound();
        }

        var content = await _moduleContentRepository.GetContentByIdAsync(contentId);
        if (content == null)
        {
            return NotFound();
        }

        content.Title = contentDto.Title;
        content.Description = contentDto.Description;
        content.IsLink = contentDto.IsLink;
        content.IsUpload = contentDto.IsUpload;

        if ((contentDto.IsLink || contentDto.IsUpload) && !string.IsNullOrEmpty(content.FileUrl))
        {
            await _blobStorageService.DeleteFileAsync(content.FileUrl);

            content.FileUrl = string.Empty;
            content.FileType = string.Empty;
        }

        if (contentDto.IsUpload)
        {
            if (contentDto.Deadline != null)
            {
                content.Deadline = (DateTime)contentDto.Deadline;
            }

            content.LinkUrl = string.Empty;
        }

        if (contentDto.IsLink)
        {
            content.LinkUrl = contentDto.LinkUrl;
        }

        if (!contentDto.IsLink && !contentDto.IsUpload && contentDto.File != null)
        {
            if (!string.IsNullOrEmpty(content.FileUrl))
            {
                await _blobStorageService.DeleteFileAsync(content.FileUrl);
            }

            using var stream = contentDto.File.OpenReadStream();
            var filePath = $"modules/{moduleId}/pages/{pageId}/resource/{contentDto.File.FileName}";
            await _blobStorageService.UploadFileAsync(stream, filePath);

            // Generate a SAS token that is valid for 10 years
            var fileUrl = _blobStorageService.GetBlobSasUri(filePath, DateTimeOffset.UtcNow.AddYears(10));

            content.FileUrl = fileUrl;
            content.FileType = contentDto.File.ContentType;
        }

        await _moduleContentRepository.EditContentAsync(content);

        return Ok(content);
    }

    /// <summary>
    /// Deletes a specific content by its ID within a specified page of a module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <param name="pageId">The ID of the page.</param>
    /// <param name="contentId">The ID of the content to be deleted.</param>
    /// <returns>A success message if the content is deleted successfully, otherwise an error message.</returns>
    [HttpDelete("{moduleId}/{pageId}/{contentId}")]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> DeleteContent(Guid moduleId, Guid pageId, Guid contentId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var module = await _moduleRepository.GetModuleByIdAsync(moduleId);
        if (module == null)
        {
            return NotFound();
        }

        if (module.ModuleInstructor != user.Id)
        {
            return Forbid();
        }

        var page = await _modulePageRepository.GetModulePageByIdAsync(pageId);
        if (page == null)
        {
            return NotFound();
        }

        var content = await _moduleContentRepository.GetContentByIdAsync(contentId);
        if (content == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrEmpty(content.FileUrl))
        {
            await _blobStorageService.DeleteFileAsync(content.FileUrl);
        }

        await _moduleContentRepository.DeleteContentAsync(contentId);

        return Ok(new { Status = "Success", Message = "Content deleted successfully!" });
    }
}
