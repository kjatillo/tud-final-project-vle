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
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IMapper _mapper;

    public UsersController(
        UserManager<ApplicationUser> userManager, 
        RoleManager<IdentityRole> roleManager,
        SignInManager<ApplicationUser> signInManager,
        IMapper mapper)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
        _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
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

    /// <summary>
    /// Authenticates a user and returns user details.
    /// </summary>
    /// <param name="loginDto">The data transfer object containing user login details.</param>
    /// <returns>An action result containing the user details if successful; otherwise, an unauthorized response.</returns>
    /// <response code="200">Returns the user details.</response>
    /// <response code="401">If the login attempt is invalid or the user is not found.</response>
    /// <response code="500">If an error occurs while processing the request.</response>
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var result = await _signInManager
            .PasswordSignInAsync(
                loginDto.Email, loginDto.Password, isPersistent: false, lockoutOnFailure: false);

        if (!result.Succeeded)
        {
            return Unauthorized(new { Status = "Error", Message = "Invalid login attempt." });
        }

        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
        {
            return Unauthorized(new { Status = "Error", Message = "User not found." });
        }

        var userDto = _mapper.Map<UserDto>(user);
        var roles = await _userManager.GetRolesAsync(user);
        userDto.RoleName = roles.FirstOrDefault();

        return Ok(new { Status = "Success", Message = "User logged in successfully", User = userDto });
    }

    /// <summary>
    /// Logs out the current user.
    /// </summary>
    /// <returns>A success message if the user is logged out successfully; otherwise, an error response.</returns>
    /// <response code="200">Returns a success message.</response>
    /// <response code="500">If an error occurs while processing the request.</response>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            await _signInManager.SignOutAsync();
            return Ok(new { Status = "Success", Message = "User logged out successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { Status = "Error", Message = $"An error occurred while processing your request: {ex.Message}" });
        }
    }
}
