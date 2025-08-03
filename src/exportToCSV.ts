export interface CSVExportOptions<T> {
	data: T[];
	filename?: string;
	headers?: (keyof T | string)[];
	labels?: string[];
	includeBOM?: boolean;
	delimiter?: string;
	formatters?: Partial<Record<keyof T, (value: any) => string>>;
	quoteValues?: boolean;
	addTimestamp?: boolean;
	newline?: '\n' | '\r\n';
	onExportStart?: () => void;
	onExportComplete?: () => void;
	prependRows?: string[][];
	appendRows?: string[][];
	encoding?: string;
	useKeysAsHeader?: boolean;
	includeHeader?: boolean;
}

const escapeCSVValue = (value: any, quoteValues: boolean, delimiter: string): string => {
	if (value === null || value === undefined) return '';
	const stringValue = String(value);
	if (
		quoteValues ||
		stringValue.includes(delimiter) ||
		stringValue.includes('"') ||
		stringValue.includes('\n')
	) {
		return `"${stringValue.replace(/"/g, '""')}"`;
	}
	return stringValue;
};

export const exportToCSV = <T extends Record<string, any>>({
	data,
	filename = 'export.csv',
	headers,
	labels,
	includeBOM = false,
	delimiter = ',',
	formatters = {},
	quoteValues = true,
	addTimestamp = false,
	newline = '\n',
	onExportStart,
	onExportComplete,
	prependRows = [],
	appendRows = [],
	encoding = 'utf-8',
	useKeysAsHeader = false,
	includeHeader = true,
}: CSVExportOptions<T>): void => {
	if (!data || data.length === 0) return;

	onExportStart?.();

	const keys = headers || (Object.keys(data[0]) as (keyof T)[]);
	const headerRow = useKeysAsHeader ? keys.map(String) : (labels || keys.map(String));

	const csvRows = data.map((row) =>
		keys
			.map((key) => {
				const raw = row[key as keyof T];
				const formatted = formatters[key as keyof T]?.(raw) ?? raw;
				return escapeCSVValue(formatted, quoteValues, delimiter);
			})
			.join(delimiter)
	);

	const contentRows = [
		...prependRows.map((r) => r.join(delimiter)),
		...(includeHeader ? [headerRow.join(delimiter)] : []),
		...csvRows,
		...appendRows.map((r) => r.join(delimiter)),
	];

	const content = contentRows.join(newline);

	const finalCsv = (includeBOM ? '\uFEFF' : '') + content;
	const finalFilename = addTimestamp
		? filename.replace(/\.csv$/, '') + '-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.csv'
		: filename;

	const blob = new Blob([finalCsv], {type: 'text/csv;charset=' + encoding});
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', finalFilename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);

	onExportComplete?.();
};
