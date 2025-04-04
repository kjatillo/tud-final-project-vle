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
public class ModulesController : ControllerBase
{
    private readonly IBlobStorageService _blobStorageService;
    private readonly IMapper _mapper;
    private readonly IModuleRepository _moduleRepository;
    private readonly IModuleContentRepository _moduleContentRepository;
    private readonly IModulePageRepository _modulePageRepository;
    private readonly IModuleSubmissionRepository _moduleSubmissionRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public ModulesController(
        IBlobStorageService blobStorageService,
        IMapper mapper,
        IModuleContentRepository moduleContentRepository,
        IModulePageRepository modulePageRepository,
        IModuleRepository moduleRepository,
        IModuleSubmissionRepository moduleSubmissionsRepository,
        UserManager<ApplicationUser> userManager)
    {
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _moduleContentRepository = moduleContentRepository ?? throw new ArgumentNullException(nameof(moduleContentRepository));
        _modulePageRepository = modulePageRepository ?? throw new ArgumentNullException(nameof(modulePageRepository));
        _moduleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        _moduleSubmissionRepository = moduleSubmissionsRepository ?? throw new ArgumentNullException(nameof(moduleSubmissionsRepository));
        _blobStorageService = blobStorageService ?? throw new ArgumentNullException(nameof(blobStorageService));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    /// <summary>
    /// Retrieves all modules.
    /// </summary>
    /// <returns>A list of all modules.</returns>
    [HttpGet]
    public async Task<IActionResult> GetModules()
    {
        var modules = await _moduleRepository.GetModulesAsync();

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
    /// Creates a new module.
    /// </summary>
    /// <param name="createModuleDto">The data transfer object containing the details of the module to be created.</param>
    /// <returns>A success message with the created module details if the module is created successfully, otherwise an error message.</returns>
    [HttpPost]
    [Authorize(Roles = nameof(Role.Admin))]
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

        return CreatedAtAction(nameof(GetModuleById), new { moduleId = createdModule.ModuleId }, createdModule);
    }

    /// <summary>
    /// Edits an existing module.
    /// </summary>
    /// <param name="moduleId">The ID of the module to be edited.</param>
    /// <param name="updateModuleDto">The data transfer object containing the updated details of the module.</param>
    /// <returns>A success message with the updated module details if the module is edited successfully, otherwise an error message.</returns>
    [HttpPut("{moduleId}")]
    [Authorize(Roles = nameof(Role.Admin))]
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
        module.ModuleInstructor = updateModuleDto.ModuleInstructor;
        module.Price = updateModuleDto.Price;

        var updatedModule = await _moduleRepository.EditModuleAsync(module);

        return Ok(new { Status = "Success", Message = "Module edited successfully!", Module = updatedModule });
    }

    /// <summary>
    /// Deletes a module by its ID.
    /// </summary>
    /// <param name="moduleId">The ID of the module to be deleted.</param>
    /// <returns>A success message if the module and its associated pages and contents are deleted successfully, otherwise an error message.</returns>
    [HttpDelete("{moduleId}")]
    [Authorize(Roles = nameof(Role.Admin))]
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

        // Delete associated pages and contents
        var pages = await _modulePageRepository.GetPagesByModuleIdAsync(moduleId);
        if (pages != null && pages.Any())
        {
            foreach (var page in pages)
            {
                var contents = await _moduleContentRepository.GetContentsByPageIdAsync(page.PageId);
                if (contents != null && contents.Any())
                {
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
                }

                await _modulePageRepository.DeletePageAsync(page.PageId);
            }
        }

        await _moduleRepository.DeleteEnrolmentsByModuleIdAsync(moduleId);
        await _moduleRepository.DeleteModuleAsync(moduleId);

        return Ok(new { Status = "Success", Message = "Module and its associated pages and contents deleted successfully!" });
    }
}
