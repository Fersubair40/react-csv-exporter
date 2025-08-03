# React CSV Exporter

A lightweight, TypeScript-first React library for exporting data to CSV files with extensive customization options.

## Features

- 🚀 **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- 📊 **Flexible Data Handling**: Export arrays of objects with customizable headers and formatting
- 🎨 **Rich Customization**: Control delimiters, encoding, timestamps, and more
- 🔧 **Formatting Support**: Apply custom formatters to specific columns
- 📝 **Header Control**: Use object keys as headers or provide custom labels
- 🎯 **React Hook**: Convenient `useCSVExporter` hook for React components
- 📦 **Lightweight**: Minimal bundle size with no external dependencies

## Installation

```bash
npm install @temilayodev/react-csv-exporter
```

# or

```bash
yarn add @temilayodev/react-csv-exporter
```

## Quick Start

### Basic Usage

```typescript
import {exportToCSV} from '@temilayodev/react-csv-exporter';

const data = [
	{name: 'John Doe', age: 30, email: 'john@example.com'},
	{name: 'Jane Smith', age: 25, email: 'jane@example.com'},
];

// Simple export
exportToCSV({data});
```

### Using the React Hook

```typescript
import {useCSVExporter} from '@temilayodev/react-csv-exporter';

function MyComponent() {
	const exportCSV = useCSVExporter();

	const handleExport = () => {
		exportCSV({
			data: myData,
			filename: 'users.csv',
			headers: ['name', 'age', 'email'],
			labels: ['Full Name', 'Age', 'Email Address'],
		});
	};

	return <button onClick={handleExport}>Export CSV</button>;
}
```

## API Reference

### `exportToCSV<T>(options: CSVExportOptions<T>): void`

Main export function that generates and downloads a CSV file.

### `CSVExportOptions<T>`

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `T[]` | **required** | Array of objects to export |
| `filename` | `string` | `'export.csv'` | Name of the downloaded file |
| `headers` | `(keyof T \| string)[]` | `Object.keys(data[0])` | Column headers to include |
| `labels` | `string[]` | `headers` | Custom labels for headers |
| `useKeysAsHeader` | `boolean` | `false` | Use object keys as header text (ignores labels) |
| `includeHeader` | `boolean` | `true` | Whether to include header row |
| `includeBOM` | `boolean` | `false` | Include UTF-8 BOM for Excel compatibility |
| `delimiter` | `string` | `','` | Column delimiter |
| `quoteValues` | `boolean` | `true` | Wrap values in quotes when needed |
| `newline` | `'\n' \| '\r\n'` | `'\n'` | Line ending style |
| `encoding` | `string` | `'utf-8'` | Text encoding |
| `addTimestamp` | `boolean` | `false` | Append timestamp to filename |
| `formatters` | `Partial<Record<keyof T, (value: any) => string>>` | `{}` | Custom value formatters |
| `prependRows` | `string[][]` | `[]` | Rows to add before data |
| `appendRows` | `string[][]` | `[]` | Rows to add after data |
| `onExportStart` | `() => void` | `undefined` | Callback before export starts |
| `onExportComplete` | `() => void` | `undefined` | Callback after export completes |

### `useCSVExporter<T>(): (options: CSVExportOptions<T>) => void`

React hook that returns the export function.

## Examples

### Custom Headers and Labels

```typescript
const userData = [
	{firstName: 'John', lastName: 'Doe', birthYear: 1993},
	{firstName: 'Jane', lastName: 'Smith', birthYear: 1998},
];

exportToCSV({
	data: userData,
	headers: ['firstName', 'lastName', 'birthYear'],
	labels: ['First Name', 'Last Name', 'Birth Year'],
	filename: 'users.csv',
});
```

### Custom Formatters

```typescript
const products = [
	{name: 'Widget', price: 19.99, inStock: true},
	{name: 'Gadget', price: 29.99, inStock: false},
];

exportToCSV({
	data: products,
	formatters: {
		price: (value) => `$${value.toFixed(2)}`,
		inStock: (value) => (value ? 'Yes' : 'No'),
	},
});
```

### Export Without Headers

```typescript
exportToCSV({
	data: myData,
	useKeysAsHeader: false, // No header row
	filename: 'data-only.csv',
});
```

### Adding Extra Rows

```typescript
exportToCSV({
	data: salesData,
	prependRows: [
		['Sales Report'],
		['Generated on:', new Date().toLocaleDateString()],
		[], // Empty row
	],
	appendRows: [[], ['Total Records:', salesData.length.toString()]],
});
```

### With Callbacks

```typescript
exportToCSV({
	data: largeDataset,
	onExportStart: () => console.log('Export started...'),
	onExportComplete: () => console.log('Export completed!'),
	addTimestamp: true,
});
```

## TypeScript Support

The library is built with TypeScript and provides full type safety:

```typescript
interface User {
	id: number;
	name: string;
	email: string;
}

const users: User[] = [{id: 1, name: 'John', email: 'john@example.com'}];

// TypeScript will enforce correct property names
exportToCSV<User>({
	data: users,
	headers: ['id', 'name'], // ✅ Valid
	// headers: ['invalid'], // ❌ TypeScript error
	formatters: {
		id: (value) => `#${value}`, // ✅ Correct type
		// name: (value) => value.toUpperCase() // ✅ String methods available
	},
});
```

## Browser Compatibility

- Modern browsers with Blob and URL.createObjectURL support
- IE 10+ (with appropriate polyfills)
- All mobile browsers

## License

MIT © Temilayo

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
