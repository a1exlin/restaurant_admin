# Manager Work Schedule Builder

A mobile and web schedule builder for restaurant managers to create and edit staff work schedules. Supports Server, Host, Bartender, and Busser roles with editable shifts and headcount tracking.

## Features

- **Role sections**: Server, Host, Bar (Bartender), Busser
- **Staff management**: Add, edit, and delete staff names per role
- **Shift editing**: Tap any cell to enter shift times (e.g. `5-11`, `11-5`, `11-11`, `RO` for requested off)
- **Shift suffixes**: Add section codes like `5-11P`, `11-5F` for floor sections
- **Headcount**: Each role has a footer row showing morning–night headcount (e.g. `3-4` = 3 morning, 4 night)
- **Week navigation**: Previous/Next week and "Today" jump
- **Persistence**: Data saved to localStorage automatically

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

Build output is in `dist/` for deployment.
