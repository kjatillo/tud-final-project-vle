using AutoMapper;
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
public class ModulePagesController : ControllerBase
{
    private readonly IModuleContentRepository _moduleContentRepository;
    private readonly IModulePageRepository _modulePageRepository;
    private readonly IModuleRepository _moduleRepository;
    private readonly IModuleSubmissionRepository _moduleSubmissionRepository;
    private readonly BlobStorageService _blobStorageService;
    private readonly UserManager<ApplicationUser> _userManager;

    public ModulePagesController(
        IModuleContentRepository moduleContentRepository,
        IModulePageRepository modulePageRepository,
        IModuleRepository moduleRepository,
        IModuleSubmissionRepository moduleSubmissionRepository,
        BlobStorageService blobStorageService,
        UserManager<ApplicationUser> userManager)
    {
        _moduleContentRepository = moduleContentRepository ?? throw new ArgumentNullException(nameof(moduleContentRepository));
        _modulePageRepository = modulePageRepository ?? throw new ArgumentNullException(nameof(modulePageRepository));
        _moduleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        _moduleSubmissionRepository = moduleSubmissionRepository ?? throw new ArgumentNullException(nameof(moduleSubmissionRepository));
        _blobStorageService = blobStorageService ?? throw new ArgumentNullException(nameof(blobStorageService));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    /// <summary>
    /// Retrieves all pages for a specified module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <returns>A list of pages for the specified module.</returns>
    [HttpGet("{moduleId}")]
    [Authorize]
    public async Task<IActionResult> GetPages(Guid moduleId)
    {
        var pages = await _modulePageRepository.GetPagesByModuleIdAsync(moduleId);

        return Ok(pages);
    }

    /// <summary>
    /// Adds a new page to a specified module.
    /// </summary>
    /// <param name="moduleId">The ID of the module to add the page to.</param>
    /// <param name="pageDto">The data transfer object containing the details of the page to be added.</param>
    /// <returns>The created page if the operation is successful, otherwise an error message.</returns>
    [HttpPost("{moduleId}")]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> AddPage(Guid moduleId, [FromBody] AddPageDto pageDto)
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

        var page = new ModulePage
        {
            ModuleId = moduleId,
            Title = pageDto.Title
        };

        var createdPage = await _modulePageRepository.AddPageAsync(page);

        return Ok(createdPage);
    }

    /// <summary>
    /// Edits an existing page within a specified module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <param name="pageId">The ID of the page to be edited.</param>
    /// <param name="pageDto">The data transfer object containing the updated details of the page.</param>
    /// <returns>A success message with the updated page details if the page is edited successfully, otherwise an error message.</returns>
    [HttpPut("{moduleId}/{pageId}")]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> EditPage(Guid moduleId, Guid pageId, [FromBody] EditPageDto pageDto)
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

        page.Title = pageDto.Title;

        var updatedPage = await _modulePageRepository.EditPageAsync(page);

        return Ok(new { Status = "Success", Message = "Page edited successfully!", Page = updatedPage });
    }

    /// <summary>
    /// Deletes a page by its ID within a specified module.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <param name="pageId">The ID of the page to be deleted.</param>
    /// <returns>A success message if the page and its contents are deleted successfully, otherwise an error message.</returns>
    [HttpDelete("{moduleId}/{pageId}")]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> DeletePage(Guid moduleId, Guid pageId)
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

        // Delete associated page contents
        var contents = await _moduleContentRepository.GetContentsByPageIdAsync(pageId);
        foreach (var content in contents)
        {
            var submissions = await _moduleSubmissionRepository.GetSubmissionsByContentIdAsync(content.ContentId);
            foreach (var submission in submissions)
            {
                if (!string.IsNullOrEmpty(submission.FileUrl))
                {
                    await _blobStorageService.DeleteFileAsync(submission.FileUrl);
                }

                await _moduleSubmissionRepository.DeleteSubmissionAsync(submission.SubmissionId);
            }

            if (!string.IsNullOrEmpty(content.FileUrl))
            {
                await _blobStorageService.DeleteFileAsync(content.FileUrl);
            }

            await _moduleContentRepository.DeleteContentAsync(content.ContentId);
        }

        await _modulePageRepository.DeletePageAsync(pageId);

        return Ok(new { Status = "Success", Message = "Page and its associated contents deleted successfully!" });
    }
}
