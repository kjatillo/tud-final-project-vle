using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VleProjectApi.Migrations
{
    /// <inheritdoc />
    public partial class AddModuleInstructorProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModuleInstructor",
                table: "Modules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModuleInstructor",
                table: "Modules");
        }
    }
}
