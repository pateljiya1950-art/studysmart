using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactApp1.Server.Migrations
{
    /// <inheritdoc />
    public partial class StudentMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    status = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__B9BE370F60A8A2F1", x => x.user_id);
                    table.ForeignKey(
                        name: "FK__Users__created_b__286302EC",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Users__modified___29572725",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Analytics_Daily",
                columns: table => new
                {
                    analytics_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: true),
                    study_minutes = table.Column<int>(type: "int", nullable: true),
                    completed_tasks = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Analytic__D5DC3DE1ABD258CA", x => x.analytics_id);
                    table.ForeignKey(
                        name: "FK__Analytics__user___236943A5",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    announcement_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    admin_id = table.Column<int>(type: "int", nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Announce__C640A82D367A1503", x => x.announcement_id);
                    table.ForeignKey(
                        name: "FK__Announcem__admin__09A971A2",
                        column: x => x.admin_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Announcem__creat__0A9D95DB",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Announcem__modif__0B91BA14",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Calendar_Events",
                columns: table => new
                {
                    event_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    event_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    event_date = table.Column<DateOnly>(type: "date", nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Calendar__2370F7270ACF0B8B", x => x.event_id);
                    table.ForeignKey(
                        name: "FK__Calendar___creat__1F98B2C1",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Calendar___modif__208CD6FA",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Calendar___user___1EA48E88",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Exams",
                columns: table => new
                {
                    exam_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    subject = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    exam_date = table.Column<DateOnly>(type: "date", nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Exams__9C8C7BE968659802", x => x.exam_id);
                    table.ForeignKey(
                        name: "FK__Exams__created_b__74AE54BC",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Exams__modified___75A278F5",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Exams__user_id__73BA3083",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Materials",
                columns: table => new
                {
                    material_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    file_path = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    uploaded_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Material__6BFE1D28B6ABCEE3", x => x.material_id);
                    table.ForeignKey(
                        name: "FK__Materials__creat__6FE99F9F",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Materials__modif__70DDC3D8",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Materials__user___6EF57B66",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Mentors",
                columns: table => new
                {
                    mentor_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    experience_years = table.Column<int>(type: "int", nullable: true),
                    max_students = table.Column<int>(type: "int", nullable: true),
                    availability_status = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Mentors__E5D27EF37A466080", x => x.mentor_id);
                    table.ForeignKey(
                        name: "FK__Mentors__created__32E0915F",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentors__modifie__33D4B598",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentors__user_id__31EC6D26",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    note_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notes__CEDD0FA47B0D9DD5", x => x.note_id);
                    table.ForeignKey(
                        name: "FK__Notes__user_id__6B24EA82",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    notify_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    message = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    is_read = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notifica__DD351C9692495855", x => x.notify_id);
                    table.ForeignKey(
                        name: "FK__Notificat__user___10566F31",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Performance_Report",
                columns: table => new
                {
                    report_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    productivity_score = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    report_date = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Performa__779B7C587A74BA95", x => x.report_id);
                    table.ForeignKey(
                        name: "FK__Performan__user___2645B050",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    student_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    course = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    semester = table.Column<int>(type: "int", nullable: true),
                    university = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Students__2A33069A72758BB4", x => x.student_id);
                    table.ForeignKey(
                        name: "FK__Students__create__2D27B809",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Students__modifi__2E1BDC42",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Students__user_i__2C3393D0",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Study_Sessions",
                columns: table => new
                {
                    session_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    subject = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    duration_min = table.Column<int>(type: "int", nullable: true),
                    session_date = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Study_Se__69B13FDC3892D0A0", x => x.session_id);
                    table.ForeignKey(
                        name: "FK__Study_Ses__user___68487DD7",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Subjects_Skills",
                columns: table => new
                {
                    skill_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    skill_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    skill_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Subjects__FBBA83799463EB5B", x => x.skill_id);
                    table.ForeignKey(
                        name: "FK__Subjects___creat__38996AB5",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Subjects___modif__398D8EEE",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    task_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Pending"),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Tasks__0492148DE89F3958", x => x.task_id);
                    table.ForeignKey(
                        name: "FK__Tasks__created_b__6477ECF3",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Tasks__modified___656C112C",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Tasks__user_id__6383C8BA",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Assignments",
                columns: table => new
                {
                    assignment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Assignme__DA89181467C232C0", x => x.assignment_id);
                    table.ForeignKey(
                        name: "FK__Assignmen__creat__797309D9",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Assignmen__mento__787EE5A0",
                        column: x => x.mentor_id,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                    table.ForeignKey(
                        name: "FK__Assignmen__modif__7A672E12",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Mentor_Availability",
                columns: table => new
                {
                    availability_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    day_of_week = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    end_time = table.Column<TimeOnly>(type: "time", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Mentor_A__86E3A80175419AE7", x => x.availability_id);
                    table.ForeignKey(
                        name: "FK__Mentor_Av__creat__5629CD9C",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Av__mento__5535A963",
                        column: x => x.mentor_id,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Av__modif__571DF1D5",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "Mentor_Performance",
                columns: table => new
                {
                    mentor_perf_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    period_start = table.Column<DateOnly>(type: "date", nullable: true),
                    period_end = table.Column<DateOnly>(type: "date", nullable: true),
                    students_handled = table.Column<int>(type: "int", nullable: true),
                    avg_student_productivity = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    feedback_count = table.Column<int>(type: "int", nullable: true),
                    avg_student_rating = table.Column<decimal>(type: "decimal(3,1)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Mentor_P__564C58C5911ED805", x => x.mentor_perf_id);
                    table.ForeignKey(
                        name: "FK__Mentor_Pe__mento__29221CFB",
                        column: x => x.mentor_id,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                });

            migrationBuilder.CreateTable(
                name: "Daily_Reflection",
                columns: table => new
                {
                    reflection_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: true),
                    mood = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    challenges = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    improvement_plan = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Daily_Re__D8E1913AA540B17D", x => x.reflection_id);
                    table.ForeignKey(
                        name: "FK__Daily_Ref__stude__1AD3FDA4",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "Feedback",
                columns: table => new
                {
                    feedback_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    feedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Feedback__7A6B2B8C33E38C9B", x => x.feedback_id);
                    table.ForeignKey(
                        name: "FK__Feedback__create__04E4BC85",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Feedback__mentor__02FC7413",
                        column: x => x.mentor_id,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                    table.ForeignKey(
                        name: "FK__Feedback__modifi__05D8E0BE",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Feedback__studen__03F0984C",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "Mentor_Sessions",
                columns: table => new
                {
                    session_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    scheduled_datetime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    session_status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Scheduled"),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Mentor_S__69B13FDC9C8E5C11", x => x.session_id);
                    table.ForeignKey(
                        name: "FK__Mentor_Se__creat__5DCAEF64",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Se__mento__5BE2A6F2",
                        column: x => x.mentor_id,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Se__modif__5EBF139D",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Se__stude__5CD6CB2B",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "Mentor_Student",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Mentor_S__3213E83F3614C67E", x => x.id);
                    table.ForeignKey(
                        name: "FK__Mentor_St__creat__4F7CD00D",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentor_St__mento__4D94879B",
                        column: x => x.mentor_id,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                    table.ForeignKey(
                        name: "FK__Mentor_St__modif__5070F446",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentor_St__stude__4E88ABD4",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "Student_Goals",
                columns: table => new
                {
                    goal_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    goal_title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    target_tasks = table.Column<int>(type: "int", nullable: true),
                    target_hours = table.Column<int>(type: "int", nullable: true),
                    start_date = table.Column<DateOnly>(type: "date", nullable: true),
                    end_date = table.Column<DateOnly>(type: "date", nullable: true),
                    goal_status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Active"),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Student___76679A24749B0B3A", x => x.goal_id);
                    table.ForeignKey(
                        name: "FK__Student_G__creat__160F4887",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Student_G__modif__17036CC0",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Student_G__stude__151B244E",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "Student_Mentor_Feedback",
                columns: table => new
                {
                    feedback_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    rating = table.Column<decimal>(type: "decimal(2,1)", nullable: true),
                    comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Student___7A6B2B8C8B8469CD", x => x.feedback_id);
                    table.ForeignKey(
                        name: "FK__Student_M__creat__2EDAF651",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Student_M__mento__2DE6D218",
                        column: x => x.mentor_id,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                    table.ForeignKey(
                        name: "FK__Student_M__modif__2FCF1A8A",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Student_M__stude__2CF2ADDF",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "Mentor_Requests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    skill_id = table.Column<int>(type: "int", nullable: false),
                    request_status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true, defaultValue: "Pending"),
                    requested_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    responded_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Mentor_R__18D3B90F2AAB317F", x => x.request_id);
                    table.ForeignKey(
                        name: "FK__Mentor_Re__creat__48CFD27E",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Re__mento__46E78A0C",
                        column: x => x.mentor_id,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Re__modif__49C3F6B7",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Re__skill__47DBAE45",
                        column: x => x.skill_id,
                        principalTable: "Subjects_Skills",
                        principalColumn: "skill_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Re__stude__45F365D3",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateTable(
                name: "Mentor_Skills",
                columns: table => new
                {
                    mentor_skill_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    mentor_id = table.Column<int>(type: "int", nullable: false),
                    skill_id = table.Column<int>(type: "int", nullable: false),
                    proficiency_level = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    experience_years = table.Column<int>(type: "int", nullable: true),
                    created_by = table.Column<int>(type: "int", nullable: true),
                    modified_by = table.Column<int>(type: "int", nullable: true),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Mentor_S__90A45BD5305BD820", x => x.mentor_skill_id);
                    table.ForeignKey(
                        name: "FK__Mentor_Sk__creat__3F466844",
                        column: x => x.created_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Sk__mento__3D5E1FD2",
                        column: x => x.mentor_id,
                        principalTable: "Mentors",
                        principalColumn: "mentor_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Sk__modif__403A8C7D",
                        column: x => x.modified_by,
                        principalTable: "Users",
                        principalColumn: "user_id");
                    table.ForeignKey(
                        name: "FK__Mentor_Sk__skill__3E52440B",
                        column: x => x.skill_id,
                        principalTable: "Subjects_Skills",
                        principalColumn: "skill_id");
                });

            migrationBuilder.CreateTable(
                name: "Assignment_Submissions",
                columns: table => new
                {
                    submission_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    assignment_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    submitted_at = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Assignme__9B535595F8FEE8A6", x => x.submission_id);
                    table.ForeignKey(
                        name: "FK__Assignmen__assig__7E37BEF6",
                        column: x => x.assignment_id,
                        principalTable: "Assignments",
                        principalColumn: "assignment_id");
                    table.ForeignKey(
                        name: "FK__Assignmen__stude__7F2BE32F",
                        column: x => x.student_id,
                        principalTable: "Students",
                        principalColumn: "student_id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Analytics_Daily_user_id",
                table: "Analytics_Daily",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_admin_id",
                table: "Announcements",
                column: "admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_created_by",
                table: "Announcements",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_modified_by",
                table: "Announcements",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Submissions_assignment_id",
                table: "Assignment_Submissions",
                column: "assignment_id");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_Submissions_student_id",
                table: "Assignment_Submissions",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_created_by",
                table: "Assignments",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_mentor_id",
                table: "Assignments",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_modified_by",
                table: "Assignments",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Calendar_Events_created_by",
                table: "Calendar_Events",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Calendar_Events_modified_by",
                table: "Calendar_Events",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Calendar_Events_user_id",
                table: "Calendar_Events",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Daily_Reflection_student_id",
                table: "Daily_Reflection",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_created_by",
                table: "Exams",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_modified_by",
                table: "Exams",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Exams_user_id",
                table: "Exams",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_created_by",
                table: "Feedback",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_mentor_id",
                table: "Feedback",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_modified_by",
                table: "Feedback",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_student_id",
                table: "Feedback",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Materials_created_by",
                table: "Materials",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Materials_modified_by",
                table: "Materials",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Materials_user_id",
                table: "Materials",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Availability_created_by",
                table: "Mentor_Availability",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Availability_mentor_id",
                table: "Mentor_Availability",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Availability_modified_by",
                table: "Mentor_Availability",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Performance_mentor_id",
                table: "Mentor_Performance",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Requests_created_by",
                table: "Mentor_Requests",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Requests_mentor_id",
                table: "Mentor_Requests",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Requests_modified_by",
                table: "Mentor_Requests",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Requests_skill_id",
                table: "Mentor_Requests",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Requests_student_id",
                table: "Mentor_Requests",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Sessions_created_by",
                table: "Mentor_Sessions",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Sessions_mentor_id",
                table: "Mentor_Sessions",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Sessions_modified_by",
                table: "Mentor_Sessions",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Sessions_student_id",
                table: "Mentor_Sessions",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Skills_created_by",
                table: "Mentor_Skills",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Skills_mentor_id",
                table: "Mentor_Skills",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Skills_modified_by",
                table: "Mentor_Skills",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Skills_skill_id",
                table: "Mentor_Skills",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Student_created_by",
                table: "Mentor_Student",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Student_mentor_id",
                table: "Mentor_Student",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Student_modified_by",
                table: "Mentor_Student",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentor_Student_student_id",
                table: "Mentor_Student",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Mentors_created_by",
                table: "Mentors",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentors_modified_by",
                table: "Mentors",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Mentors_user_id",
                table: "Mentors",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_user_id",
                table: "Notes",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_user_id",
                table: "Notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Performance_Report_user_id",
                table: "Performance_Report",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Student_Goals_created_by",
                table: "Student_Goals",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Student_Goals_modified_by",
                table: "Student_Goals",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Student_Goals_student_id",
                table: "Student_Goals",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Student_Mentor_Feedback_created_by",
                table: "Student_Mentor_Feedback",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Student_Mentor_Feedback_mentor_id",
                table: "Student_Mentor_Feedback",
                column: "mentor_id");

            migrationBuilder.CreateIndex(
                name: "IX_Student_Mentor_Feedback_modified_by",
                table: "Student_Mentor_Feedback",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Student_Mentor_Feedback_student_id",
                table: "Student_Mentor_Feedback",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Students_created_by",
                table: "Students",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Students_modified_by",
                table: "Students",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Students_user_id",
                table: "Students",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Study_Sessions_user_id",
                table: "Study_Sessions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_Skills_created_by",
                table: "Subjects_Skills",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_Skills_modified_by",
                table: "Subjects_Skills",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_created_by",
                table: "Tasks",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_modified_by",
                table: "Tasks",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_user_id",
                table: "Tasks",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_created_by",
                table: "Users",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "IX_Users_modified_by",
                table: "Users",
                column: "modified_by");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__AB6E616429FBAA00",
                table: "Users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Analytics_Daily");

            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.DropTable(
                name: "Assignment_Submissions");

            migrationBuilder.DropTable(
                name: "Calendar_Events");

            migrationBuilder.DropTable(
                name: "Daily_Reflection");

            migrationBuilder.DropTable(
                name: "Exams");

            migrationBuilder.DropTable(
                name: "Feedback");

            migrationBuilder.DropTable(
                name: "Materials");

            migrationBuilder.DropTable(
                name: "Mentor_Availability");

            migrationBuilder.DropTable(
                name: "Mentor_Performance");

            migrationBuilder.DropTable(
                name: "Mentor_Requests");

            migrationBuilder.DropTable(
                name: "Mentor_Sessions");

            migrationBuilder.DropTable(
                name: "Mentor_Skills");

            migrationBuilder.DropTable(
                name: "Mentor_Student");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Performance_Report");

            migrationBuilder.DropTable(
                name: "Student_Goals");

            migrationBuilder.DropTable(
                name: "Student_Mentor_Feedback");

            migrationBuilder.DropTable(
                name: "Study_Sessions");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "Assignments");

            migrationBuilder.DropTable(
                name: "Subjects_Skills");

            migrationBuilder.DropTable(
                name: "Students");

            migrationBuilder.DropTable(
                name: "Mentors");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
