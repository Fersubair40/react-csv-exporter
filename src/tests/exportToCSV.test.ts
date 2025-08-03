import {exportToCSV} from '../exportToCSV';

const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

beforeEach(() => {
	mockCreateElement.mockReturnValue({
		href: '',
		setAttribute: jest.fn(),
		click: mockClick,
	});

	Object.defineProperty(document, 'createElement', {
		value: mockCreateElement,
		writable: true,
	});

	Object.defineProperty(document.body, 'appendChild', {
		value: mockAppendChild,
		writable: true,
	});

	Object.defineProperty(document.body, 'removeChild', {
		value: mockRemoveChild,
		writable: true,
	});

	mockCreateObjectURL.mockReturnValue('blob:mock-url');
	Object.defineProperty(URL, 'createObjectURL', {
		value: mockCreateObjectURL,
		writable: true,
	});

	Object.defineProperty(URL, 'revokeObjectURL', {
		value: mockRevokeObjectURL,
		writable: true,
	});

	global.Blob = jest.fn().mockImplementation((content, options) => ({
		content,
		options,
	})) as any;
});

afterEach(() => {
	jest.clearAllMocks();
});

describe('exportToCSV', () => {
	const sampleData = [
		{name: 'John Doe', age: 30, email: 'john@example.com'},
		{name: 'Jane Smith', age: 25, email: 'jane@example.com'},
	];

	it('should export basic CSV with default options', () => {
		exportToCSV({data: sampleData});

		expect(global.Blob).toHaveBeenCalledWith([expect.stringContaining('name,age,email')], {
			type: 'text/csv;charset=utf-8',
		});
		expect(mockCreateObjectURL).toHaveBeenCalled();
		expect(mockClick).toHaveBeenCalled();
		expect(mockRevokeObjectURL).toHaveBeenCalled();
	});

	it('should use custom filename', () => {
		const filename = 'custom-export.csv';
		exportToCSV({data: sampleData, filename});

		const mockElement = mockCreateElement.mock.results[0].value;
		expect(mockElement.setAttribute).toHaveBeenCalledWith('download', filename);
	});

	it('should add timestamp to filename when addTimestamp is true', () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2023-12-25T10:30:45.123Z'));

		exportToCSV({data: sampleData, filename: 'test.csv', addTimestamp: true});

		const mockElement = mockCreateElement.mock.results[0].value;
		expect(mockElement.setAttribute).toHaveBeenCalledWith(
			'download',
			'test-2023-12-25T10-30-45.csv'
		);

		jest.useRealTimers();
	});

	it('should use custom delimiter', () => {
		exportToCSV({data: sampleData, delimiter: ';'});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toContain('name;age;email');
		expect(blobContent).toContain('"John Doe";"30";"john@example.com"');
	});

	it('should use custom headers and labels', () => {
		exportToCSV({
			data: sampleData,
			headers: ['name', 'age'],
			labels: ['Full Name', 'Age'],
		});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toContain('Full Name,Age');
		expect(blobContent).toContain('"John Doe","30"');
		expect(blobContent).not.toContain('email');
	});

	it('should skip header row when includeHeader is false', () => {
		exportToCSV({data: sampleData, includeHeader: false});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).not.toContain('name,age,email');
		expect(blobContent).toContain('"John Doe","30","john@example.com"');
	});

	it('should use object keys as headers when useKeysAsHeader is true', () => {
		exportToCSV({data: sampleData, useKeysAsHeader: true, labels: ['Full Name', 'Age', 'Email']});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toContain('name,age,email'); // Uses keys, not labels
		expect(blobContent).not.toContain('Full Name,Age,Email');
	});

	it('should apply custom formatters', () => {
		exportToCSV({
			data: sampleData,
			formatters: {
				age: (value) => `${value} years old`,
				email: (value) => value.toUpperCase(),
			},
		});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toContain('30 years old');
		expect(blobContent).toContain('JOHN@EXAMPLE.COM');
	});

	it('should handle null and undefined values', () => {
		const dataWithNulls = [
			{name: 'John', age: null, email: undefined},
			{name: null, age: 25, email: 'jane@example.com'},
		];

		exportToCSV({data: dataWithNulls});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toContain('"John",,');
		expect(blobContent).toContain(',"25","jane@example.com"');
	});

	it('should escape values containing delimiter', () => {
		const dataWithCommas = [{name: 'Doe, John', description: 'Software Engineer, Senior'}];

		exportToCSV({data: dataWithCommas});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toContain('"Doe, John"');
		expect(blobContent).toContain('"Software Engineer, Senior"');
	});

	it('should escape values containing quotes', () => {
		const dataWithQuotes = [{name: 'John "Johnny" Doe', quote: 'He said "Hello"'}];

		exportToCSV({data: dataWithQuotes});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toContain('"John ""Johnny"" Doe"');
		expect(blobContent).toContain('"He said ""Hello"""');
	});

	it('should include prepend and append rows', () => {
		exportToCSV({
			data: sampleData,
			prependRows: [['Report Title'], ['Generated:', '2023-01-01']],
			appendRows: [['Total:', '2']],
		});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toContain('Report Title');
		expect(blobContent).toContain('Generated:,2023-01-01');
		expect(blobContent).toContain('Total:,2');
	});

	it('should call callbacks when provided', () => {
		const onExportStart = jest.fn();
		const onExportComplete = jest.fn();

		exportToCSV({
			data: sampleData,
			onExportStart,
			onExportComplete,
		});

		expect(onExportStart).toHaveBeenCalled();
		expect(onExportComplete).toHaveBeenCalled();
	});

	it('should use custom newline character', () => {
		exportToCSV({data: sampleData, newline: '\r\n'});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toContain('\r\n');
	});

	it('should exclude BOM by default', () => {
		exportToCSV({data: sampleData});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).not.toMatch(/^\uFEFF/);
	});

	it('should include BOM when includeBOM is true', () => {
		exportToCSV({data: sampleData, includeBOM: true});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).toMatch(/^\uFEFF/);
	});

	it('should exclude BOM when includeBOM is false', () => {
		exportToCSV({data: sampleData, includeBOM: false});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		expect(blobContent).not.toMatch(/^\uFEFF/);
	});

	it('should handle empty data array', () => {
		exportToCSV({data: []});

		expect(global.Blob).not.toHaveBeenCalled();
		expect(mockCreateObjectURL).not.toHaveBeenCalled();
	});

	it('should use custom encoding', () => {
		exportToCSV({data: sampleData, encoding: 'iso-8859-1'});

		expect(global.Blob).toHaveBeenCalledWith([expect.any(String)], {
			type: 'text/csv;charset=iso-8859-1',
		});
	});

	it('should not quote values when quoteValues is false', () => {
		const dataWithSpecialChars = [{name: 'John, Doe', age: 30}];

		exportToCSV({data: dataWithSpecialChars, quoteValues: false});

		const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
		// When quoteValues is false, values with delimiters should still be quoted for correctness
		expect(blobContent).toContain('"John, Doe"');
	});
});
