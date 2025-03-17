using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VleProjectApi.Migrations
{
    /// <inheritdoc />
    public partial class SubmissionGradeAndFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Feedback",
                table: "ModuleSubmissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Grade",
                table: "ModuleSubmissions",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Feedback",
                table: "ModuleSubmissions");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "ModuleSubmissions");
        }
    }
}
