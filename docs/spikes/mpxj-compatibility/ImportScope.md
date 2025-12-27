# Import Scope Definition: MVP vs Full Release

## Executive Summary

This document defines the scope of file import functionality for ProjectLibre's React-based interface, outlining a phased approach from MVP to full enterprise release.

## MVP Import Scope (Phase 1)

### Target User Profile
- **Primary**: Small to medium project managers (1-50 team members)
- **Secondary**: Individual users migrating from MS Project
- **Tertiary**: Educational users and students

### Supported File Formats

#### Primary Formats (100% Support)
| Format | Extension | Priority | Use Case |
|--------|------------|----------|----------|
| **ProjectLibre** | .pod | **P0** | Native format, migration between versions |
| **MS Project XML** | .xml | **P0** | MS Project users (most common format) |
| **Primavera XER** | .xer | **P1** | Enterprise users migrating from P6 |

#### File Size Limits
- **Maximum File Size**: 5MB
- **Maximum Tasks**: 500 tasks
- **Maximum Resources**: 50 resources
- **Maximum Assignments**: 200 assignments

### Core Features Supported

#### ✅ Must-Have Features

**Project Properties**
```typescript
interface MVPProjectProperties {
  name: string;                    // Project name
  startDate: Date;                // Project start date
  finishDate: Date;               // Project finish date  
  calendarId: string;             // Base calendar reference
}
```

**Task Management**
```typescript
interface MVPTask {
  id: string;                     // Unique task identifier
  name: string;                   // Task name
  start: Date;                    // Start date
  finish: Date;                   // Finish date
  duration: number;               // Duration in days
  progress: number;                // % complete (0-100)
  milestone: boolean;             // Milestone flag
  critical: boolean;              // Critical path flag
  priority: 'low' | 'medium' | 'high'; // Priority level
}
```

**Dependencies**
```typescript
interface MVPDependency {
  taskId: string;                 // Source task ID
  predecessorId: string;          // Predecessor task ID
  type: 'FS' | 'SS' | 'FF' | 'SF'; // Dependency type
  lag: number;                    // Lag in days
}
```

**Resources**
```typescript
interface MVPResource {
  id: string;                     // Unique resource identifier
  name: string;                   // Resource name
  type: 'work' | 'material' | 'cost'; // Resource type
  maxUnits: number;               // Maximum availability (0-1)
  standardRate: number;            // Cost per hour
}
```

**Assignments**
```typescript
interface MVPAssignment {
  taskId: string;                 // Task identifier
  resourceId: string;             // Resource identifier
  units: number;                  // Assignment units (0-1)
  work: number;                   // Work in hours
  start: Date;                    // Assignment start
  finish: Date;                   // Assignment finish
}
```

### ✅ Should-Have Features

**Basic Constraints**
- Start No Earlier Than (SNET)
- Finish No Later Than (FNLT)
- Must Start On (MSO)
- Must Finish On (MFO)

**Simple Calendars**
- Standard work week (Mon-Fri, 9-5)
- Default holidays
- Custom work schedules

**Basic Progress Tracking**
- % Complete
- Actual Start/Finish
- Remaining Duration

### ❌ Out of Scope for MVP

**Advanced Features**
- Custom fields
- Baselines
- Resource leveling
- Multiple calendars
- Cost tracking
- Work contours
- Resource pools
- Team assignments
- Enterprise resources

**Visual Elements**
- Custom formatting
- Bar styles
- Text formatting
- Layout settings
- View configurations

## Full Release Scope (Phase 2-3)

### Extended Format Support

#### Additional Formats
| Format | Extension | Priority | Target Release |
|--------|------------|----------|----------------|
| **MS Project MPP** | .mpp | **P1** | Phase 2 |
| **Primavera PMXML** | .pmxml | **P2** | Phase 2 |
| **MPX** | .mpx | **P3** | Phase 3 |
| **Asta Powerproject** | .pp | **P3** | Phase 3 |

#### Extended File Limits
- **Maximum File Size**: 50MB
- **Maximum Tasks**: 10,000 tasks
- **Maximum Resources**: 1,000 resources
- **Maximum Assignments**: 20,000 assignments

### Advanced Features

#### Phase 2 Additions

**Custom Fields**
```typescript
interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'duration' | 'cost' | 'flag';
  value: any;
  formula?: string;
}
```

**Baselines**
```typescript
interface Baseline {
  id: number;                     // Baseline number (0-10)
  name: string;                   // Baseline name
  savedDate: Date;                // When baseline was saved
  tasks: BaselineTask[];          // Task baseline data
}
```

**Advanced Calendars**
```typescript
interface AdvancedCalendar {
  id: string;
  name: string;
  baseCalendarId?: string;        // Parent calendar
  workingDays: boolean[];         // Working days (Sun-Sat)
  workingTimes: WorkTime[];        // Work periods per day
  exceptions: CalendarException[]; // Holiday/exception periods
}
```

**Cost Tracking**
```typescript
interface CostData {
  fixedCost: number;              // Fixed task cost
  actualCost: number;             // Actual cost incurred
  remainingCost: number;          // Estimated remaining cost
  budget: number;                 // Budget amount
  costVariance: number;           // Budget variance
}
```

#### Phase 3 Additions

**Resource Pooling**
```typescript
interface ResourcePool {
  id: string;
  name: string;
  enterpriseResources: EnterpriseResource[];
  sharedCalendars: AdvancedCalendar[];
  rateTables: RateTable[];
}
```

**Work Contours**
```typescript
interface WorkContour {
  type: 'flat' | 'back-loaded' | 'front-loaded' | 'bell-curve' | 'turtle';
  customCurve?: number[];        // Custom percentage points
}
```

