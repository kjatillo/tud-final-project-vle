using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;
using VleProjectApi.Entities;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class ModuleContentRepository : IModuleContentRepository
{
    private readonly VleDbContext _context;

    public ModuleContentRepository(VleDbContext context)
    {
        _context = context;
    }

    public async Task<ModuleContent> AddContentAsync(ModuleContent content)
    {
        _context.ModuleContents.Add(content);
        await _context.SaveChangesAsync();

        return content;
    }

    public async Task<IEnumerable<ModuleContent>> GetContentsByPageIdAsync(Guid pageId)
    {
        return await _context.ModuleContents
            .Where(c => c.PageId == pageId)
            .OrderBy(c => c.Title)
            .ToListAsync();
    }

    public async Task<ModuleContent?> GetContentByIdAsync(Guid contentId)
    {
        return await _context.ModuleContents.FindAsync(contentId);
    }

    public async Task<ModuleContent> UpdateContentAsync(ModuleContent content)
    {
        _context.ModuleContents.Update(content);
        await _context.SaveChangesAsync();

        return content;
    }
}
