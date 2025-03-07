using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VleProjectApi.Entities;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EnrolmentsController : ControllerBase
{
    private readonly IEnrolmentRepository _enrolmentRepository;
    private readonly IModuleRepository _moduleRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public EnrolmentsController(
        IEnrolmentRepository enrolmentRepository,
        IModuleRepository moduleRepository,
        UserManager<ApplicationUser> userManager)
    {
        _enrolmentRepository = enrolmentRepository ?? throw new ArgumentNullException(nameof(enrolmentRepository));
        _moduleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
    }

    /// <summary>
    /// Retrieves all modules enroled by the current user.
    /// </summary>
    /// <returns>A list of modules enroled by the current user.</returns>
    [HttpGet("modules")]
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
    /// Enrols the current user in a specified module.
    /// </summary>
    /// <param name="moduleId">The ID of the module to enrol in.</param>
    /// <returns>A success message if the enrolment is successful, otherwise an error message.</returns>
    [HttpPost("{moduleId}")]
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
    [HttpGet("{moduleId}/status")]
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
}
