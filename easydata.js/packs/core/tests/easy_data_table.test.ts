import { EasyDataTable, EasyDataTableOptions } from '../src/data/easy_data_table';
import { DataLoader, ChunkInfo } from '../src/data/data_loader';
import { DataColumnDescriptor } from '../src/data/data_column';
import { DataRow } from '../src/data/data_row';
import { DataType } from '../src/types/data_type';

describe('EasyDataTable', () => {
    // Мок для DataLoader
    class MockDataLoader implements DataLoader {
        private data: any[] = [];
        private totalCount: number;

        constructor(data: any[] = [], totalCount?: number) {
            this.data = data;
            this.totalCount = totalCount !== undefined ? totalCount : data.length;
        }

        loadChunk(chunkInfo: ChunkInfo): Promise<{ table: EasyDataTable, total: number }> {
            const { offset, limit, needTotal } = chunkInfo;
            
            const options: EasyDataTableOptions = { 
                inMemory: true,
                columns: [
                    { id: 'id', label: 'ID', type: DataType.Int32 },
                    { id: 'name', label: 'Name', type: DataType.String },
                    { id: 'birthday', label: 'Birthday', type: DataType.Date }
                ],
                rows: this.data.slice(offset, offset + limit)
            };
            
            const table = new EasyDataTable(options);
            return Promise.resolve({ table, total: this.totalCount });
        }
    }

    // Базовые настройки колонок для тестов
    const defaultColumns: DataColumnDescriptor[] = [
        { id: 'id', label: 'ID', type: DataType.Int32 },
        { id: 'name', label: 'Name', type: DataType.String },
        { id: 'birthday', label: 'Birthday', type: DataType.Date }
    ];

    // Тестовые данные для строк
    const testData = [
        { id: 1, name: 'John', birthday: '2000-01-01' },
        { id: 2, name: 'Jane', birthday: '1995-05-15' },
        { id: 3, name: 'Bob', birthday: '1985-12-31' },
        { id: 4, name: 'Alice', birthday: '1990-07-20' }
    ];

    it('должен создаваться с настройками по умолчанию', () => {
        const table = new EasyDataTable();
        
        expect(table).toBeDefined();
        expect(table.columns.count).toBe(0);
        expect(table.chunkSize).toBe(1000);
        expect(table.elasticChunks).toBe(false);
        expect(table.getCachedCount()).toBe(0);
        expect(table.getTotal()).toBe(0);
    });

    it('должен создаваться с пользовательскими настройками', () => {
        const options: EasyDataTableOptions = {
            chunkSize: 500,
            elasticChunks: true,
            inMemory: true,
            columns: defaultColumns
        };
        
        const table = new EasyDataTable(options);
        
        expect(table.chunkSize).toBe(500);
        expect(table.elasticChunks).toBe(true);
        expect(table.columns.count).toBe(3);
    });

    it('должен добавлять колонки при инициализации', () => {
        const table = new EasyDataTable({
            columns: defaultColumns
        });
        
        expect(table.columns.count).toBe(3);
        expect(table.columns.get(0).id).toBe('id');
        expect(table.columns.get(1).id).toBe('name');
        expect(table.columns.get(2).id).toBe('birthday');
    });

    it('должен создавать строки данных из массива значений', () => {
        const table = new EasyDataTable({
            columns: defaultColumns
        });
        
        const row = table.addRow([1, 'John', '2000-01-01']);
        
        expect(row).toBeDefined();
        expect(row.getValue('id')).toBe(1);
        expect(row.getValue('name')).toBe('John');
        expect(row.getValue('birthday') instanceof Date).toBe(true);
    });

    it('должен создавать строки из объектов данных', () => {
        const table = new EasyDataTable({
            columns: defaultColumns,
            rows: testData
        });
        
        expect(table.getCachedCount()).toBe(4);
        
        return table.getRow(1).then(row => {
            expect(row).not.toBeNull();
            expect(row?.getValue('id')).toBe(2);
            expect(row?.getValue('name')).toBe('Jane');
            expect(row?.getValue('birthday') instanceof Date).toBe(true);
        });
    });

    it('должен корректно преобразовывать даты при создании строк', () => {
        const table = new EasyDataTable({
            columns: [
                { id: 'date', label: 'Date', type: DataType.Date },
                { id: 'datetime', label: 'DateTime', type: DataType.DateTime },
                { id: 'time', label: 'Time', type: DataType.Time }
            ]
        });
        
        const row = table.addRow([
            '2022-03-15',
            '2022-03-15T14:30:00',
            '14:30:00'
        ]);
        
        expect(row.getValue('date') instanceof Date).toBe(true);
        expect(row.getValue('datetime') instanceof Date).toBe(true);
        expect(row.getValue('time') instanceof Date).toBe(true);
        
        expect(row.getValue('date').getFullYear()).toBe(2022);
        expect(row.getValue('date').getMonth()).toBe(2); // 0-indexed, March = 2
        expect(row.getValue('date').getDate()).toBe(15);
    });

    it('должен получать строки по смещению и лимиту', () => {
        const table = new EasyDataTable({
            columns: defaultColumns,
            rows: testData
        });
        
        return table.getRows({ offset: 1, limit: 2 }).then(rows => {
            expect(rows.length).toBe(2);
            expect(rows[0].getValue('id')).toBe(2);
            expect(rows[1].getValue('id')).toBe(3);
        });
    });

    it('должен получать строки по странице и размеру страницы', () => {
        const table = new EasyDataTable({
            columns: defaultColumns,
            rows: testData
        });
        
        return table.getRows({ page: 2, pageSize: 2 }).then(rows => {
            expect(rows.length).toBe(2);
            expect(rows[0].getValue('id')).toBe(3);
            expect(rows[1].getValue('id')).toBe(4);
        });
    });

    it('должен возвращать пустой массив строк при запросе за пределами данных', () => {
        const table = new EasyDataTable({
            columns: defaultColumns,
            rows: testData
        });
        
        // Запрос за пределами доступных данных
        return table.getRows({ offset: 10, limit: 5 }).then(rows => {
            expect(rows.length).toBe(0);
        });
    });

    it('должен получать одиночную строку по индексу', () => {
        const table = new EasyDataTable({
            columns: defaultColumns,
            rows: testData
        });
        
        return table.getRow(2).then(row => {
            expect(row).not.toBeNull();
            expect(row?.getValue('id')).toBe(3);
            expect(row?.getValue('name')).toBe('Bob');
        });
    });

    it('должен возвращать null при запросе несуществующей строки', () => {
        const table = new EasyDataTable({
            columns: defaultColumns,
            rows: testData
        });
        
        return table.getRow(10).then(row => {
            expect(row).toBeNull();
        });
    });

    it('должен загружать данные из DataLoader', () => {
        const loader = new MockDataLoader(testData, 10);
        const table = new EasyDataTable({
            columns: defaultColumns,
            loader: loader
        });
        
        return table.getRows({ offset: 0, limit: 2 }).then(rows => {
            expect(rows.length).toBe(2);
            expect(table.getTotal()).toBe(10);
            expect(table.getCachedCount()).toBe(4); // весь тестовый набор в кеше
            
            // Проверка кеширования
            return table.getRows({ offset: 2, limit: 2 }).then(moreRows => {
                expect(moreRows.length).toBe(2);
                expect(table.getCachedCount()).toBe(4);
            });
        });
    });

    it('должен работать с эластичными чанками', () => {
        const loader = new MockDataLoader(testData);
        const table = new EasyDataTable({
            chunkSize: 10,
            elasticChunks: true,
            loader: loader
        });
        
        return table.getRows({ offset: 0, limit: 2 }).then(() => {
            expect(table.getTotal()).toBe(4); // Всего 4 записи из тестовых данных
            expect(table.totalIsKnown()).toBe(true);
        });
    });

    it('должен обновлять chunkSize и очищать кеш', () => {
        const table = new EasyDataTable({
            chunkSize: 100,
            rows: testData
        });
        
        expect(table.chunkSize).toBe(100);
        expect(table.getCachedCount()).toBe(4);
        
        table.chunkSize = 50;
        
        expect(table.chunkSize).toBe(50);
        expect(table.getCachedCount()).toBe(0); // Кеш очищен
    });

    it('должен выполнять колбэк onUpdate при обновлении данных', () => {
        let updateCalled = false;
        let lastTable: EasyDataTable | undefined;
        
        const onUpdate = (table?: EasyDataTable) => {
            updateCalled = true;
            lastTable = table;
        };
        
        const table = new EasyDataTable({
            onUpdate: onUpdate
        });
        
        table.addRow([1, 'Test']);
        table.fireUpdated();
        
        expect(updateCalled).toBe(true);
        expect(lastTable).toBe(table);
    });

    it('должен очищать все данные при вызове clear', () => {
        const table = new EasyDataTable({
            columns: defaultColumns,
            rows: testData
        });
        
        expect(table.columns.count).toBe(3);
        expect(table.getCachedCount()).toBe(4);
        
        table.clear();
        
        expect(table.columns.count).toBe(0);
        expect(table.getCachedCount()).toBe(0);
        expect(table.getTotal()).toBe(0);
    });

    it('должен выбрасывать ошибку при запросе данных без loader', async () => {
        const table = new EasyDataTable();
        
        // Нет данных в кеше и нет loader
        try {
            await table.getRows({ offset: 0, limit: 10 });
            fail('Должна быть выброшена ошибка');
        } 
        catch (error) {
            expect(error).toContain('Loader is not defined');
        }
    });
    
    it('должен устанавливать общее количество строк вручную', () => {
        const table = new EasyDataTable();
        
        table.setTotal(100);
        
        expect(table.getTotal()).toBe(100);
        expect(table.totalIsKnown()).toBe(true);
    });
});
