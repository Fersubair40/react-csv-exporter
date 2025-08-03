import {useCSVExporter} from '../useCSVExporter';

jest.mock('../exportToCSV', () => ({
	exportToCSV: jest.fn(),
}));

import {exportToCSV} from '../exportToCSV';

describe('useCSVExporter', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return a function that calls exportToCSV', () => {
		const csvExporter = useCSVExporter();

		expect(typeof csvExporter).toBe('function');

		const testData = [
			{name: 'John', age: 30},
			{name: 'Jane', age: 25},
		];

		const options = {
			data: testData,
			filename: 'test.csv',
		};

		csvExporter(options);

		expect(exportToCSV).toHaveBeenCalledWith(options);
		expect(exportToCSV).toHaveBeenCalledTimes(1);
	});

	it('should work with TypeScript generics', () => {
		interface User {
			id: number;
			name: string;
			email: string;
		}

		const csvExporter = useCSVExporter<User>();

		const userData: User[] = [
			{id: 1, name: 'John', email: 'john@example.com'},
			{id: 2, name: 'Jane', email: 'jane@example.com'},
		];

		csvExporter({
			data: userData,
			headers: ['id', 'name', 'email'],
			formatters: {
				id: (value) => `#${value}`,
			},
		});

		expect(exportToCSV).toHaveBeenCalledWith({
			data: userData,
			headers: ['id', 'name', 'email'],
			formatters: {
				id: expect.any(Function),
			},
		});
	});

	it('should pass all options through to exportToCSV', () => {
		const csvExporter = useCSVExporter();

		const complexOptions = {
			data: [{a: 1, b: 2}],
			filename: 'complex.csv',
			headers: ['a'],
			labels: ['Column A'],
			delimiter: ';',
			includeBOM: false,
			quoteValues: false,
			addTimestamp: true,
			newline: '\r\n' as const,
			encoding: 'iso-8859-1',
			useKeysAsHeader: false,
			formatters: {
				a: (value: number) => `Value: ${value}`,
			},
			prependRows: [['Header']],
			appendRows: [['Footer']],
			onExportStart: jest.fn(),
			onExportComplete: jest.fn(),
		};

		csvExporter(complexOptions);

		expect(exportToCSV).toHaveBeenCalledWith(complexOptions);
	});
});
