using AutoMapper;
using VleProjectApi.Dtos;
using VleProjectApi.Entities;

namespace VleProjectApi.Profiles;

public class ModuleProfile : Profile
{
    public ModuleProfile()
    {
        CreateMap<CreateModuleDto, Module>()
            .ForMember(dest => dest.ModuleId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedDate, opt => opt.Ignore());

        CreateMap<EditModuleDto, Module>()
            .ForMember(dest => dest.ModuleId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedDate, opt => opt.Ignore());

        CreateMap<AddContentDto, ModuleContent>()
            .ForMember(dest => dest.UploadedDate, opt => opt.MapFrom(src => DateTime.Now));
    }
}
