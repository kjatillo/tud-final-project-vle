using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using VleProjectApi.Entities;
using VleProjectApi.Models;
using VleProjectApi.Services.Interfaces;

namespace VleProjectApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UsersController(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    /// <summary>
    /// Retrieves all users from the repository.
    /// </summary>
    /// <returns>A list of user DTOs.</returns>
    /// <response code="200">Returns the list of users.</response>
    /// <response code="500">If an error occurs while processing the request.</response>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        try
        {
            var users = await _userRepository.GetAllUsersAsync();
            return Ok(_mapper.Map<IEnumerable<UserDto>>(users));
        }
        catch (Exception ex)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                $"An error occurred while processing your request: {ex.Message}");
        }
    }

    /// <summary>
    /// Retrieves a user by their ID.
    /// </summary>
    /// <param name="userId">The ID of the user to retrieve.</param>
    /// <returns>The user DTO if found; otherwise, a 404 Not Found response.</returns>
    /// <response code="200">Returns the user DTO.</response>
    /// <response code="404">If the user is not found.</response>
    /// <response code="500">If an error occurs while processing the request.</response>
    [HttpGet("{userId}", Name = nameof(GetUser))]
    public async Task<ActionResult<UserDto>> GetUser(int userId)
    {
        try
        {
            if (!await _userRepository.UserExists(userId))
            {
                return NotFound();
            }

            var user = await _userRepository.GetUserAsync(userId);

            return Ok(_mapper.Map<UserDto>(user));
        }
        catch (Exception ex)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                $"An error occurred while processing your request: {ex.Message}");
        }
    }

    /// <summary>
    /// Adds a new user to the repository.
    /// </summary>
    /// <param name="userDto">The user data transfer object containing user details.</param>
    /// <returns>The created user DTO.</returns>
    /// <response code="201">Returns the newly created user.</response>
    /// <response code="400">If the user data is null.</response>
    /// <response code="500">If an error occurs while processing the request.</response>
    [HttpPost]
    public async Task<ActionResult<UserDto>> AddUser(UserDto userDto)
    {
        if (userDto == null)
        {
            return BadRequest("User data is null.");
        }

        try
        {
            var user = _mapper.Map<User>(userDto);

            await _userRepository.AddUserAsync(user);
            await _userRepository.SaveChangesAsync();

            var newUser = _mapper.Map<UserDto>(user);

            return CreatedAtAction(nameof(GetUser), new { userId = newUser.Id }, newUser);
        }
        catch (Exception ex)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                $"An error occurred while processing your request: {ex.Message}");
        }
    }
}
