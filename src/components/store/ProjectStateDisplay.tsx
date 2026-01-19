import React from 'react';
import { 
  useCurrentProject, 
  useRecentProjects, 
  useProjectIsLoading, 
  useProjectError,
  useProjectValidationErrors,
  useProjectActions 
} from '../../hooks/useAppStore';

export const ProjectStateDisplay: React.FC = () => {
  const currentProject = useCurrentProject();
  const recentProjects = useRecentProjects();
  const isLoading = useProjectIsLoading();
  const error = useProjectError();
  const validationErrors = useProjectValidationErrors();
  
  const { setCurrentProject, updateProjectValidation } = useProjectActions();

  const handleProjectChange = (projectId: string) => {
    setCurrentProject(projectId);
  };

  const handleAddValidationError = () => {
    updateProjectValidation({
      name: ['Project name is required'],
      description: ['Description is too short']
    });
  };

  const handleClearValidationErrors = () => {
    updateProjectValidation(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Project State</h2>
      
      {isLoading && (
        <div className="mb-4 p-3 bg-slate-100 text-slate-800 rounded">
          Loading projects...
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Project:</label>
          <p className="p-2 bg-gray-100 rounded">
            {currentProject || 'No project selected'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Recent Projects:</label>
          <select 
            className="w-full p-2 border rounded"
            value={currentProject || ''}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            <option value="">Select a project</option>
            {recentProjects.map((projectId, index) => (
              <option key={index} value={projectId}>
                {projectId}
              </option>
            ))}
          </select>
        </div>

        {validationErrors && (
          <div>
            <h3 className="text-sm font-medium mb-2 text-red-600">Validation Errors:</h3>
            <div className="p-3 bg-red-50 rounded">
              {Object.entries(validationErrors).map(([field, errors]) => (
                <div key={field} className="mb-2">
                  <span className="font-medium">{field}:</span>
                  <ul className="ml-4 list-disc text-sm">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleAddValidationError}
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          >
            Add Validation Error
          </button>
          <button
            onClick={handleClearValidationErrors}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Validation Errors
          </button>
        </div>
      </div>
    </div>
  );
};

