using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VleProjectApi.Dtos;
using VleProjectApi.Models;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ModulesController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEnrolmentRepository _enrolmentRepository;
    private readonly IModuleRepository _moduleRepository;
    private readonly IMapper _mapper;

    public ModulesController(
        UserManager<ApplicationUser> userManager,
        IEnrolmentRepository enrolmentRepository,
        IModuleRepository moduleRepository,
        IMapper mapper)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _enrolmentRepository = enrolmentRepository ?? throw new ArgumentNullException(nameof(enrolmentRepository));
        _moduleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    /// <summary>
    /// Get a module by its ID.
    /// </summary>
    /// <param name="id">The ID of the module.</param>
    /// <returns>The module if found, otherwise a NotFound result.</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetModuleById(Guid id)
    {
        var module = await _moduleRepository.GetModuleByIdAsync(id);
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
    [Authorize(Roles = "Instructor")]
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
    /// <param name="id">The ID of the module to be edited.</param>
    /// <param name="updateModuleDto">The data transfer object containing the updated details of the module.</param>
    /// <returns>A success message with the updated module details if the module is edited successfully, otherwise an error message.</returns>
    [HttpPut("{id}")]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> EditModule(Guid id, EditModuleDto updateModuleDto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var module = await _moduleRepository.GetModuleByIdAsync(id);
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
    /// Enrolls the current user in a specified module.
    /// </summary>
    /// <param name="id">The ID of the module to enroll in.</param>
    /// <returns>A success message if the enrollment is successful, otherwise an error message.</returns>
    [HttpPost("{id}/enrol")]
    [Authorize(Roles = "Student,Instructor")]
    public async Task<IActionResult> EnrolInModule(Guid id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var module = await _moduleRepository.GetModuleByIdAsync(id);
        if (module == null)
        {
            return NotFound();
        }

        var isEnroled = await _enrolmentRepository.IsUserEnroledInModuleAsync(user.Id, id);
        if (isEnroled)
        {
            return BadRequest(new { Status = "Error", Message = "User is already enroled in this module." });
        }

        await _enrolmentRepository.EnrolUserInModuleAsync(user.Id, id);

        return Ok(new { Status = "Success", Message = "Enroled in module successfully!" });
    }

    /// <summary>
    /// Checks if the current user is enroled in a specified module.
    /// </summary>
    /// <param name="id">The ID of the module to check enrollment for.</param>
    /// <returns>Returns true if the user is enroled in the module, otherwise false.</returns>
    [HttpGet("{id}/isEnroled")]
    [Authorize(Roles = "Student,Instructor")]
    public async Task<IActionResult> IsUserEnroled(Guid id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var isEnroled = await _enrolmentRepository.IsUserEnroledInModuleAsync(user.Id, id);
        return Ok(isEnroled);
    }
}