**Advanced Constraints**
- Start No Earlier Than (SNET)
- Start No Later Than (SNLT)
- Finish No Earlier Than (FNET)
- Finish No Later Than (FNLT)
- Must Start On (MSO)
- Must Finish On (MFO)

## Implementation Strategy

### MVP Development Timeline (4 weeks)

#### Week 1: Core Infrastructure
- MPXJ integration setup
- Basic file readers (.pod, .xml)
- Error handling framework
- File validation

#### Week 2: Data Models
- Core data structures
- Basic task/resource mapping
- Dependency handling
- Data validation rules

#### Week 3: UI Integration
- File upload component
- Import progress indicator
- Validation feedback
- Error messaging

#### Week 4: Testing & Polish
- Unit tests
- Integration tests
- Performance optimization
- Documentation

### Full Release Timeline (8-12 weeks)

#### Phase 2 (6-8 weeks): Extended Features
- Advanced format support
- Custom fields implementation
- Baseline management
- Cost tracking features

#### Phase 3 (4-6 weeks): Enterprise Features
- Resource pooling
- Work contours
- Advanced constraints
- Performance optimizations

## Technical Implementation Details

### MVP Architecture

```typescript
// Core import service
class ImportService {
  private readers: Map<string, ProjectReader> = new Map();
  
  constructor() {
    // Initialize supported readers
    this.readers.set('pod', new ProjectLibreReader());
    this.readers.set('xml', new MSPDIReader());
    this.readers.set('xer', new PrimaveraXERFileReader());
  }
  
  async importFile(file: File): Promise<ImportResult> {
    const extension = this.getFileExtension(file.name);
    const reader = this.readers.get(extension);
    
    if (!reader) {
      throw new Error(`Unsupported file format: ${extension}`);
    }
    
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${file.size} bytes`);
    }
    
    // Read and convert project
    const projectFile = await reader.read(file);
    return this.convertToMVPModel(projectFile);
  }
  
  private convertToMVPModel(projectFile: any): ImportResult {
    // Convert MPXJ ProjectFile to MVP data structures
    // Apply MVP scope limitations
    // Validate data integrity
    // Generate warnings for unsupported features
  }
}
```

### Data Validation Rules

#### MVP Validation
```typescript
interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'boolean';
  constraints?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

const mvpValidationRules: ValidationRule[] = [
  { field: 'name', required: true, type: 'string' },
  { field: 'start', required: true, type: 'date' },
  { field: 'finish', required: true, type: 'date' },
  { field: 'duration', required: true, type: 'number', constraints: { min: 0 } },
  { field: 'progress', required: false, type: 'number', constraints: { min: 0, max: 100 } }
];
```

### Error Handling Strategy

#### Error Categories
```typescript
enum ErrorSeverity {
  FATAL = 'fatal',       // Import cannot continue
  ERROR = 'error',       // Data issue, import continues with warnings
  WARNING = 'warning',   // Minor issue, user notified
  INFO = 'info'         // Informational message
}

interface ImportError {
  severity: ErrorSeverity;
  code: string;
  message: string;
  details?: any;
  resolution?: string;
}
```

## Performance Considerations

### Memory Management
- **Streaming**: Process large files in chunks
- **Lazy Loading**: Load data on-demand
- **Garbage Collection**: Explicit cleanup of large objects
- **Memory Limits**: Monitor and enforce memory budgets

### Processing Optimization
- **Parallel Processing**: Concurrent task processing
- **Caching**: Cache frequently accessed data
- **Indexing**: Fast lookup for dependencies
- **Batch Operations**: Group database operations

## Testing Strategy

### MVP Test Coverage
- **Unit Tests**: 90% code coverage
- **Integration Tests**: All supported formats
- **Performance Tests**: Files up to 5MB, 500 tasks
- **User Acceptance**: Real-world file samples

### Regression Testing
- **Format Compatibility**: Test with different versions
- **Edge Cases**: Corrupted files, empty projects
- **Performance**: Monitor memory usage and speed
- **Cross-browser**: Test in all supported browsers

## Success Metrics

### MVP Success Criteria
- **File Support**: 3 primary formats working
- **Performance**: < 5s import time for 500 tasks
- **Reliability**: < 1% import failure rate
- **User Satisfaction**: > 4.0/5.0 rating

### Full Release Success Criteria
- **Format Support**: 6+ formats with 95% compatibility
- **Performance**: < 30s import time for 10,000 tasks
- **Enterprise Features**: Full advanced feature set
- **Market Adoption**: Competitive with MS Project

## Risk Mitigation

### Technical Risks
- **Memory Leaks**: Implement proper cleanup
- **Performance Issues**: Monitor and optimize bottlenecks
- **Format Changes**: Regular testing with new versions
- **Browser Compatibility**: Cross-browser testing

### Business Risks
- **User Expectations**: Clear communication about limitations
- **Competition**: Focus on unique value propositions
- **Migration Path**: Smooth upgrade from MVP to full version
- **Support Costs**: Comprehensive documentation and self-service

## Conclusion

The phased approach ensures rapid MVP delivery while building a foundation for enterprise-level functionality. By focusing on core use cases first, we can gather user feedback and iterate quickly, then expand capabilities based on real-world usage patterns.

**Key Recommendations:**
1. **Start Simple**: MVP with 3 core formats
2. **Iterate Fast**: 4-week development cycles
3. **User-Driven**: Feature prioritization based on feedback
4. **Performance-First**: Monitor and optimize continuously
5. **Quality Assured**: Comprehensive testing at each phase

This scope provides clear direction for development while maintaining flexibility to adapt to user needs and market requirements.