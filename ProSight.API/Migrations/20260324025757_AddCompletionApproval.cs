using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProSight.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletionApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "OwnerApprovedComplete",
                table: "Projects",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ProApprovedComplete",
                table: "Projects",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "OwnerApprovedComplete",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ProApprovedComplete",
                table: "Projects");
        }
    }
}
