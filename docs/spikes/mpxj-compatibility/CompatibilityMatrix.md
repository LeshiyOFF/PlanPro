# MPXJ Compatibility Matrix

## Overview

This document provides a comprehensive compatibility matrix for MPXJ library integration with ProjectLibre, covering different file formats, versions, and feature support levels.

## Supported File Formats

### Primary Formats (Full Support)

| Format | Extension | Reader Class | Compatibility | Notes |
|---------|------------|--------------|----------------|-------|
| **ProjectLibre** | .pod | ProjectLibreReader | ✅ **Excellent** | Native format, full feature support |
| **MS Project XML** | .xml | MSPDIReader | ✅ **Excellent** | MS Project 2002+ format |
| **Primavera PMXML** | .pmxml | PrimaveraPMFileReader | ✅ **Excellent** | Primavera P6 XML format |
| **Primavera XER** | .xer | PrimaveraXERFileReader | ✅ **Excellent** | Primavera P6 database export |
| **MPX** | .mpx | MPXReader | ✅ **Good** | Legacy MS Project format |

### Secondary Formats (Partial Support)

| Format | Extension | Reader Class | Compatibility | Limitations |
|---------|------------|--------------|----------------|-------------|
| **MS Project MPP** | .mpp | MPPReader | ⚠️ **Partial** | Version-dependent, limited features |
| **Microsoft Project Database** | .mdb | DatabaseReader | ⚠️ **Partial** | Requires ODBC drivers |
| **Asta Powerproject** | .pp | AstaFileReader | ⚠️ **Limited** | Basic task support only |
| **Planner** | .planner | PlannerReader | ⚠️ **Limited** | Basic features only |

## MS Project Version Compatibility

### MPP Format Support Matrix

| MS Project Version | File Version | MPXJ Support | Feature Loss | Recommended Action |
|-------------------|--------------|---------------|--------------|-------------------|
| Project 98 | 8.0 | ❌ **Not Supported** | N/A | Convert to XML format |
| Project 2000 | 9.0 | ❌ **Not Supported** | N/A | Convert to XML format |
| Project 2002 | 10.0 | ⚠️ **Limited** | High | Use MSPDI XML instead |
| Project 2003 | 11.0 | ✅ **Good** | Medium | Test with sample files |
| Project 2007 | 12.0 | ✅ **Good** | Low | Recommended for import |
| Project 2010 | 14.0 | ✅ **Good** | Low | Recommended for import |
| Project 2013 | 15.0 | ✅ **Good** | Low | Recommended for import |
| Project 2016 | 16.0 | ✅ **Good** | Low | Recommended for import |
| Project 2019 | 16.0 | ✅ **Good** | Low | Recommended for import |
| Project 365 | 16.0 | ✅ **Good** | Low | Recommended for import |

### Feature Support by Version

| Feature | MPP 2003 | MPP 2007+ | MSPDI XML | POD |
|---------|-----------|------------|------------|-----|
| **Basic Tasks** | ✅ | ✅ | ✅ | ✅ |
| **Task Dependencies** | ✅ | ✅ | ✅ | ✅ |
| **Resource Assignment** | ✅ | ✅ | ✅ | ✅ |
| **Calendars** | ⚠️ | ✅ | ✅ | ✅ |
| **Baselines** | ⚠️ | ✅ | ✅ | ✅ |
| **Custom Fields** | ❌ | ⚠️ | ✅ | ✅ |
| **Cost Data** | ⚠️ | ✅ | ✅ | ✅ |
| **Work Contours** | ❌ | ⚠️ | ✅ | ✅ |
| **Resource Pools** | ❌ | ❌ | ⚠️ | ✅ |
| **Team Assignments** | ❌ | ❌ | ⚠️ | ✅ |

## Feature Compatibility Analysis

### ✅ Fully Supported Features

#### Core Project Data
- **Project Properties**: Name, start date, finish date, calendar
- **Task Management**: Name, duration, start/finish dates, progress
- **Dependencies**: All four types (FS, SS, FF, SF)
- **Resources**: Name, type, cost, availability
- **Assignments**: Task-resource assignments with units and work

#### Advanced Features
- **Calendars**: Base calendars, exception calendars
- **Constraints**: Start/Finish constraints (ASAP, ALAP, fixed dates)
- **Critical Path**: Critical task identification
- **Baselines**: Multiple baseline support
- **Custom Fields**: Text, number, date, cost fields

### ⚠️ Partially Supported Features

#### MPP Limitations
- **Visual Elements**: Bar styles, text formatting lost
- **Macros**: VBA macros not preserved
- **Embedded Objects**: OLE objects not supported
- **Custom Reports**: Report definitions lost

#### XML Limitations
- **Formatting**: Visual formatting not preserved
- **View Settings**: Custom view configurations lost
- **Filters**: Custom filters may not transfer perfectly

