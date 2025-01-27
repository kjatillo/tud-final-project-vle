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
    private readonly IModuleRepository _moduleRepository;
    private readonly IMapper _mapper;

    public ModulesController(UserManager<ApplicationUser> userManager, IModuleRepository moduleRepository, IMapper mapper)
    {
        _userManager = userManager;
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
}
