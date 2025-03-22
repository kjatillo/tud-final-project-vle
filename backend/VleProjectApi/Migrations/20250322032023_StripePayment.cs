using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VleProjectApi.Migrations
{
    /// <inheritdoc />
    public partial class StripePayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropIndex(
                name: "IX_ModuleContents_PageId",
                table: "ModuleContents");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Modules",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Price",
                table: "Modules");

            migrationBuilder.CreateIndex(
                name: "IX_ModulePages_ModuleId",
                table: "ModulePages",
                column: "ModuleId");

            migrationBuilder.CreateIndex(
                name: "IX_ModuleContents_PageId",
                table: "ModuleContents",
                column: "PageId");

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
    }
}
