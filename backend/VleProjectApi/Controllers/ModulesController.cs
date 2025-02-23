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
public class ModulesController : ControllerBase
{
    private readonly BlobStorageService _blobStorageService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEnrolmentRepository _enrolmentRepository;
    private readonly IModuleRepository _moduleRepository;
    private readonly IModuleContentRepository _moduleContentRepository;
    private readonly IModulePageRepository _modulePageRepository;
    private readonly IMapper _mapper;

    public ModulesController(
        BlobStorageService blobStorageService,
        UserManager<ApplicationUser> userManager,
        IEnrolmentRepository enrolmentRepository,
        IModuleRepository moduleRepository,
        IModuleContentRepository moduleContentRepository,
        IModulePageRepository modulePageRepository,
        IMapper mapper)
    {
        _blobStorageService = blobStorageService ?? throw new ArgumentNullException(nameof(blobStorageService));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _enrolmentRepository = enrolmentRepository ?? throw new ArgumentNullException(nameof(enrolmentRepository));
        _moduleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        _moduleContentRepository = moduleContentRepository ?? throw new ArgumentNullException(nameof(moduleContentRepository));
        _modulePageRepository = modulePageRepository ?? throw new ArgumentNullException(nameof(modulePageRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    /// <summary>
    /// Retrieves all modules.
    /// </summary>
    /// <returns>A list of all modules.</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllModules()
    {
        var modules = await _moduleRepository.GetAllModulesAsync();

        return Ok(modules);
    }

    /// <summary>
    /// Get a module by its ID.
    /// </summary>
    /// <param name="moduleId">The ID of the module.</param>
    /// <returns>The module if found, otherwise a NotFound result.</returns>
    [HttpGet("{moduleId}")]
    public async Task<IActionResult> GetModuleById(Guid moduleId)
    {
        var module = await _moduleRepository.GetModuleByIdAsync(moduleId);
        if (module == null)
        {
            return NotFound();
        }

        return Ok(module);
    }

    /// <summary>
    /// Retrieves all modules enroled by the current user.
    /// </summary>
    /// <returns>A list of modules enroled by the current user.</returns>
    [HttpGet("enroled")]
    [Authorize]
    public async Task<IActionResult> GetEnroledModules()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var enroledModules = await _enrolmentRepository.GetEnroledModulesByUserIdAsync(user.Id);

        return Ok(enroledModules);
    }

    /// <summary>
    /// Creates a new module.
    /// </summary>
    /// <param name="createModuleDto">The data transfer object containing the details of the module to be created.</param>
    /// <returns>A success message with the created module details if the module is created successfully, otherwise an error message.</returns>
    [HttpPost]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> CreateModule(CreateModuleDto createModuleDto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var module = _mapper.Map<Module>(createModuleDto);
        module.CreatedBy = user.Id;
        module.CreatedDate = DateTime.Now;

        var createdModule = await _moduleRepository.CreateModuleAsync(module);

        return Ok(new { Status = "Success", Message = "Module created successfully!", Module = createdModule });
    }

    /// <summary>
    /// Edits an existing module.
    /// </summary>
    /// <param name="moduleId">The ID of the module to be edited.</param>
    /// <param name="updateModuleDto">The data transfer object containing the updated details of the module.</param>
    /// <returns>A success message with the updated module details if the module is edited successfully, otherwise an error message.</returns>
    [HttpPut("{moduleId}")]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> EditModule(Guid moduleId, EditModuleDto updateModuleDto)
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

        if (module.CreatedBy != user.Id)
        {
            return Forbid();
        }

        module.ModuleName = updateModuleDto.ModuleName;
        module.Description = updateModuleDto.Description;

        var updatedModule = await _moduleRepository.EditModuleAsync(module);

        return Ok(new { Status = "Success", Message = "Module edited successfully!", Module = updatedModule });
    }

    /// <summary>
    /// Deletes a module by its ID.
    /// </summary>
    /// <param name="moduleId">The ID of the module to be deleted.</param>
    /// <returns>A success message if the module is deleted successfully, otherwise an error message.</returns>
    [HttpDelete("{moduleId}")]
    [Authorize(Roles = nameof(Role.Instructor))]
    public async Task<IActionResult> DeleteModule(Guid moduleId)
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

        if (module.CreatedBy != user.Id)
        {
            return Forbid();
        }

        await _moduleRepository.DeleteEnrolmentsByModuleIdAsync(moduleId);
        await _moduleRepository.DeleteModuleAsync(moduleId);

        return Ok(new { Status = "Success", Message = "Module deleted successfully!" });
    }

