import React, { useState } from 'react';
import { 
  useCurrentTask, 
  useSelectedTasks, 
  useTaskIsLoading, 
  useTaskError,
  useTaskValidationErrors,
  useSelectedTasksCount,
  useTaskActions 
} from '../../hooks/useAppStore';
import { addTaskDependency } from '../../utils/storeUtils';

export const TaskStateDisplay: React.FC = () => {
  const currentTask = useCurrentTask();
  const selectedTasks = useSelectedTasks();
  const isLoading = useTaskIsLoading();
  const error = useTaskError();
  const validationErrors = useTaskValidationErrors();
  const selectedTasksCount = useSelectedTasksCount();
  
  const { setCurrentTask, setSelectedTasks, updateTaskValidation, setTaskState } = useTaskActions();
  
  const [newTaskId, setNewTaskId] = useState('');
  const [dependencyTaskId, setDependencyTaskId] = useState('');

  const handleTaskChange = (taskId: string) => {
    setCurrentTask(taskId);
  };

  const handleSelectTask = () => {
    if (newTaskId && !selectedTasks.includes(newTaskId)) {
      setSelectedTasks([...selectedTasks, newTaskId]);
      setNewTaskId('');
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setSelectedTasks(selectedTasks.filter(id => id !== taskId));
  };

  const handleAddValidationError = () => {
    updateTaskValidation({
      title: ['Task title is required'],
      duration: ['Duration must be positive']
    });
  };

  const handleClearValidationErrors = () => {
    updateTaskValidation(null);
  };

  const handleAddDependency = () => {
    if (currentTask && dependencyTaskId) {
      setTaskState({
        taskDependencies: addTaskDependency({}, currentTask, dependencyTaskId)
      });
      setDependencyTaskId('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Task State</h2>
      
      {isLoading && (
        <div className="mb-4 p-3 bg-slate-100 text-slate-800 rounded">
          Loading tasks...
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Task:</label>
          <p className="p-2 bg-gray-100 rounded">
            {currentTask || 'No task selected'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Selected Tasks ({selectedTasksCount}):</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTaskId}
              onChange={(e) => setNewTaskId(e.target.value)}
              placeholder="Enter task ID"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSelectTask}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Task
            </button>
          </div>
          <div className="space-y-2">
            {selectedTasks.map((taskId) => (
              <div key={taskId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{taskId}</span>
                <button
                  onClick={() => handleRemoveTask(taskId)}
                  className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {currentTask && (
          <div>
            <label className="block text-sm font-medium mb-2">Add Task Dependency:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dependencyTaskId}
                onChange={(e) => setDependencyTaskId(e.target.value)}
                placeholder="Depends on task ID"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={handleAddDependency}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Add Dependency
              </button>
            </div>
          </div>
        )}

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

