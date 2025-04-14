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

    /// <summary>
    /// Adds a new module content to the database.
    /// </summary>
    /// <param name="content">The module content to add.</param>
    /// <returns>The added module content.</returns>
    public async Task<ModuleContent> AddContentAsync(ModuleContent content)
    {
        _context.ModuleContents.Add(content);
        await _context.SaveChangesAsync();

        return content;
    }

    /// <summary>
    /// Retrieves a list of module contents associated with a specific page ID.
    /// </summary>
    /// <param name="pageId">The unique identifier of the page.</param>
    /// <returns>A list of module contents ordered by their title.</returns>
    public async Task<IEnumerable<ModuleContent>> GetContentsByPageIdAsync(Guid pageId)
    {
        return await _context.ModuleContents
            .Where(c => c.PageId == pageId)
            .OrderBy(c => c.Title)
            .ToListAsync();
    }

    /// <summary>
    /// Retrieves a module content by its unique identifier.
    /// </summary>
    /// <param name="contentId">The unique identifier of the module content.</param>
    /// <returns>The module content if found; otherwise, null.</returns>
    public async Task<ModuleContent?> GetContentByIdAsync(Guid contentId)
    {
        return await _context.ModuleContents.FindAsync(contentId);
    }

    /// <summary>
    /// Updates an existing module content in the database.
    /// </summary>
    /// <param name="content">The module content to update.</param>
    /// <returns>The updated module content.</returns>
    public async Task<ModuleContent> EditContentAsync(ModuleContent content)
    {
        _context.ModuleContents.Update(content);
        await _context.SaveChangesAsync();

        return content;
    }

    /// <summary>
    /// Deletes a module content from the database by its unique identifier.
    /// </summary>
    /// <param name="contentId">The unique identifier of the module content to delete.</param>
    /// <returns>A task that represents the asynchronous delete operation.</returns>
    public async Task DeleteContentAsync(Guid contentId)
    {
        var content = await _context.ModuleContents.FindAsync(contentId);
        if (content != null)
        {
            _context.ModuleContents.Remove(content);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Gets module IDs for a collection of content IDs in a single query
    /// </summary>
    /// <param name="contentIds">The collection of content IDs</param>
    /// <returns>A dictionary mapping content IDs to their module IDs</returns>
    public async Task<Dictionary<Guid, Guid>> GetModuleIdsByContentIdsAsync(IEnumerable<Guid> contentIds)
    {
        return await _context.ModuleContents
            .Where(mc => contentIds.Contains(mc.ContentId))
            .Join(
                _context.ModulePages,
                content => content.PageId,
                page => page.PageId,
                (content, page) => new { content.ContentId, page.ModuleId }
            )
            .ToDictionaryAsync(
                x => x.ContentId,
                x => x.ModuleId
            );
    }
}
