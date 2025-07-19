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
        // Create mock for HttpClient
        mockHttpClient = {
            get: mock(),
            post: mock(),
        } as unknown as HttpClient;

        // Create mock for HttpActionResult
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

        // Counters for onProcessStart and onProcessEnd methods
        processStartCount = 0;
        processEndCount = 0;

        // Create DataContext instance with mocks
        dataContext = new DataContext({
            metaDataId: 'test-model',
            endpoint: '/api/test',
            onProcessStart: () => { processStartCount++; },
            onProcessEnd: () => { processEndCount++; }
        });

        // Replace HttpClient in DataContext with our mock
        (dataContext as any).http = mockHttpClient;
    });

    it('should initialize with correct values', () => {
        // Check basic properties
        const metaData = dataContext.getMetaData();
        expect(metaData).toBeInstanceOf(MetaData);
        expect(metaData.id).toBe('test-model');

        const data = dataContext.getData();
        expect(data).toBeInstanceOf(EasyDataTable);

        const dataLoader = dataContext.getDataLoader();
        expect(dataLoader).toBeInstanceOf(EasyDataServerLoader);
    });

    it('should correctly set default endpoints', () => {
        // Check default endpoints
        expect(() => {
            const endpoint = dataContext.resolveEndpoint('GetMetaData');
            expect(endpoint).toBe('/api/test/models/test-model');
        }).not.toThrow();

        expect(() => {
            const endpoint = dataContext.resolveEndpoint('FetchDataset');
            // At this stage activeEntity is not set, so there should be an error
            // But the endpoint itself should exist
        }).toThrow();
    });

    it('should set and get active entity', () => {
        // Load metadata
        dataContext.loadMetaData().then(() => {
            // Set active entity
            dataContext.setActiveSource('entity1');
            
            // Check, что активная сущность установлена
            const activeEntity = dataContext.getActiveEntity();
            expect(activeEntity).toBeDefined();
            expect(activeEntity.id).toBe('entity1');
        });
    });

    it('should set custom endpoints', () => {
        // Set кастомный эндпоинт
        dataContext.setEndpoint('GetMetaData', '/custom/api/metadata');
        
        // Check что эндпоинт установлен
        const endpoint = dataContext.resolveEndpoint('GetMetaData');
        expect(endpoint).toBe('/custom/api/metadata');
    });

    it('should not overwrite existing endpoints when using setEndpointIfNotExist', () => {
        // Set эндпоинт
        dataContext.setEndpoint('GetMetaData', '/custom/api/metadata');
        
        // Пытаемся установить другой эндпоинт через setEnpointIfNotExist
        dataContext.setEnpointIfNotExist('GetMetaData', '/another/endpoint');
        
        // Check что эндпоинт не изменился
        const endpoint = dataContext.resolveEndpoint('GetMetaData');
        expect(endpoint).toBe('/custom/api/metadata');
    });

    it('should resolve endpoints with parameters', () => {
        // Set эндпоинт с параметрами
        dataContext.setEndpoint('CustomEndpoint', '/api/custom/{param1}/{param2}');
        
        // Разрешаем эндпоинт с параметрами
        const endpoint = dataContext.resolveEndpoint('CustomEndpoint', { param1: 'value1', param2: 'value2' });
        
        // Check что параметры подставлены
        expect(endpoint).toBe('/api/custom/value1/value2');
    });

    it('should throw error when required parameter is missing', () => {
        // Set эндпоинт с параметрами
        dataContext.setEndpoint('CustomEndpoint', '/api/custom/{param1}/{param2}');
        
        // Пытаемся разрешить эндпоинт с отсутствующим параметром
        expect(() => {
            dataContext.resolveEndpoint('CustomEndpoint', { param1: 'value1' });
        }).toThrow('Parameter [param2] is not defined');
    });

    it('should load metadata', () => {
        const promise = dataContext.loadMetaData();
        
        // Check что загрузка вызвала правильный метод HTTP клиента
        expect(mockHttpClient.get).toHaveBeenCalled();
        expect((mockHttpClient.get as jest.Mock).mock.calls[0][0]).toContain('/api/test/models/test-model');
        
        return promise.then((model) => {
            // Check что модель была загружена
            expect(model).toBeDefined();
            expect(model.id).toBe('test-model');
            
            // Check что были вызваны методы startProcess и endProcess
            expect(processStartCount).toBe(1);
            expect(processEndCount).toBe(1);
        });
    });

    it('should create data filter', () => {
        // Load metadata and set active entity
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Создаем фильтр
                const filter = dataContext.createFilter();
                
                // Check созданный фильтр
                expect(filter).toBeInstanceOf(TextDataFilter);
            });
    });

    it('should load dataset', () => {
        // Configure mock for loadChunk
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
        
        // Load metadata and set active entity
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Загружаем датасет
                return dataContext.fetchDataset();
            })
            .then((data) => {
                // Check результат
                expect(data).toBeDefined();
                expect(data.columns.count).toBe(2);
                expect(data.getCachedCount()).toBe(1);
                
                // Check что dataLoader.loadChunk был вызван
                expect(dataLoader.loadChunk).toHaveBeenCalled();
            });
    });

    it('should get record', () => {
        // Load metadata and set active entity
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Get запись
                return dataContext.fetchRecord({ id: 1 });
            })
            .then(() => {
                // Check что был вызван правильный метод HTTP клиента
                expect(mockHttpClient.get).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.get).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/fetch');
                expect(lastCall[1].queryParams).toBeDefined();
                expect(lastCall[1].queryParams.id).toBe(1);
                
                // Check что были вызваны методы startProcess и endProcess
                expect(processStartCount).toBeGreaterThan(0);
                expect(processEndCount).toBeGreaterThan(0);
            });
    });

    it('should create record', () => {
        // Load metadata and set active entity
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Test object for creation
                const testObj = { name: 'Test Record', value: 123 };
                
                // Создаем запись
                return dataContext.createRecord(testObj);
            })
            .then(() => {
                // Check что был вызван правильный метод HTTP клиента
                expect(mockHttpClient.post).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.post).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/create');
                expect(lastCall[1]).toBeDefined();
                expect(lastCall[1].name).toBe('Test Record');
                expect(lastCall[1].value).toBe(123);
                
                // Check что были вызваны методы startProcess и endProcess
                expect(processStartCount).toBeGreaterThan(0);
                expect(processEndCount).toBeGreaterThan(0);
            });
    });

    it('should update record', () => {
        // Load metadata and set active entity
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Test object for update
                const testObj = { id: 1, name: 'Updated Record', value: 456 };
                
                // Обновляем запись
                return dataContext.updateRecord(testObj);
            })
            .then(() => {
                // Check что был вызван правильный метод HTTP клиента
                expect(mockHttpClient.post).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.post).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/update');
                expect(lastCall[1]).toBeDefined();
                expect(lastCall[1].id).toBe(1);
                expect(lastCall[1].name).toBe('Updated Record');
                
                // Check что были вызваны методы startProcess и endProcess
                expect(processStartCount).toBeGreaterThan(0);
                expect(processEndCount).toBeGreaterThan(0);
            });
    });

    it('should delete record', () => {
        // Load metadata and set active entity
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Test object for deletion
                const testObj = { id: 1 };
                
                // Remove запись
                return dataContext.deleteRecord(testObj);
            })
            .then(() => {
                // Check что был вызван правильный метод HTTP клиента
                expect(mockHttpClient.post).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.post).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/delete');
                expect(lastCall[1]).toBeDefined();
                expect(lastCall[1].id).toBe(1);
                
                // Check что были вызваны методы startProcess и endProcess
                expect(processStartCount).toBeGreaterThan(0);
                expect(processEndCount).toBeGreaterThan(0);
            });
    });

    it('should return HttpClient', () => {
        const httpClient = dataContext.getHttpClient();
        expect(httpClient).toBe(mockHttpClient);
    });
});
