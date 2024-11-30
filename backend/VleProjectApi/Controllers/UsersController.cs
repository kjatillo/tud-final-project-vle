using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using VleProjectApi.Dtos;
using VleProjectApi.Models;

namespace VleProjectApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IMapper _mapper;

    public UsersController(
        UserManager<ApplicationUser> userManager, 
        RoleManager<IdentityRole> roleManager, 
        IMapper mapper)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    /// <summary>
    /// Registers a new user.
    /// </summary>
    /// <param name="registerDto">The data transfer object containing user registration details.</param>
    /// <returns>The created user DTO if successful; otherwise, an error response.</returns>
    /// <response code="201">Returns the newly created user.</response>
    /// <response code="400">If the role is invalid or user data is null.</response>
    /// <response code="500">If the user already exists or an error occurs while processing the request.</response>
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        if (registerDto == null)
        {
            return BadRequest("User data is null.");
        }

        var userExists = await _userManager.FindByEmailAsync(registerDto.Email);
        if (userExists != null)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { Status = "Error", Message = "User already exists!" });
        }

        var role = await _roleManager.FindByNameAsync(registerDto.RoleName);
        if (role == null)
        {
            return StatusCode(
                StatusCodes.Status400BadRequest,
                new { Status = "Error", Message = "Invalid role!" });
        }

        var user = new ApplicationUser
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            Name = registerDto.Name
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { Status = "Error", Message = "User creation failed!", result.Errors });
        }

        var roleResult = await _userManager.AddToRoleAsync(user, registerDto.RoleName);
        if (!roleResult.Succeeded)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { Status = "Error", Message = "Adding role failed!", roleResult.Errors });
        }

        var userDto = _mapper.Map<UserDto>(user);
        userDto.RoleId = Guid.Parse(role.Id);
        userDto.RoleName = registerDto.RoleName;

        return Ok(new { Status = "Success", Message = "User created successfully!", User = userDto });
    }
}