    /// <summary>
    /// Enrols the current user in a specified module.
    /// </summary>
    /// <param name="moduleId">The ID of the module to enrol in.</param>
    /// <returns>A success message if the enrolment is successful, otherwise an error message.</returns>
    [HttpPost("{moduleId}/enrol")]
    [Authorize]
    public async Task<IActionResult> EnrolInModule(Guid moduleId)
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

        var isEnroled = await _enrolmentRepository.IsUserEnroledInModuleAsync(user.Id, moduleId);
        if (isEnroled)
        {
            return BadRequest(new { Status = "Error", Message = "User is already enroled in this module." });
        }

        await _enrolmentRepository.EnrolUserInModuleAsync(user.Id, moduleId);

        return Ok(new { Status = "Success", Message = "Enroled in module successfully!" });
    }

    /// <summary>
    /// Checks if the current user is enroled in a specified module.
    /// </summary>
    /// <param name="moduleId">The ID of the module to check enrolment for.</param>
    /// <returns>Returns true if the user is enroled in the module, otherwise false.</returns>
    [HttpGet("{moduleId}/is-enroled")]
    [Authorize]
    public async Task<IActionResult> IsUserEnroled(Guid moduleId)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var isEnroled = await _enrolmentRepository.IsUserEnroledInModuleAsync(user.Id, moduleId);
        return Ok(isEnroled);
    }

    [HttpGet("{moduleId}/pages")]
    [Authorize]
    public async Task<IActionResult> GetPages(Guid moduleId)
    {
        var pages = await _modulePageRepository.GetPagesByModuleIdAsync(moduleId);

        return Ok(pages);
    }

    [HttpPost("{moduleId}/add-page")]
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

        if (module.CreatedBy != user.Id)
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

    [HttpGet("{moduleId}/pages/{pageId}/contents")]
    [Authorize]
    public async Task<IActionResult> GetContents(Guid moduleId, Guid pageId)
    {
        var modulePage = await _modulePageRepository.GetModulePageById(pageId);
        if (modulePage == null)
        {
            return NotFound();
        }

        if (modulePage.ModuleId != moduleId)
        {
            return BadRequest(new { Status = "Error", Message = "The page does not belong to the specified module." });
        }

        var contents = await _moduleContentRepository.GetContentsByPageIdAsync(pageId);

        return Ok(contents);
    }

    [HttpGet("{moduleId}/pages/{pageId}/contents/{contentId}")]
    public async Task<IActionResult> GetContentById(Guid contentId)
    {
        var content = await _moduleContentRepository.GetContentByIdAsync(contentId);
        if (content == null)
        {
            return NotFound();
        }

        return Ok(content);
    }

    [HttpPost("{moduleId}/pages/{pageId}/add-content")]
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

        if (module.CreatedBy != user.Id)
        {
            return Forbid();
        }

        var modulePage = await _modulePageRepository.GetModulePageById(pageId);
        if (modulePage == null)
        {
            return NotFound();
        }

        if (contentDto.IsLink && string.IsNullOrEmpty(contentDto.LinkUrl))
        {
            return BadRequest(new { Status = "Error", Message = "Link URL is required for link content." });
        }

        if (!contentDto.IsLink && contentDto.File == null)
        {
            return BadRequest(new { Status = "Error", Message = "File is required for file content." });
        }

        var content = _mapper.Map<ModuleContent>(contentDto);
        content.PageId = pageId;

        if (!contentDto.IsLink && contentDto.File != null)
        {
            using var stream = contentDto.File.OpenReadStream();
            var filePath = $"modules/{moduleId}/pages/{pageId}/resource/{contentDto.File.FileName}";
            await _blobStorageService.UploadFileAsync(stream, filePath);

            // Generate a SAS token that is valid for 10 years
            var fileUrl = _blobStorageService.GetBlobSasUri(filePath, DateTimeOffset.UtcNow.AddYears(10));

            content.FileUrl = fileUrl;
            content.FileType = contentDto.File.ContentType;
        }

        var createdContent = await _moduleContentRepository.AddContentAsync(content);

        return Ok(createdContent);
    }

    [HttpPut("{moduleId}/pages/{pageId}/contents/{contentId}")]
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

        if (module.CreatedBy != user.Id)
        {
            return Forbid();
        }

        var content = await _moduleContentRepository.GetContentByIdAsync(contentId);
        if (content == null)
        {
            return NotFound();
        }

        content.Title = contentDto.Title;
        content.Description = contentDto.Description;
        content.IsLink = contentDto.IsLink;
        content.LinkUrl = contentDto.LinkUrl;

        if (contentDto.File != null)
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

        await _moduleContentRepository.UpdateContentAsync(content);

        return Ok(content);
    }
}
