# JSON Export Feature for HypoGen AI

## Overview
The JSON export feature allows users to download their generated research hypotheses as JSON files for data portability and integration with other systems.

## Implementation Details

### Location
The JSON export functionality is implemented in two components:

1. **HypothesisGenerator.tsx** - Main hypothesis generation component
2. **AdvancedFeatures.tsx** - Advanced features panel

### Functionality

#### In HypothesisGenerator.tsx
- Added `exportToJSON()` function that:
  - Converts hypothesis data to formatted JSON
  - Creates a downloadable blob with proper MIME type
  - Generates timestamped filename (e.g., `hypothesis_1751145809633.json`)
  - Shows success toast notification
  - Cleans up object URLs to prevent memory leaks

#### In AdvancedFeatures.tsx
- Existing `handleExportJSON()` function already implemented
- Available in the blockchain/export section of advanced features

### JSON Structure
The exported JSON contains the following structure:
```json
{
  "hypothesis_text": "Detailed scientific hypothesis statement",
  "key_insights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
  "scientific_references": [
    {
      "title": "Reference title",
      "url": "https://pubmed.ncbi.nlm.nih.gov/example"
    }
  ],
  "confidence_score": 85,
  "created_at": "2025-06-28T21:23:29.627Z",
  "publish_link": "https://sepolia.etherscan.io/tx/0x..." // Optional, if published to blockchain
}
```

### User Interface
- **Export JSON button** appears alongside PDF and Word export buttons
- Located in the hypothesis display section after generation
- Uses File icon from Lucide React
- Styled consistently with other export buttons (orange theme)

### Usage
1. Generate a hypothesis using the AI generator
2. Once hypothesis is displayed, click "Export JSON" button
3. JSON file will be automatically downloaded to user's default download folder
4. Success notification will appear

### Technical Notes
- No external dependencies required (uses native browser APIs)
- Works offline without API calls
- Compatible with all modern browsers
- File size is typically < 5KB for standard hypotheses
- UTF-8 encoded for international character support

### Error Handling
- Checks for null/undefined hypothesis before export
- Graceful handling of missing data
- User-friendly error messages via toast notifications

## Testing
The feature has been tested with:
- ✅ Valid hypothesis data export
- ✅ Null hypothesis handling
- ✅ JSON formatting and structure validation
- ✅ File download simulation
- ✅ Memory leak prevention (URL.revokeObjectURL)

## Future Enhancements
Potential improvements could include:
- Custom filename input
- Export format options (minified vs formatted)
- Batch export of multiple hypotheses
- Integration with cloud storage services
- Export templates for different use cases 