### ❌ Not Supported Features

#### Universal Limitations
- **Password Protection**: Encrypted files require password
- **Corrupted Files**: Damaged files cannot be read
- **Proprietary Extensions**: Vendor-specific features

#### Platform-Specific Limitations
- **Server-Based Projects**: Project Server databases require special handling
- **Enterprise Resources**: Global resource pool connectivity
- **Integration Features**: SharePoint, Teams integrations

## Performance Characteristics

### File Size Impact

| File Size | Tasks | Read Time | Memory Usage | Recommendation |
|------------|-------|-----------|--------------|----------------|
| < 1MB | < 100 | < 1s | < 50MB | ✅ All formats |
| 1-5MB | 100-500 | 1-3s | 50-100MB | ✅ XML/POD preferred |
| 5-20MB | 500-2000 | 3-10s | 100-200MB | ⚠️ POD recommended |
| > 20MB | > 2000 | > 10s | > 200MB | ❌ Split files |

### Format Performance Comparison

| Format | Read Speed | Memory Efficiency | File Size | Overall Rating |
|--------|------------|-------------------|------------|---------------|
| **POD** | Fast | High | Medium | ⭐⭐⭐⭐⭐ |
| **MSPDI XML** | Medium | Medium | Large | ⭐⭐⭐⭐ |
| **XER** | Medium | High | Small | ⭐⭐⭐⭐ |
| **MPP** | Slow | Low | Small | ⭐⭐ |
| **MPX** | Fast | High | Very Small | ⭐⭐⭐ |

## Integration Recommendations

### For MVP Implementation

#### Primary Target Formats
1. **POD (ProjectLibre)** - Native format, full compatibility
2. **MSPDI XML** - MS Project standard, excellent support
3. **XER** - Primavera enterprise format

#### MVP Feature Set
- Basic task import/export
- Resource assignments
- Task dependencies
- Project properties
- Simple constraints

#### File Size Limits
- Maximum 5MB files
- Maximum 1000 tasks
- Maximum 100 resources

### For Full Release

#### Extended Format Support
1. **MPP** - MS Project native format (with limitations)
2. **PMXML** - Primavera XML format
3. **Planner** - Open source project format

#### Advanced Features
- Custom fields mapping
- Baseline management
- Resource pools
- Cost tracking
- Multiple calendars

#### Enterprise Features
- Batch processing
- Cloud storage integration
- API-based import
- Real-time synchronization

## Error Handling Strategy

### File Format Detection
```java
// Automatic format detection using UniversalProjectReader
ProjectReader reader = new UniversalProjectReader();
ProjectFile project = reader.read(inputFile);

// Fallback strategy if automatic detection fails
if (project == null) {
    // Try specific readers based on file extension
    switch (getExtension(inputFile)) {
        case "pod": reader = new ProjectLibreReader(); break;
        case "xml": reader = new MSPDIReader(); break;
        case "xer": reader = new PrimaveraXERFileReader(); break;
        // ... other formats
    }
}
```

### Validation Pipeline
1. **File Existence Check**: Verify file exists and is readable
2. **Format Detection**: Identify file type automatically
3. **Schema Validation**: Validate XML structure for XML formats
4. **Content Validation**: Check required project data
5. **Feature Compatibility**: Map unsupported features
6. **User Warnings**: Report data loss warnings

### Error Categories
- **FATAL**: File not readable, corrupt data
- **WARNING**: Partial data loss, feature limitation
- **INFO**: Successful import with notes

## Testing Strategy

### Test File Matrix
| Format | Version | Size | Complexity | Test Frequency |
|--------|---------|------|------------|----------------|
| POD | Latest | Small/Large | Simple/Complex | Every build |
| MSPDI | 2002-2019 | Small/Large | Simple/Complex | Every build |
| XER | P6 v15-21 | Small/Large | Simple/Complex | Every build |
| MPP | 2007-2019 | Small/Medium | Simple/Complex | Weekly |

### Automated Tests
- **Format Detection Tests**: Verify correct reader selection
- **Import/Export Roundtrip**: Verify data integrity
- **Performance Tests**: Monitor memory and speed
- **Regression Tests**: Ensure backward compatibility

## Conclusion

### Recommended Implementation Priority

1. **Phase 1 (MVP)**: POD + MSPDI XML with basic features
2. **Phase 2 (Beta)**: Add XER support and advanced features  
3. **Phase 3 (Release)**: Add limited MPP support
4. **Phase 4 (Enterprise)**: Extended format support and optimizations

### Key Success Factors
- **Robust Error Handling**: Graceful degradation for unsupported features
- **User Feedback**: Clear communication about data limitations
- **Performance Optimization**: Efficient handling of large files
- **Comprehensive Testing**: Coverage for all supported formats

This compatibility matrix provides the foundation for reliable file import/export functionality in ProjectLibre's React-based interface.