using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VleProjectApi.Migrations
{
    /// <inheritdoc />
    public partial class CreateModuleMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Modules_AspNetUsers_InstructorId",
                table: "Modules");

            migrationBuilder.DropIndex(
                name: "IX_Modules_InstructorId",
                table: "Modules");

            migrationBuilder.DropColumn(
                name: "InstructorId",
                table: "Modules");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InstructorId",
                table: "Modules",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Modules_InstructorId",
                table: "Modules",
                column: "InstructorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Modules_AspNetUsers_InstructorId",
                table: "Modules",
                column: "InstructorId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
