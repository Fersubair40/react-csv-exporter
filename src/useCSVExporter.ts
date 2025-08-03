import {exportToCSV, CSVExportOptions} from './exportToCSV';

export const useCSVExporter = <T extends Record<string, any>>() => {
	return (options: CSVExportOptions<T>) => exportToCSV(options);
};
