using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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
    private readonly IConfiguration _configuration;
    private readonly IMapper _mapper;

    public UsersController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        IMapper mapper)
    {
        _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
        _signInManager = signInManager ?? throw new ArgumentNullException(nameof(signInManager));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
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
    /// Authenticates a user and returns user details along with a JWT token.
    /// </summary>
    /// <param name="loginDto">The data transfer object containing user login details.</param>
    /// <returns>An action result containing the user details and JWT token if successful; otherwise, an unauthorized response.</returns>
    /// <response code="200">Returns the user details and JWT token.</response>
    /// <response code="401">If the login attempt is invalid or the user is not found.</response>
    /// <response code="500">If an error occurs while processing the request.</response>
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
        {
            return Unauthorized(new { Status = "Error", Message = "User not found." });
        }

        var result = await _signInManager
            .PasswordSignInAsync(
                loginDto.Email, loginDto.Password, isPersistent: false, lockoutOnFailure: false);

        if (!result.Succeeded)
        {
            return Unauthorized(new { Status = "Error", Message = "Invalid login attempt." });
        }

        var userDto = _mapper.Map<UserDto>(user);
        var roles = await _userManager.GetRolesAsync(user);
        userDto.RoleName = roles.FirstOrDefault();

        var token = await GenerateJwtTokenAsync(user);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddHours(1),
            Path = "/"
        };

        Response.Cookies.Append("jwt", token, cookieOptions);

        return Ok(new { Status = "Success", Message = "Login successful", User = userDto });
    }

    /// <summary>
    /// Logs out the current user by signing them out and removing the JWT cookie.
    /// </summary>
    /// <returns>An action result indicating the success or failure of the logout operation.</returns>
    /// <response code="200">If the logout is successful.</response>
    /// <response code="500">If an error occurs during the logout process.</response>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            await _signInManager.SignOutAsync();

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(-1),
                Path = "/"
            };
            Response.Cookies.Append("jwt", "", cookieOptions);

            return Ok(new { Status = "Success", Message = "Logout successful" });
        }
        catch (Exception ex)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { Status = "Error", Message = $"An error occurred while processing your request: {ex.Message}" });
        }
    }

    /// <summary>
    /// Retrieves the current authenticated user's details.
    /// </summary>
    /// <returns>An action result containing the user details if successful otherwise an unauthorized response.</returns>
    /// <response code="200">Returns the user details.</response>
    /// <response code="401">If the user is not authenticated.</response>
    [HttpGet("current-user")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var userDto = _mapper.Map<UserDto>(user);
        var roles = await _userManager.GetRolesAsync(user);
        userDto.RoleName = roles.FirstOrDefault();

        return Ok(userDto);
    }

    /// <summary>
    /// Verifies the validity of the current user's token.
    /// </summary>
    /// <returns>An action result indicating whether the token is valid and the user's roles.</returns>
    /// <response code="200">If the token is valid.</response>
    /// <response code="401">If the user is not authenticated or the token is invalid.</response>
    [HttpGet("verify-token")]
    [Authorize]
    public async Task<IActionResult> VerifyToken()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return Unauthorized(new { isValid = false });
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new { isValid = true, roles });
    }

    /// <summary>
    /// Generates a JWT token for the specified user asynchronously.
    /// </summary>
    /// <param name="user">The user for whom the token is generated.</param>
    /// <returns>The task result contains the JWT token as a string.</returns>
    /// <exception cref="ArgumentNullException">Thrown when the JWT key is not configured.</exception>
    private async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        var key = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(key))
        {
            throw new ArgumentNullException(nameof(key), "JWT key is not configured.");
        }

        var keyBytes = Encoding.ASCII.GetBytes(key);
        var userRoles = await _userManager.GetRolesAsync(user);
        var role = userRoles.FirstOrDefault();

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

        if (role != null)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
