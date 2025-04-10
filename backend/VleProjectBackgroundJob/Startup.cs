using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using VleProjectBackgroundJob.DbContexts;
using VleProjectBackgroundJob.Jobs.Interfaces;
using VleProjectBackgroundJob.Jobs;
using VleProjectBackgroundJob.Services.Interfaces;
using VleProjectBackgroundJob.Services;

namespace VleProjectBackgroundJob;

public class Startup
{
    public IConfiguration Configuration { get; }

    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddDbContext<VleDbContext>(options =>
            options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

        services.AddHangfire(config =>
            config.SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                  .UseSimpleAssemblyNameTypeSerializer()
                  .UseDefaultTypeSerializer()
                  .UseSqlServerStorage(Configuration.GetConnectionString("DefaultConnection")));

        services.AddHangfireServer();

        services.AddScoped<IAssignmentNotificationJob, AssignmentNotificationJob>();
        services.AddScoped<IEmailService, EmailService>();

        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "VLE Background Process", Version = "v1" });
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseRouting();
        app.UseHangfireDashboard();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

        RecurringJob.AddOrUpdate<IAssignmentNotificationJob>(
            "assignment-notifications",
            job => job.NotifyStudentsAsync(),
            Cron.Daily);
    }
}
