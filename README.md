# Trading Journal Frontend

A modern React/Next.js frontend for the trading journal application with real-time stats and filtering capabilities.

## Features

### Trading Journal Management
- Create, edit, and delete journal entries
- Real-time inline editing with auto-save
- Responsive table layout with sorting capabilities

### Statistics & Analytics
- Real-time trading statistics (Total P&L, Win Rate, Total Trades)
- **Month/Year Filtering**: Filter statistics by specific months and years
- Visual indicators for performance trends
- Backend-powered calculations for accurate analytics

### Filtering System
- **Default View**: Shows current month data by default
- **Month Filter**: Filter both statistics AND journal entries by specific months
- **All Data Option**: View complete trading history and overall statistics
- Automatically uses current year for all filters
- Dropdown interface with month names
- Visual feedback showing active filters
- Easy filter clearing with one-click
- **Coordinated Filtering**: When you filter by month, both stats and table update together

## API Integration

The frontend integrates with the Django backend API:

- `GET /api/journal/stats/` - Get overall trading statistics
- `GET /api/journal/stats/?month=X&year=Y` - Get filtered statistics for specific month/year
- `GET /api/journal/entries/` - Get all journal entries
- `POST /api/journal/entries/` - Create new entry
- `PATCH /api/journal/entries/{id}/` - Update entry
- `DELETE /api/journal/entries/{id}/` - Delete entry

## Components

### Core Components
- `TradingJournal` - Main journal interface
- `JournalTable` - Editable table for journal entries
- `StatsCard` - Individual statistic display cards
- `StatsFilter` - Month/year filtering interface

### Hooks
- `useJournal` - Journal entry management
- `useStats` - Statistics and filtering management

## Usage

### Filtering Data
1. **Default View**: The app automatically shows current month data when you first load it
2. **Filter by Month**: 
   - Click the "Filter by Month" button in the top-right corner
   - Select a month from the dropdown (year automatically set to current year)
   - Click "Apply Filter" to see filtered data
3. **View All Data**:
   - Click the "Filter by Month" button
   - Check the "Show All Data" checkbox
   - Click "Apply Filter" to see complete trading history
4. Both stats cards AND journal entries table will update to show data for the selected period
5. A colored banner will appear showing the active filter:
   - Blue banner for month filters: "Showing data for: March 2024"
   - Green banner for all data: "Showing All Data - Complete trading history"
6. Click the X on the filter button to return to current month view

### Adding Journal Entries
1. Click "Add Entry" to create a new empty entry
2. Click on any cell to edit it inline
3. Changes are automatically saved when you click outside the cell

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Backend Requirements

Ensure the Django backend is running with the following endpoints:
- `/api/journal/stats/` - Trading statistics with optional month/year filtering
- `/api/journal/entries/` - CRUD operations for journal entries
