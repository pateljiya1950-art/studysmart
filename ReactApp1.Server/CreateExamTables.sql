-- Drop tables if they exist to recreate them with the EXACT column names expected by Entity Framework
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExamAnswers]') AND type in (N'U'))
    DROP TABLE [dbo].[ExamAnswers];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExamQuestions]') AND type in (N'U'))
    DROP TABLE [dbo].[ExamQuestions];
GO

-- Create ExamQuestions Table
CREATE TABLE [dbo].[ExamQuestions] (
    [question_id] INT IDENTITY(1,1) PRIMARY KEY,
    [exam_id] INT NOT NULL,
    [type] NVARCHAR(50) NOT NULL,
    [difficulty_level] NVARCHAR(50) NOT NULL DEFAULT 'Medium',
    [question_text] NVARCHAR(MAX) NOT NULL,
    [option_a] NVARCHAR(500) NULL,
    [option_b] NVARCHAR(500) NULL,
    [option_c] NVARCHAR(500) NULL,
    [option_d] NVARCHAR(500) NULL,
    [correct_answer] NVARCHAR(500) NULL,
    CONSTRAINT [FK_ExamQuestions_Exams] FOREIGN KEY ([exam_id]) REFERENCES [dbo].[Exams] ([exam_id]) ON DELETE CASCADE
);
PRINT 'ExamQuestions table created successfully.';
GO

-- Create ExamAnswers Table
CREATE TABLE [dbo].[ExamAnswers] (
    [answer_id] INT IDENTITY(1,1) PRIMARY KEY,
    [submission_id] INT NOT NULL,
    [question_id] INT NOT NULL,
    [selected_option] NVARCHAR(500) NULL,
    [descriptive_answer] NVARCHAR(MAX) NULL,
    [score] DECIMAL(5,2) NULL,
    CONSTRAINT [FK_ExamAnswers_Submissions] FOREIGN KEY ([submission_id]) REFERENCES [dbo].[ExamSubmissions] ([submission_id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ExamAnswers_Questions] FOREIGN KEY ([question_id]) REFERENCES [dbo].[ExamQuestions] ([question_id])
);
PRINT 'ExamAnswers table created successfully.';
GO
