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
    /// Retrieves all module assignments for the specified module.
    /// </summary>
    /// <param name="moduleId">The ID of the module to retrieve contents for.</param>
    /// <returns>A list of module assignments matching the moduleId.</returns>
    public async Task<IEnumerable<ModuleContent>> GetAssignmentsByModuleIdAsync(Guid moduleId)
    {
        return await _context.ModuleContents
            .Where(mc => mc.IsUpload && _context.ModulePages
                .Where(mp => mp.PageId == mc.PageId)
                .Select(mp => mp.ModuleId)
                .Any(m => m == moduleId))
            .ToListAsync();
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
    /// Retrieves all module submissions for a specific student and module.
    /// </summary>
    /// <param name="userId">The ID of the student to retrieve submissions for.</param>
    /// <param name="moduleId">The ID of the module to retrieve submissions for.</param>
    /// <returns>A list of module submissions for the specified student and module.</returns>
    public async Task<IEnumerable<ModuleSubmission>> GetSubmissionsByStudentAndModuleAsync(string userId, Guid moduleId)
    {
        return await _context.ModuleSubmissions
            .Where(s => s.UserId == userId && _context.ModuleContents
                .Where(mc => mc.ContentId == s.ContentId)
                .Select(mc => mc.PageId)
                .Any(pageId => _context.ModulePages
                    .Where(mp => mp.PageId == pageId)
                    .Select(mp => mp.ModuleId)
                    .Any(m => m == moduleId)))
            .ToListAsync();
    }

    /// <summary>
    /// Retrieves a module submission by its ID.
    /// </summary>
    /// <param name="submissionId">The ID of the submission to retrieve.</param>
    /// <returns>The module submission with the specified ID, or null if not found.</returns>
    public async Task<ModuleSubmission?> GetSubmissionByIdAsync(Guid submissionId)
    {
        return await _context.ModuleSubmissions
            .FirstOrDefaultAsync(s => s.SubmissionId == submissionId);
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
    /// Updates an existing module submission in the database.
    /// </summary>
    /// <param name="submission">The module submission to update. If null, no action is taken.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task UpdateSubmissionAsync(ModuleSubmission? submission)
    {
        if (submission != null)
        {
            _context.ModuleSubmissions.Update(submission);
            await _context.SaveChangesAsync();
        }
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

    /// <summary>
    /// Checks if a content exists in the database by content ID.
    /// </summary>
    /// <param name="contentId">The ID of the content to check.</param>
    /// <returns>True if the content exists, otherwise false.</returns>
    public async Task<bool> ContentExistsAsync(Guid contentId)
    {
        return await _context.ModuleContents.AnyAsync(c => c.ContentId == contentId);
    }
}
