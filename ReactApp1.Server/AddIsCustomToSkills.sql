-- ============================================================
-- Migration: Add is_custom column to Subjects_Skills
-- Run this script once against your studentdb database
-- ============================================================

-- Step 1: Add is_custom column (0 = system skill, 1 = mentor-created)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Subjects_Skills')
      AND name = 'is_custom'
)
BEGIN
    ALTER TABLE dbo.Subjects_Skills
        ADD is_custom BIT NOT NULL DEFAULT 0;
    PRINT 'Column is_custom added to Subjects_Skills.';
END
ELSE
BEGIN
    PRINT 'Column is_custom already exists. Skipping.';
END
GO

-- Step 2: Mark all pre-existing rows as system skills (is_custom = 0)
UPDATE dbo.Subjects_Skills
SET    is_custom = 0
WHERE  is_custom IS NULL;
GO

PRINT 'Migration complete.';
GO
