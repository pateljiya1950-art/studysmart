using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactApp1.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddExamQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Exams__created_b__74AE54BC",
                table: "Exams");

            migrationBuilder.DropForeignKey(
                name: "FK__Exams__modified___75A278F5",
                table: "Exams");

            migrationBuilder.DropForeignKey(
                name: "FK__Exams__user_id__73BA3083",
                table: "Exams");

            migrationBuilder.DropForeignKey(
                name: "FK__Students__create__2D27B809",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK__Students__modifi__2E1BDC42",
                table: "Students");

            migrationBuilder.DropPrimaryKey(
                name: "PK__Exams__9C8C7BE968659802",
                table: "Exams");

            migrationBuilder.DropIndex(
                name: "IX_Exams_modified_by",
                table: "Exams");

            migrationBuilder.DropIndex(
                name: "IX_Exams_user_id",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "modified_at",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "modified_by",
                table: "Exams");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "Exams",
                newName: "duration");

            migrationBuilder.AlterColumn<bool>(
                name: "is_active",
                table: "Subjects_Skills",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true,
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<int>(
                name: "user_id",
                table: "Students",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<decimal>(
                name: "rating",
                table: "Student_Mentor_Feedback",
                type: "decimal(2,1)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(2,1)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Student_Mentor_Feedback",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "(sysdatetime())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true,
                oldDefaultValueSql: "(sysdatetime())");

            migrationBuilder.AlterColumn<decimal>(
                name: "productivity_score",
                table: "Performance_Report",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "end_time",
                table: "Mentor_Sessions",
                type: "nvarchar(5)",
                maxLength: 5,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "meeting_link",
                table: "Mentor_Sessions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "session_date",
                table: "Mentor_Sessions",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "start_time",
                table: "Mentor_Sessions",
                type: "nvarchar(5)",
                maxLength: 5,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "title",
                table: "Mentor_Sessions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "subject",
                table: "Exams",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "exam_date",
                table: "Exams",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1),
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "Exams",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "difficulty_level",
                table: "Exams",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "title",
                table: "Exams",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "Assignments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "file_path",
                table: "Assignment_Submissions",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Exams",
                table: "Exams",
                column: "exam_id");

            migrationBuilder.CreateTable(
                name: "ExamAssignments",
                columns: table => new
                {
                    assignment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    assigned_by = table.Column<int>(type: "int", nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamAssignments", x => x.assignment_id);
                    table.ForeignKey(
                        name: "FK_ExamAssignments_Exams",
                        column: x => x.exam_id,
                        principalTable: "Exams",
                        principalColumn: "exam_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamAssignments_Mentors",
                        column: x => x.assigned_by,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                    table.ForeignKey(
                        name: "FK_ExamAssignments_Students",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "ExamQuestions",
                columns: table => new
                {
                    question_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    exam_id = table.Column<int>(type: "int", nullable: false),
                    type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    difficulty_level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    question_text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    option_a = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    option_b = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    option_c = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    option_d = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    correct_answer = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamQuestions", x => x.question_id);
                    table.ForeignKey(
                        name: "FK_ExamQuestions_Exams",
                        column: x => x.exam_id,
                        principalTable: "Exams",
                        principalColumn: "exam_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExamSubmissions",
                columns: table => new
                {
                    submission_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    assignment_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    score = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    ai_score = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    cheating_violations = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    submitted_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamSubmissions", x => x.submission_id);
                    table.ForeignKey(
                        name: "FK_ExamSubmissions_ExamAssignments",
                        column: x => x.assignment_id,
                        principalTable: "ExamAssignments",
                        principalColumn: "assignment_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamSubmissions_Students",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "ExamAnswers",
                columns: table => new
                {
                    answer_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    submission_id = table.Column<int>(type: "int", nullable: false),
                    question_id = table.Column<int>(type: "int", nullable: false),
                    selected_option = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    descriptive_answer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    score = table.Column<decimal>(type: "decimal(5,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamAnswers", x => x.answer_id);
                    table.ForeignKey(
                        name: "FK_ExamAnswers_Questions",
                        column: x => x.question_id,
                        principalTable: "ExamQuestions",
                        principalColumn: "question_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamAnswers_Submissions",
                        column: x => x.submission_id,
                        principalTable: "ExamSubmissions",
                        principalColumn: "submission_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExamAnswers_question_id",
                table: "ExamAnswers",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "IX_ExamAnswers_submission_id",
                table: "ExamAnswers",
                column: "submission_id");

            migrationBuilder.CreateIndex(
                name: "IX_ExamAssignments_assigned_by",
                table: "ExamAssignments",
                column: "assigned_by");

            migrationBuilder.CreateIndex(
                name: "IX_ExamAssignments_exam_id",
                table: "ExamAssignments",
                column: "exam_id");

            migrationBuilder.CreateIndex(
                name: "IX_ExamAssignments_student_id",
                table: "ExamAssignments",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_ExamQuestions_exam_id",
                table: "ExamQuestions",
                column: "exam_id");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSubmissions_assignment_id",
                table: "ExamSubmissions",
                column: "assignment_id");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSubmissions_student_id",
                table: "ExamSubmissions",
                column: "student_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Exams_Mentors",
                table: "Exams",
                column: "created_by",
                principalTable: "Mentors",
                principalColumn: "mentor_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Students_CreatedBy",
                table: "Students",
                column: "created_by",
                principalTable: "Users",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Students_ModifiedBy",
                table: "Students",
                column: "modified_by",
                principalTable: "Users",
                principalColumn: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exams_Mentors",
                table: "Exams");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_CreatedBy",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_ModifiedBy",
                table: "Students");

            migrationBuilder.DropTable(
                name: "ExamAnswers");

            migrationBuilder.DropTable(
                name: "ExamQuestions");

            migrationBuilder.DropTable(
                name: "ExamSubmissions");

            migrationBuilder.DropTable(
                name: "ExamAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Exams",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "end_time",
                table: "Mentor_Sessions");

            migrationBuilder.DropColumn(
                name: "meeting_link",
                table: "Mentor_Sessions");

            migrationBuilder.DropColumn(
                name: "session_date",
                table: "Mentor_Sessions");

            migrationBuilder.DropColumn(
                name: "start_time",
                table: "Mentor_Sessions");

            migrationBuilder.DropColumn(
                name: "title",
                table: "Mentor_Sessions");

            migrationBuilder.DropColumn(
                name: "difficulty_level",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "title",
                table: "Exams");

            migrationBuilder.DropColumn(
                name: "description",
                table: "Assignments");

            migrationBuilder.DropColumn(
                name: "file_path",
                table: "Assignment_Submissions");

            migrationBuilder.RenameColumn(
                name: "duration",
                table: "Exams",
                newName: "user_id");

            migrationBuilder.AlterColumn<bool>(
                name: "is_active",
                table: "Subjects_Skills",
                type: "bit",
                nullable: true,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<int>(
                name: "user_id",
                table: "Students",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "rating",
                table: "Student_Mentor_Feedback",
                type: "decimal(2,1)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(2,1)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_at",
                table: "Student_Mentor_Feedback",
                type: "datetime2",
                nullable: true,
                defaultValueSql: "(sysdatetime())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "(sysdatetime())");

            migrationBuilder.AlterColumn<decimal>(
                name: "productivity_score",
                table: "Performance_Report",
                type: "decimal(5,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)");

            migrationBuilder.AlterColumn<string>(
                name: "subject",
                table: "Exams",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "exam_date",
                table: "Exams",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");

            migrationBuilder.AlterColumn<int>(
                name: "created_by",
                table: "Exams",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "modified_at",
                table: "Exams",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "modified_by",
                table: "Exams",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK__Exams__9C8C7BE968659802",
                table: "Exams",
                column: "exam_id");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_modified_by",
                table: "Exams",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_user_id",
                table: "Exams",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK__Exams__created_b__74AE54BC",
                table: "Exams",
                column: "created_by",
                principalTable: "Users",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK__Exams__modified___75A278F5",
                table: "Exams",
                column: "modified_by",
                principalTable: "Users",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK__Exams__user_id__73BA3083",
                table: "Exams",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK__Students__create__2D27B809",
                table: "Students",
                column: "created_by",
                principalTable: "Users",
                principalColumn: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK__Students__modifi__2E1BDC42",
                table: "Students",
                column: "modified_by",
                principalTable: "Users",
                principalColumn: "user_id");
        }
    }
}
