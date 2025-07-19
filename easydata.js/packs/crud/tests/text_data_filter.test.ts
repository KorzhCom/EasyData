import { 
    EasyDataTable, 
    DataLoader, 
    ChunkInfo, 
    DataColumnDescriptor,
    DataType
} from '@easydata/core';

import { TextDataFilter } from '../src/filter/text_data_filter';
import { DataFilter } from '../src/filter/data_filter';

describe('TextDataFilter', () => {
    // Mock for DataLoader
    let mockLoader: DataLoader;
    // Source data table
    let sourceTable: EasyDataTable;
    // Filter under test
    let filter: TextDataFilter;
    // Columns for test table
    let columns: DataColumnDescriptor[];
    // Data for test table
    let tableData: any[][];

    // Test environment setup before each test
    beforeEach(() => {
        // Define columns for test table
        columns = [
            { id: 'id', label: 'ID', type: DataType.Int32 },
            { id: 'name', label: 'Name', type: DataType.String },
            { id: 'description', label: 'Description', type: DataType.String },
            { id: 'price', label: 'Price', type: DataType.Currency }
        ];

        // Define data for test table
        tableData = [
            [1, 'Apple', 'Fresh red apple', 1.99],
            [2, 'Banana', 'Yellow fruit', 0.99],
            [3, 'Orange', 'Juicy citrus', 1.49],
            [4, 'Pineapple', 'Tropical fruit', 3.99],
            [5, 'Watermelon', 'Summer favorite', 5.99]
        ];

        // Создаем исходную таблицу данных
        sourceTable = new EasyDataTable({
            columns: columns,
            rows: tableData,
            inMemory: true
        });

        // Create mock for DataLoader
        mockLoader = {
            loadChunk: (chunkInfo: ChunkInfo): Promise<{ table: EasyDataTable, total: number }> => {
                // Emulate фильтрацию на сервере
                const filterValue = chunkInfo['filters']?.[0]?.value?.toLowerCase();
                const filteredData = filterValue 
                    ? tableData.filter(row => {
                        return row.some(cell => 
                            cell && cell.toString().toLowerCase().includes(filterValue)
                        );
                    })
                    : tableData;
                
                const resultTable = new EasyDataTable({
                    columns: columns,
                    rows: filteredData,
                    inMemory: true
                });
                
                return Promise.resolve({
                    table: resultTable,
                    total: filteredData.length
                });
            }
        };

        // Create filter under test
        filter = new TextDataFilter(mockLoader, sourceTable, 'products');
    });

    it('should быть экземпляром класса DataFilter', () => {
        expect(filter).toBeInstanceOf(DataFilter);
        expect(filter).toBeObject();
    });

    it('should return пустую строку для getValue() после создания', () => {
        const value = filter.getValue();
        expect(value).toBe('');
    });

    it('should correctly устанавливать и возвращать значение фильтра', () => {
        return filter.apply('apple')
            .then(() => {
                const value = filter.getValue();
                expect(value).toBe('apple');
            });
    });

    it('should return исходную таблицу при пустом значении фильтра', () => {
        return filter.apply('')
            .then(result => {
                expect(result).toBe(sourceTable);
            });
    });

    it('should return исходную таблицу после очистки фильтра', () => {
        return filter.apply('apple')
            .then(() => filter.clear())
            .then(result => {
                expect(result).toBe(sourceTable);
                expect(filter.getValue()).toBe('');
            });
    });

    it('should фильтровать данные в памяти при полностью загруженной таблице', () => {
        return filter.apply('apple')
            .then(filteredTable => {
                expect(filteredTable).not.toBe(sourceTable);
                expect(filteredTable.getCachedCount()).toBe(2); // Apple и Pineapple
                
                const rows = filteredTable.getCachedRows();
                expect(rows).toBeArray();
                expect(rows.length).toBe(2);
                
                // Check первую строку (Apple)
                expect(rows[0].getValue('name')).toBe('Apple');
                
                // Check вторую строку (Pineapple)
                expect(rows[1].getValue('name')).toBe('Pineapple');
            });
    });

    it('should использовать серверную фильтрацию когда таблица не полностью загружена', () => {
        // Создаем частично загруженную таблицу и новый фильтр
        const partialTable = new EasyDataTable({
            columns: columns,
            loader: mockLoader
        });
        
        // Добавляем только часть данных, имитируя неполную загрузку
        partialTable.addRow(tableData[0]);
        partialTable.addRow(tableData[1]);
        partialTable.setTotal(tableData.length); // Общее количество записей больше, чем закешировано
        
        const serverFilter = new TextDataFilter(mockLoader, partialTable, 'products');
        
        // Шпионим за методом loadChunk у mockLoader
        const loadChunkSpy = jest.spyOn(mockLoader, 'loadChunk');
        
        return serverFilter.apply('orange')
            .then(filteredTable => {
                // Check, что был вызван метод loadChunk
                expect(loadChunkSpy).toHaveBeenCalled();
                
                // Check, что фильтр был передан в запрос
                const callArgs = loadChunkSpy.mock.calls[0][0];
                expect(callArgs).toBeObject();
                expect(callArgs.filters).toBeArray();
                expect(callArgs.filters[0].value).toBe('orange');
                
                // Check результаты фильтрации
                expect(filteredTable.getCachedCount()).toBe(1);
                expect(filteredTable.getCachedRows()[0].getValue('name')).toBe('Orange');
            });
    });

    it('should поддерживать множественные поисковые слова через разделитель ||', () => {
        return filter.apply('apple || melon')
            .then(filteredTable => {
                const rows = filteredTable.getCachedRows();
                expect(rows).toBeArray();
                expect(rows.length).toBe(3); // Apple, Pineapple, Watermelon
                
                const names = rows.map(row => row.getValue('name'));
                expect(names).toContain('Apple');
                expect(names).toContain('Pineapple');
                expect(names).toContain('Watermelon');
            });
    });

    it('should фильтровать по нескольким колонкам', () => {
        return filter.apply('fruit')
            .then(filteredTable => {
                const rows = filteredTable.getCachedRows();
                expect(rows).toBeArray();
                expect(rows.length).toBe(3); // Banana, Orange, Pineapple
                
                const names = rows.map(row => row.getValue('name'));
                expect(names).toContain('Banana');
                expect(names).toContain('Orange');
                expect(names).toContain('Pineapple');
            });
    });

    it('should фильтровать без учета регистра', () => {
        return filter.apply('APPLE')
            .then(filteredTable => {
                const rows = filteredTable.getCachedRows();
                expect(rows).toBeArray();
                expect(rows.length).toBe(2); // Apple, Pineapple
                
                const names = rows.map(row => row.getValue('name'));
                expect(names).toContain('Apple');
                expect(names).toContain('Pineapple');
            });
    });

    it('should return пустую таблицу если нет соответствий', () => {
        return filter.apply('nonexistent')
            .then(filteredTable => {
                expect(filteredTable.getCachedCount()).toBe(0);
                expect(filteredTable.getCachedRows()).toBeEmpty();
            });
    });

    it('should фильтровать по числовым значениям', () => {
        return filter.apply('1.99')
            .then(filteredTable => {
                const rows = filteredTable.getCachedRows();
                expect(rows).toBeArray();
                expect(rows.length).toBe(1); // Apple с ценой 1.99
                expect(rows[0].getValue('name')).toBe('Apple');
                expect(rows[0].getValue('price')).toBe(1.99);
            });
    });
});
