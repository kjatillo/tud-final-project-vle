using Microsoft.EntityFrameworkCore;
using VleProjectApi.DbContexts;

namespace VleProjectApi;

public class Program
{
    public static void Main()
    {
        var builder = WebApplication.CreateBuilder();
        {
            builder.Services.AddDbContext<VleDbContext>(options =>
            {
                options.UseSqlServer(builder.Configuration
                    .GetConnectionString("DefaultConnection"));
            });

            builder.Services.AddAuthorization();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
        }

        var app = builder.Build();
        {
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.Run();
        }

    }
}
