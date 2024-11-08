using AutoMapper;
using VleProjectApi.Entities;
using VleProjectApi.Models;

namespace VleProjectApi.Profiles;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserDto>();
        CreateMap<UserDto, User>();
    }
}
