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
        _userManager = userManager;
        _enrolmentRepository = enrolmentRepository;
        _moduleRepository = moduleRepository;
        _mapper = mapper;
    }

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
            return BadRequest(new { Status = "Error", Message = "User is already enrolled in this module." });
        }

        await _enrolmentRepository.EnrolUserInModuleAsync(user.Id, id);

        return Ok(new { Status = "Success", Message = "Enrolled in module successfully!" });
    }

    [HttpGet("{id}/isEnroled")]
    [Authorize(Roles = "Student,Instructor")]
    public async Task<IActionResult> IsUserEnrolled(Guid id)
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
