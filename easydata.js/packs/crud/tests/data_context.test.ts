import { expect } from "@olton/latte"

import { 
    HttpClient, MetaData, HttpActionResult,
    EasyDataTable, DataType, DataColumnList, DataRow
} from '@easydata/core';

import { DataContext } from '../src/main/data_context';
import { TextDataFilter } from '../src/filter/text_data_filter';
import { EasyDataServerLoader } from '../src/main/easy_data_server_loader';

describe('DataContext', () => {
    let dataContext: DataContext;
    let mockHttpClient: HttpClient;
    let mockActionResult: HttpActionResult<any>;
    let processStartCount: number;
    let processEndCount: number;

    beforeEach(() => {
        // Создаем мок для HttpClient
        mockHttpClient = {
            get: mock(),
            post: mock(),
        } as unknown as HttpClient;

        // Создаем мок для HttpActionResult
        mockActionResult = {
            then: mock().mockImplementation((callback) => {
                callback({ 
                    model: { 
                        id: 'test-model', 
                        name: 'Test Model',
                        entroot: { 
                            name: 'Root',
                            attrs: [],
                            ents: [
                                { id: 'entity1', name: 'Entity1', attrs: [], ents: [] }
                            ]
                        }
                    }
                });
                return mockActionResult;
            }),
            catch: mock().mockImplementation((callback) => {
                return mockActionResult; 
            }),
            finally: mock().mockImplementation((callback) => {
                callback();
                return mockActionResult;
            })
        } as unknown as HttpActionResult<any>;

        (mockHttpClient.get as jest.Mock).mockReturnValue(mockActionResult);
        (mockHttpClient.post as jest.Mock).mockReturnValue(mockActionResult);

        // Счетчики для методов onProcessStart и onProcessEnd
        processStartCount = 0;
        processEndCount = 0;

        // Создаем экземпляр DataContext с моками
        dataContext = new DataContext({
            metaDataId: 'test-model',
            endpoint: '/api/test',
            onProcessStart: () => { processStartCount++; },
            onProcessEnd: () => { processEndCount++; }
        });

        // Подменяем HttpClient в DataContext на наш мок
        (dataContext as any).http = mockHttpClient;
    });

    it('должен инициализироваться с правильными значениями', () => {
        // Проверка базовых свойств
        const metaData = dataContext.getMetaData();
        expect(metaData).toBeInstanceOf(MetaData);
        expect(metaData.id).toBe('test-model');

        const data = dataContext.getData();
        expect(data).toBeInstanceOf(EasyDataTable);

        const dataLoader = dataContext.getDataLoader();
        expect(dataLoader).toBeInstanceOf(EasyDataServerLoader);
    });

    it('должен правильно настраивать эндпоинты по умолчанию', () => {
        // Проверка эндпоинтов по умолчанию
        expect(() => {
            const endpoint = dataContext.resolveEndpoint('GetMetaData');
            expect(endpoint).toBe('/api/test/models/test-model');
        }).not.toThrow();

        expect(() => {
            const endpoint = dataContext.resolveEndpoint('FetchDataset');
            // На данном этапе activeEntity не установлен, поэтому должна быть ошибка
            // Но сам эндпоинт должен существовать
        }).toThrow();
    });

    it('должен устанавливать и получать активную сущность', () => {
        // Загружаем метаданные
        dataContext.loadMetaData().then(() => {
            // Устанавливаем активную сущность
            dataContext.setActiveSource('entity1');
            
            // Проверяем, что активная сущность установлена
            const activeEntity = dataContext.getActiveEntity();
            expect(activeEntity).toBeDefined();
            expect(activeEntity.id).toBe('entity1');
        });
    });

    it('должен устанавливать кастомные эндпоинты', () => {
        // Устанавливаем кастомный эндпоинт
        dataContext.setEndpoint('GetMetaData', '/custom/api/metadata');
        
        // Проверяем что эндпоинт установлен
        const endpoint = dataContext.resolveEndpoint('GetMetaData');
        expect(endpoint).toBe('/custom/api/metadata');
    });

    it('не должен перезаписывать существующие эндпоинты при использовании setEnpointIfNotExist', () => {
        // Устанавливаем эндпоинт
        dataContext.setEndpoint('GetMetaData', '/custom/api/metadata');
        
        // Пытаемся установить другой эндпоинт через setEnpointIfNotExist
        dataContext.setEnpointIfNotExist('GetMetaData', '/another/endpoint');
        
        // Проверяем что эндпоинт не изменился
        const endpoint = dataContext.resolveEndpoint('GetMetaData');
        expect(endpoint).toBe('/custom/api/metadata');
    });

    it('должен разрешать эндпоинты с параметрами', () => {
        // Устанавливаем эндпоинт с параметрами
        dataContext.setEndpoint('CustomEndpoint', '/api/custom/{param1}/{param2}');
        
        // Разрешаем эндпоинт с параметрами
        const endpoint = dataContext.resolveEndpoint('CustomEndpoint', { param1: 'value1', param2: 'value2' });
        
        // Проверяем что параметры подставлены
        expect(endpoint).toBe('/api/custom/value1/value2');
    });

    it('должен выбрасывать ошибку при отсутствии обязательного параметра', () => {
        // Устанавливаем эндпоинт с параметрами
        dataContext.setEndpoint('CustomEndpoint', '/api/custom/{param1}/{param2}');
        
        // Пытаемся разрешить эндпоинт с отсутствующим параметром
        expect(() => {
            dataContext.resolveEndpoint('CustomEndpoint', { param1: 'value1' });
        }).toThrow('Parameter [param2] is not defined');
    });

    it('должен загружать метаданные', () => {
        const promise = dataContext.loadMetaData();
        
        // Проверяем что загрузка вызвала правильный метод HTTP клиента
        expect(mockHttpClient.get).toHaveBeenCalled();
        expect((mockHttpClient.get as jest.Mock).mock.calls[0][0]).toContain('/api/test/models/test-model');
        
        return promise.then((model) => {
            // Проверяем что модель была загружена
            expect(model).toBeDefined();
            expect(model.id).toBe('test-model');
            
            // Проверяем что были вызваны методы startProcess и endProcess
            expect(processStartCount).toBe(1);
            expect(processEndCount).toBe(1);
        });
    });

    it('должен создавать фильтр данных', () => {
        // Загружаем метаданные и устанавливаем активную сущность
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Создаем фильтр
                const filter = dataContext.createFilter();
                
                // Проверяем созданный фильтр
                expect(filter).toBeInstanceOf(TextDataFilter);
            });
    });

    it('должен загружать датасет', () => {
        // Настраиваем мок для loadChunk
        const mockData = new EasyDataTable();
        const mockColumns = new DataColumnList();
        mockColumns.add({ id: 'id', label: 'ID', type: DataType.Int32 });
        mockColumns.add({ id: 'name', label: 'Name', type: DataType.String });
        mockData.columns = mockColumns;
        mockData.addRow([1, 'Test']);
        
        const dataLoader = dataContext.getDataLoader() as EasyDataServerLoader;
        (dataLoader.loadChunk) = mock().mockResolvedValue({
            table: mockData,
            total: 1
        });
        
        // Загружаем метаданные и устанавливаем активную сущность
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Загружаем датасет
                return dataContext.fetchDataset();
            })
            .then((data) => {
                // Проверяем результат
                expect(data).toBeDefined();
                expect(data.columns.count).toBe(2);
                expect(data.getCachedCount()).toBe(1);
                
                // Проверяем что dataLoader.loadChunk был вызван
                expect(dataLoader.loadChunk).toHaveBeenCalled();
            });
    });

    it('должен получать запись', () => {
        // Загружаем метаданные и устанавливаем активную сущность
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Получаем запись
                return dataContext.fetchRecord({ id: 1 });
            })
            .then(() => {
                // Проверяем что был вызван правильный метод HTTP клиента
                expect(mockHttpClient.get).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.get).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/fetch');
                expect(lastCall[1].queryParams).toBeDefined();
                expect(lastCall[1].queryParams.id).toBe(1);
                
                // Проверяем что были вызваны методы startProcess и endProcess
                expect(processStartCount).toBeGreaterThan(0);
                expect(processEndCount).toBeGreaterThan(0);
            });
    });

    it('должен создавать запись', () => {
        // Загружаем метаданные и устанавливаем активную сущность
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Тестовый объект для создания
                const testObj = { name: 'Test Record', value: 123 };
                
                // Создаем запись
                return dataContext.createRecord(testObj);
            })
            .then(() => {
                // Проверяем что был вызван правильный метод HTTP клиента
                expect(mockHttpClient.post).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.post).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/create');
                expect(lastCall[1]).toBeDefined();
                expect(lastCall[1].name).toBe('Test Record');
                expect(lastCall[1].value).toBe(123);
                
                // Проверяем что были вызваны методы startProcess и endProcess
                expect(processStartCount).toBeGreaterThan(0);
                expect(processEndCount).toBeGreaterThan(0);
            });
    });

    it('должен обновлять запись', () => {
        // Загружаем метаданные и устанавливаем активную сущность
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Тестовый объект для обновления
                const testObj = { id: 1, name: 'Updated Record', value: 456 };
                
                // Обновляем запись
                return dataContext.updateRecord(testObj);
            })
            .then(() => {
                // Проверяем что был вызван правильный метод HTTP клиента
                expect(mockHttpClient.post).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.post).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/update');
                expect(lastCall[1]).toBeDefined();
                expect(lastCall[1].id).toBe(1);
                expect(lastCall[1].name).toBe('Updated Record');
                
                // Проверяем что были вызваны методы startProcess и endProcess
                expect(processStartCount).toBeGreaterThan(0);
                expect(processEndCount).toBeGreaterThan(0);
            });
    });

    it('должен удалять запись', () => {
        // Загружаем метаданные и устанавливаем активную сущность
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Тестовый объект для удаления
                const testObj = { id: 1 };
                
                // Удаляем запись
                return dataContext.deleteRecord(testObj);
            })
            .then(() => {
                // Проверяем что был вызван правильный метод HTTP клиента
                expect(mockHttpClient.post).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.post).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/delete');
                expect(lastCall[1]).toBeDefined();
                expect(lastCall[1].id).toBe(1);
                
                // Проверяем что были вызваны методы startProcess и endProcess
                expect(processStartCount).toBeGreaterThan(0);
                expect(processEndCount).toBeGreaterThan(0);
            });
    });

    it('должен возвращать HttpClient', () => {
        const httpClient = dataContext.getHttpClient();
        expect(httpClient).toBe(mockHttpClient);
    });
});
