using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VleProjectApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModuleEntityMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ModuleContent_ModulePages_PageId",
                table: "ModuleContent");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ModuleContent",
                table: "ModuleContent");

            migrationBuilder.RenameTable(
                name: "ModuleContent",
                newName: "ModuleContents");

            migrationBuilder.RenameIndex(
                name: "IX_ModuleContent_PageId",
                table: "ModuleContents",
                newName: "IX_ModuleContents_PageId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ModuleContents",
                table: "ModuleContents",
                column: "ContentId");

            migrationBuilder.CreateIndex(
                name: "IX_ModulePages_ModuleId",
                table: "ModulePages",
                column: "ModuleId");

            migrationBuilder.AddForeignKey(
                name: "FK_ModuleContents_ModulePages_PageId",
                table: "ModuleContents",
                column: "PageId",
                principalTable: "ModulePages",
                principalColumn: "PageId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ModulePages_Modules_ModuleId",
                table: "ModulePages",
                column: "ModuleId",
                principalTable: "Modules",
                principalColumn: "ModuleId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ModuleContents_ModulePages_PageId",
                table: "ModuleContents");

            migrationBuilder.DropForeignKey(
                name: "FK_ModulePages_Modules_ModuleId",
                table: "ModulePages");

            migrationBuilder.DropIndex(
                name: "IX_ModulePages_ModuleId",
                table: "ModulePages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ModuleContents",
                table: "ModuleContents");

            migrationBuilder.RenameTable(
                name: "ModuleContents",
                newName: "ModuleContent");

            migrationBuilder.RenameIndex(
                name: "IX_ModuleContents_PageId",
                table: "ModuleContent",
                newName: "IX_ModuleContent_PageId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ModuleContent",
                table: "ModuleContent",
                column: "ContentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ModuleContent_ModulePages_PageId",
                table: "ModuleContent",
                column: "PageId",
                principalTable: "ModulePages",
                principalColumn: "PageId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
