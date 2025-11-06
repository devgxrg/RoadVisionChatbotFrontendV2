# Live Tenders - Default Filters & Deprecation Updates

## Summary of Changes

The Live Tenders module has been updated with new default filters and endpoint deprecation. The `/api/v1/tenderiq/dailytenders` endpoint is now deprecated in favor of the `/api/v1/tenderiq/tenders` endpoint.

## Key Updates

### 1. ✅ Deprecated `/dailytenders` Endpoint
- **Previous**: `GET /api/v1/tenderiq/dailytenders`
- **Current**: `GET /api/v1/tenderiq/tenders` (no parameters = returns latest date)
- **Location**: `src/lib/api/tenderiq.ts:57-100`
- The `fetchDailyTenders()` function now calls `/tenders` endpoint directly
- Returns tenders for the latest scraped date automatically

### 2. ✅ Default Category Filter: "Civil"
- **Behavior**: Automatically selects the first category containing "Civil"
- **Implementation**:
  - Uses existing `getDefaultCategory()` utility function
  - Located in `src/lib/utils/tender-filters.ts:109-117`
  - Filters in order: looks for any category with "Civil" in the name
  - Falls back to "all" if no Civil category found
- **File**: `src/components/tenderiq/LiveTenders.tsx`
- **When Applied**: On initial load, once tenders are fetched

### 3. ✅ Default Minimum Value: 300 Crores
- **Value**: 300 crores (₹3,00,00,00,000 or 3 billion rupees)
- **Conversion**: 300 crores = 3,000,000,000 rupees (300 × 10,000,000)
- **Display**: Input shows "300" for user convenience (in crores)
- **Internal**: Converted to rupees before API calls and filtering
- **File**: `src/components/tenderiq/LiveTenders.tsx:22`
- **Default State**: `const [minValue, setMinValue] = useState("300");`

### 4. ✅ Default Date Filter: Latest Scraped Date
- **Behavior**: Automatically selects the latest available scraped date
- **Implementation**:
  - Fetches available dates from `/api/v1/tenderiq/dates`
  - Finds date marked with `is_latest: true`
  - Falls back to first date if no explicit latest marker
- **File**: `src/components/tenderiq/LiveTenders.tsx:57-81`
- **When Applied**: On initial load, after tenders are fetched
- **Async**: Fetched asynchronously to avoid blocking UI

## Technical Implementation

### Default Filters Logic

```typescript
// File: src/components/tenderiq/LiveTenders.tsx

// State initialization
const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
const [minValue, setMinValue] = useState("300"); // 300 crores

// Auto-set defaults after tenders load
useEffect(() => {
  if (!isLoading && tenders.length > 0) {
    // Set category default
    if (selectedCategory === undefined) {
      const defaultCat = getDefaultCategory(tenders); // Finds "Civil" category
      setSelectedCategory(defaultCat);
    }

    // Set date default
    if (selectedDate === undefined && selectedDateRange === undefined) {
      fetchAvailableDates()
        .then((dates) => {
          const latestDate = dates.find(d => d.is_latest) || dates[0];
          setSelectedDate(latestDate.date);
        });
    }
  }
}, [isLoading, tenders, selectedCategory, selectedDate, selectedDateRange]);
```

### Value Conversion (Crores to Rupees)

```typescript
// User input is in crores, but API expects rupees
// Conversion: 1 crore = 10,000,000 rupees

// For API calls
const { tenders, isLoading } = useLiveFilters({
  minValue: minValue ? parseFloat(minValue) * 10000000 : null, // Convert to rupees
  maxValue: maxValue ? parseFloat(maxValue) * 10000000 : null,
  // ...
});

// For client-side filtering
const minValueRupees = minValue ? parseFloat(minValue) * 10000000 : null;
const maxValueRupees = maxValue ? parseFloat(maxValue) * 10000000 : null;

const filteredTenders = filterTenders(tenders, {
  minValue: minValueRupees,
  maxValue: maxValueRupees,
  // ...
});
```

## Files Modified

### 1. `src/components/tenderiq/LiveTenders.tsx`
- Added `useEffect` hook to initialize defaults
- Updated imports: added `useEffect`, `getDefaultCategory`, `fetchAvailableDates`
- Changed initial state for `selectedCategory` and `selectedDate` to `undefined`
- Added conversion from crores to rupees for value filters
- Added comments explaining default behavior

### 2. `src/lib/api/tenderiq.ts`
- `fetchDailyTenders()` already uses `/tenders` endpoint
- No changes needed (already implemented in previous update)

