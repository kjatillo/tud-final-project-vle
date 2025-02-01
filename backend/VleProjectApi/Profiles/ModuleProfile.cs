using AutoMapper;
using VleProjectApi.Dtos;
using VleProjectApi.Models;

namespace VleProjectApi.Profiles;

public class ModuleProfile : Profile
{
    public ModuleProfile()
    {
        CreateMap<CreateModuleDto, Module>()
            .ForMember(dest => dest.ModuleID, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedDate, opt => opt.Ignore());

        CreateMap<EditModuleDto, Module>()
            .ForMember(dest => dest.ModuleID, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedDate, opt => opt.Ignore());
    }
}
