-- SQL Script to fix the missing column 'cheating_violations' in the Exam submission table

USE studentdb;
GO

-- Check if table named ExamSubmissions exists and alter it
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExamSubmissions]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'cheating_violations' AND Object_ID = Object_ID(N'[dbo].[ExamSubmissions]')
    )
    BEGIN
        ALTER TABLE [dbo].[ExamSubmissions]
        ADD cheating_violations INT NOT NULL DEFAULT 0;
        
        PRINT 'Added cheating_violations to ExamSubmissions table.';
    END
    ELSE
    BEGIN
        PRINT 'Column cheating_violations already exists in ExamSubmissions.';
    END
END

-- Check if table named Exam_Submissions exists and alter it (if named differently)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Exam_Submissions]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'cheating_violations' AND Object_ID = Object_ID(N'[dbo].[Exam_Submissions]')
    )
    BEGIN
        ALTER TABLE [dbo].[Exam_Submissions]
        ADD cheating_violations INT NOT NULL DEFAULT 0;
        
        PRINT 'Added cheating_violations to Exam_Submissions table.';
    END
    ELSE
    BEGIN
        PRINT 'Column cheating_violations already exists in Exam_Submissions.';
    END
END

-- Ensure ai_score is also present as added during the previous phase
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExamSubmissions]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'ai_score' AND Object_ID = Object_ID(N'[dbo].[ExamSubmissions]')
    )
    BEGIN
        ALTER TABLE [dbo].[ExamSubmissions]
        ADD ai_score DECIMAL(5,2) NULL;
        
        PRINT 'Added ai_score to ExamSubmissions table.';
    END
END
