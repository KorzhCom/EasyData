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
    // Мок для DataLoader
    let mockLoader: DataLoader;
    // Исходная таблица данных
    let sourceTable: EasyDataTable;
    // Тестируемый фильтр
    let filter: TextDataFilter;
    // Колонки для тестовой таблицы
    let columns: DataColumnDescriptor[];
    // Данные для тестовой таблицы
    let tableData: any[][];

    // Настройка тестового окружения перед каждым тестом
    beforeEach(() => {
        // Определяем колонки для тестовой таблицы
        columns = [
            { id: 'id', label: 'ID', type: DataType.Int32 },
            { id: 'name', label: 'Name', type: DataType.String },
            { id: 'description', label: 'Description', type: DataType.String },
            { id: 'price', label: 'Price', type: DataType.Currency }
        ];

        // Определяем данные для тестовой таблицы
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

        // Создаем мок для DataLoader
        mockLoader = {
            loadChunk: (chunkInfo: ChunkInfo): Promise<{ table: EasyDataTable, total: number }> => {
                // Эмулируем фильтрацию на сервере
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

        // Создаем тестируемый фильтр
        filter = new TextDataFilter(mockLoader, sourceTable, 'products');
    });

    it('должен быть экземпляром класса DataFilter', () => {
        expect(filter).toBeInstanceOf(DataFilter);
        expect(filter).toBeObject();
    });

    it('должен возвращать пустую строку для getValue() после создания', () => {
        const value = filter.getValue();
        expect(value).toBe('');
    });

    it('должен корректно устанавливать и возвращать значение фильтра', () => {
        return filter.apply('apple')
            .then(() => {
                const value = filter.getValue();
                expect(value).toBe('apple');
            });
    });

    it('должен возвращать исходную таблицу при пустом значении фильтра', () => {
        return filter.apply('')
            .then(result => {
                expect(result).toBe(sourceTable);
            });
    });

    it('должен возвращать исходную таблицу после очистки фильтра', () => {
        return filter.apply('apple')
            .then(() => filter.clear())
            .then(result => {
                expect(result).toBe(sourceTable);
                expect(filter.getValue()).toBe('');
            });
    });

    it('должен фильтровать данные в памяти при полностью загруженной таблице', () => {
        return filter.apply('apple')
            .then(filteredTable => {
                expect(filteredTable).not.toBe(sourceTable);
                expect(filteredTable.getCachedCount()).toBe(2); // Apple и Pineapple
                
                const rows = filteredTable.getCachedRows();
                expect(rows).toBeArray();
                expect(rows.length).toBe(2);
                
                // Проверяем первую строку (Apple)
                expect(rows[0].getValue('name')).toBe('Apple');
                
                // Проверяем вторую строку (Pineapple)
                expect(rows[1].getValue('name')).toBe('Pineapple');
            });
    });

    it('должен использовать серверную фильтрацию когда таблица не полностью загружена', () => {
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
                // Проверяем, что был вызван метод loadChunk
                expect(loadChunkSpy).toHaveBeenCalled();
                
                // Проверяем, что фильтр был передан в запрос
                const callArgs = loadChunkSpy.mock.calls[0][0];
                expect(callArgs).toBeObject();
                expect(callArgs.filters).toBeArray();
                expect(callArgs.filters[0].value).toBe('orange');
                
                // Проверяем результаты фильтрации
                expect(filteredTable.getCachedCount()).toBe(1);
                expect(filteredTable.getCachedRows()[0].getValue('name')).toBe('Orange');
            });
    });

    it('должен поддерживать множественные поисковые слова через разделитель ||', () => {
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

    it('должен фильтровать по нескольким колонкам', () => {
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

    it('должен фильтровать без учета регистра', () => {
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

    it('должен возвращать пустую таблицу если нет соответствий', () => {
        return filter.apply('nonexistent')
            .then(filteredTable => {
                expect(filteredTable.getCachedCount()).toBe(0);
                expect(filteredTable.getCachedRows()).toBeEmpty();
            });
    });

    it('должен фильтровать по числовым значениям', () => {
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
