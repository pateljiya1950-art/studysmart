-- Clean up invalid auto-generated broadcast submissions
-- This deletes rows created when an assignment was generated, where no actual file was submitted
DELETE FROM [studentdb].[dbo].[Assignment_Submissions]
WHERE [submitted_at] IS NULL OR [file_path] IS NULL;

-- Note: The new codebase inserts a submission row ONLY when a student actually uploads a file.
