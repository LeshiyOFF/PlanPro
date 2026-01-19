import React, { useState } from 'react';
import { 
  useCurrentResource, 
  useSelectedResources, 
  useResourceAllocation,
  useResourceIsLoading, 
  useResourceError,
  useResourceValidationErrors,
  useSelectedResourcesCount,
  useResourceActions 
} from '../../hooks/useAppStore';
import { createResourceAllocation } from '../../utils/storeUtils';

export const ResourceStateDisplay: React.FC = () => {
  const currentResource = useCurrentResource();
  const selectedResources = useSelectedResources();
  const resourceAllocation = useResourceAllocation();
  const isLoading = useResourceIsLoading();
  const error = useResourceError();
  const validationErrors = useResourceValidationErrors();
  const selectedResourcesCount = useSelectedResourcesCount();
  
  const { 
    setCurrentResource, 
    setSelectedResources, 
    updateResourceAllocation,
    updateResourceValidation 
  } = useResourceActions();
  
  const [newResourceId, setNewResourceId] = useState('');
  const [allocationTaskId, setAllocationTaskId] = useState('');
  const [allocationPercentage, setAllocationPercentage] = useState(50);

  const handleResourceChange = (resourceId: string) => {
    setCurrentResource(resourceId);
  };

  const handleSelectResource = () => {
    if (newResourceId && !selectedResources.includes(newResourceId)) {
      setSelectedResources([...selectedResources, newResourceId]);
      setNewResourceId('');
    }
  };

  const handleRemoveResource = (resourceId: string) => {
    setSelectedResources(selectedResources.filter(id => id !== resourceId));
  };

  const handleAddAllocation = () => {
    if (newResourceId && allocationTaskId) {
      const newAllocation = createResourceAllocation(
        newResourceId,
        allocationTaskId,
        allocationPercentage
      );
      updateResourceAllocation([...resourceAllocation, newAllocation]);
      setAllocationTaskId('');
      setAllocationPercentage(50);
    }
  };

  const handleRemoveAllocation = (index: number) => {
    updateResourceAllocation(resourceAllocation.filter((_, i) => i !== index));
  };

  const handleAddValidationError = () => {
    updateResourceValidation({
      name: ['Resource name is required'],
      capacity: ['Resource capacity must be positive']
    });
  };

  const handleClearValidationErrors = () => {
    updateResourceValidation(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Resource State</h2>
      
      {isLoading && (
        <div className="mb-4 p-3 bg-slate-100 text-slate-800 rounded">
          Loading resources...
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Resource:</label>
          <p className="p-2 bg-gray-100 rounded">
            {currentResource || 'No resource selected'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Selected Resources ({selectedResourcesCount}):</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newResourceId}
              onChange={(e) => setNewResourceId(e.target.value)}
              placeholder="Enter resource ID"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSelectResource}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Resource
            </button>
          </div>
          <div className="space-y-2">
            {selectedResources.map((resourceId) => (
              <div key={resourceId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{resourceId}</span>
                <button
                  onClick={() => handleRemoveResource(resourceId)}
                  className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Resource Allocations ({resourceAllocation.length}):</label>
          <div className="space-y-2 mb-2">
            <input
              type="text"
              value={allocationTaskId}
              onChange={(e) => setAllocationTaskId(e.target.value)}
              placeholder="Task ID"
              className="flex-1 p-2 border rounded"
            />
            <div className="flex gap-2 items-center">
              <label className="text-sm">Percentage:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={allocationPercentage}
                onChange={(e) => setAllocationPercentage(Number(e.target.value))}
                className="w-20 p-2 border rounded"
              />
              <button
                onClick={handleAddAllocation}
                disabled={!newResourceId || !allocationTaskId}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
              >
                Add Allocation
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {resourceAllocation.map((allocation, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{allocation.resourceId}</span>
                  <span className="mx-2">→</span>
                  <span>{allocation.taskId}</span>
                  <span className="ml-2 text-sm text-gray-600">({allocation.percentage}%)</span>
                </div>
                <button
                  onClick={() => handleRemoveAllocation(index)}
                  className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
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
