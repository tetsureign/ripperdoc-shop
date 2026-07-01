using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RipperdocShop.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNotesToOrderAggregateRoot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "orders",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "note",
                table: "orders");
        }
    }
}
