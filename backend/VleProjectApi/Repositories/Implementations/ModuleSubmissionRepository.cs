using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;
using VleProjectApi.Entities;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Repositories.Implementations;

public class ModuleSubmissionRepository : IModuleSubmissionRepository
{
    private readonly VleDbContext _context;

    public ModuleSubmissionRepository(VleDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Adds a new module submission to the database.
    /// </summary>
    /// <param name="submission">The module submission to add.</param>
    /// <returns>The added module submission.</returns>
    public async Task<ModuleSubmission> AddSubmissionAsync(ModuleSubmission submission)
    {
        _context.ModuleSubmissions.Add(submission);
        await _context.SaveChangesAsync();
        return submission;
    }

    /// <summary>
    /// Retrieves all module submissions for a specific content ID.
    /// </summary>
    /// <param name="contentId">The ID of the content to retrieve submissions for.</param>
    /// <returns>A list of module submissions for the specified content ID.</returns>
    public async Task<IEnumerable<ModuleSubmission>> GetSubmissionsByContentIdAsync(Guid contentId)
    {
        return await _context.ModuleSubmissions
            .Where(s => s.ContentId == contentId)
            .ToListAsync();
    }

    /// <summary>
    /// Retrieves a module submission for a specific content ID and user ID.
    /// </summary>
    /// <param name="contentId">The ID of the content to retrieve the submission for.</param>
    /// <param name="userId">The ID of the user to retrieve the submission for.</param>
    /// <returns>The module submission for the specified content ID and user ID, or null if not found.</returns>
    public async Task<ModuleSubmission?> GetSubmissionByContentIdAndUserIdAsync(Guid contentId, string userId)
    {
        return await _context.ModuleSubmissions
            .FirstOrDefaultAsync(s => s.ContentId == contentId && s.UserId == userId);
    }

    /// <summary>
    /// Deletes a module submission from the database.
    /// </summary>
    /// <param name="submissionId">The ID of the submission to delete.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task DeleteSubmissionAsync(Guid submissionId)
    {
        var submission = await _context.ModuleSubmissions
            .FirstOrDefaultAsync(s => s.SubmissionId == submissionId);
        if (submission != null)
        {
            _context.ModuleSubmissions.Remove(submission);
            await _context.SaveChangesAsync();
        }
    }
}
