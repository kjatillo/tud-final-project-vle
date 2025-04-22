using Microsoft.AspNetCore.SignalR;
using VleProjectApi.Repositories.Interfaces;

namespace VleProjectApi.Hubs;

public class NotificationHub : Hub
{
    private readonly IModuleRepository _moduleRepository;

    public NotificationHub(IModuleRepository moduleRepository)
    {
        _moduleRepository = moduleRepository ?? throw new ArgumentNullException(nameof(moduleRepository));
    }

    /// <summary>
    /// Sends a grade notification to all clients in a specific module group.
    /// </summary>
    /// <param name="moduleId">The unique identifier of the module as a string.</param>
    /// <param name="message">The notification message to be sent.</param>
    /// <param name="moduleTitle">
    /// The title of the module. If not provided, it will be retrieved from the repository.
    /// </param>
    /// <returns>A task that represents the asynchronous operation.</>
    /// <remarks>
    /// This method validates the moduleId, retrieves the module title if not provided,
    /// and sends the notification to the appropriate SignalR group.
    /// </remarks>
    public async Task SendGradeNotification(string moduleId, string message, string moduleTitle = "")
    {
        if (!Guid.TryParse(moduleId, out Guid moduleGuid))
        {
            return;
        }

        if (string.IsNullOrEmpty(moduleTitle))
        {
            moduleTitle = await GetModuleTitle(moduleGuid);
        }

        await Clients.Group($"module-{moduleId}").SendAsync("ReceiveGradeNotification", message, moduleId, moduleTitle);
    }

    /// <summary>
    /// Sends an admin notification to all clients in the admin group.
    /// </summary>
    /// <param name="message">The notification message to be sent.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <remarks>
    /// This method sends a notification to the AdminGroup SignalR group,
    /// notifying all admin users about events like contact form submissions.
    /// </remarks>
    public async Task SendAdminNotification(string message)
    {
        await Clients.Group("AdminGroup").SendAsync("ReceiveAdminNotification", message);
    }

    /// <summary>
    /// Adds the current connection to a SignalR group associated with a specific module.
    /// </summary>
    /// <param name="moduleId">The unique identifier of the module as a string.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <remarks>
    /// This method allows a client to join a SignalR group for a specific module,
    /// enabling them to receive notifications or updates related to that module.
    /// </remarks>
    public async Task JoinModuleGroup(string moduleId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"module-{moduleId}");
    }

    /// <summary>
    /// Removes the current connection from a SignalR group associated with a specific module.
    /// </summary>
    /// <param name="moduleId">The unique identifier of the module as a string.</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <remarks>
    /// This method allows a client to leave a SignalR group for a specific module,
    /// stopping them from receiving notifications or updates related to that module.
    /// </remarks>
    public async Task LeaveModuleGroup(string moduleId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"module-{moduleId}");
    }

    /// <summary>
    /// Adds the current connection to the admin group if the user is an admin.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <remarks>
    /// This method allows an admin user to join the AdminGroup SignalR group,
    /// enabling them to receive admin-specific notifications.
    /// </remarks>
    public async Task JoinAdminGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "AdminGroup");
    }

    /// <summary>
    /// Removes the current connection from the admin group.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    /// <remarks>
    /// This method allows an admin user to leave the AdminGroup SignalR group,
    /// stopping them from receiving admin-specific notifications.
    /// </remarks>
    public async Task LeaveAdminGroup()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AdminGroup");
    }

    /// <summary>
    /// Retrieves the title of a module based on its unique identifier.
    /// </summary>
    /// <param name="moduleId">The unique identifier of the module as a Guid.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains the module title as a string.
    /// If the module is not found, a default value of "Module" is returned.
    /// </returns>
    /// <remarks>
    /// This method interacts with the module repository to fetch the module details.
    /// If the module is not found, it ensures a fallback value is provided to avoid null references.
    /// </remarks>
    private async Task<string> GetModuleTitle(Guid moduleId)
    {
        var module = await _moduleRepository.GetModuleByIdAsync(moduleId);
        return module?.ModuleName ?? "Module";
    }
}