### 3. `src/lib/utils/tender-filters.ts`
- Existing `getDefaultCategory()` function used for Civil category selection
- No changes needed (function already in place)

## Filter Priority & Behavior

### Default Application Order
1. **Date Filter**: Latest scraped date is selected
2. **Category Filter**: First "Civil" category is selected
3. **Value Filter**: Minimum 300 crores is applied
4. Other filters: Location, max value (optional)

### User Overrides
- Users can change any default filter at any time
- Filters persist during the session
- Clearing a value returns to default behavior

### Filter Combination Example

```
Defaults Applied:
- Category: "Civil Engineering" (contains "Civil")
- Date: "2025-11-05" (latest)
- Min Value: ₹3,00,00,00,000 (300 crores)
- Max Value: (none, unlimited)
- Location: All

Result: Shows all Civil Engineering tenders from 2025-11-05
        with value ≥ 300 crores, sorted by value
```

## API Integration

### Endpoint Used
```
GET /api/v1/tenderiq/tenders?date=2025-11-05&min_value=3000000000&category=Civil+Engineering
```

### Query Parameters
- `date`: ISO date string (e.g., "2025-11-05")
- `min_value`: Value in rupees (e.g., 3000000000 for 300 crores)
- `category`: Category name (e.g., "Civil Engineering")
- Other optional: `date_range`, `location`, `max_value`, `include_all_dates`

### Available Dates Endpoint
```
GET /api/v1/tenderiq/dates

Response:
[
  {
    "date": "2025-11-05",
    "date_str": "5 Nov 2025",
    "run_at": "2025-11-05T08:30:00Z",
    "tender_count": 245,
    "is_latest": true
  },
  // ... more dates
]
```

## User Experience

### Initial Load
1. Page loads with no category/date selected
2. Tenders from latest date are fetched (from `/tenders` endpoint)
3. UI shows loading indicator
4. Once tenders load:
   - Category auto-selects "Civil" match
   - Date auto-selects latest
   - Min value shows 300 crores
   - Filtered results display immediately

### Manual Changes
- User can change category dropdown (all options visible)
- User can change date using DateSelector component
- User can change min/max values in number inputs
- All changes apply immediately with client-side filtering
- API refetch happens when date or category changes

## Conversion Reference

| Crores | Rupees | Display |
|--------|--------|---------|
| 1 | 10,000,000 | ₹1 Cr |
| 100 | 1,000,000,000 | ₹100 Cr |
| 300 | 3,000,000,000 | ₹300 Cr (Default) |
| 500 | 5,000,000,000 | ₹500 Cr |
| 1000 | 10,000,000,000 | ₹1000 Cr |

## Testing Checklist

- [ ] Live Tenders page loads without errors
- [ ] Default category is set to a "Civil" category if available
- [ ] Default min value displays as 300 in the input
- [ ] Default date is set to latest available date
- [ ] Tenders are filtered correctly with these defaults
- [ ] User can manually change any filter
- [ ] Value filters work correctly after crore→rupee conversion
- [ ] DateSelector properly updates the date filter
- [ ] Refresh button re-fetches with current filters
- [ ] No errors in browser console

## Backward Compatibility

- Old code using `fetchDailyTenders()` still works
- Function now routes to `/tenders` endpoint internally
- No breaking changes to component APIs
- Default filters only apply on initial load
- User selections are preserved during session

## Future Considerations

1. **Persistence**: Consider saving user's preferred filters to localStorage
2. **Presets**: Could add "Save Filter Set" functionality
3. **Recent Filters**: Show last used filter combinations
4. **Analytics**: Track which filter combinations are most used
5. **Smart Defaults**: Learn user preferences over time

## Related Documentation

- `TENDERIQ_API_SUGGESTIONS_UPDATED.md` - API endpoint specifications
- `TENDERIQ_ANALYZE_API_SUGGESTIONS.md` - Analyze module endpoints
- `ANALYZE_API_INTEGRATION_GUIDE.md` - Analyze integration guide
- `INTEGRATION_PLAN.md` - Overall integration strategy

## Support & Troubleshooting

### Issue: Defaults not applying
**Solution**: Check browser console for errors, ensure tenders load successfully

### Issue: Wrong category selected
**Solution**: Check that tender categories contain "Civil" text (case-insensitive)

### Issue: Date not set
**Solution**: Verify `/api/v1/tenderiq/dates` endpoint is working

### Issue: Value filter not working
**Solution**: Ensure min/max values are being converted to rupees correctly
