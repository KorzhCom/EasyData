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
            
            // Check that active entity is set
            const activeEntity = dataContext.getActiveEntity();
            expect(activeEntity).toBeDefined();
            expect(activeEntity.id).toBe('entity1');
        });
    });

    it('should set custom endpoints', () => {
        // Set custom endpoint
        dataContext.setEndpoint('GetMetaData', '/custom/api/metadata');
        
        // Check that endpoint is set
        const endpoint = dataContext.resolveEndpoint('GetMetaData');
        expect(endpoint).toBe('/custom/api/metadata');
    });

    it('should not overwrite existing endpoints when using setEndpointIfNotExist', () => {
        // Set endpoint
        dataContext.setEndpoint('GetMetaData', '/custom/api/metadata');
        
        // Try to set another endpoint via setEnpointIfNotExist
        dataContext.setEnpointIfNotExist('GetMetaData', '/another/endpoint');
        
        // Check that endpoint hasn't changed
        const endpoint = dataContext.resolveEndpoint('GetMetaData');
        expect(endpoint).toBe('/custom/api/metadata');
    });

    it('should resolve endpoints with parameters', () => {
        // Set endpoint with parameters
        dataContext.setEndpoint('CustomEndpoint', '/api/custom/{param1}/{param2}');
        
        // Resolve endpoint with parameters
        const endpoint = dataContext.resolveEndpoint('CustomEndpoint', { param1: 'value1', param2: 'value2' });
        
        // Check that parameters are substituted
        expect(endpoint).toBe('/api/custom/value1/value2');
    });

    it('should throw error when required parameter is missing', () => {
        // Set endpoint with parameters
        dataContext.setEndpoint('CustomEndpoint', '/api/custom/{param1}/{param2}');
        
        // Try to resolve endpoint with missing parameter
        expect(() => {
            dataContext.resolveEndpoint('CustomEndpoint', { param1: 'value1' });
        }).toThrow('Parameter [param2] is not defined');
    });

    it('should load metadata', () => {
        const promise = dataContext.loadMetaData();
        
        // Check that loading called the correct HTTP client method
        expect(mockHttpClient.get).toHaveBeenCalled();
        expect((mockHttpClient.get as jest.Mock).mock.calls[0][0]).toContain('/api/test/models/test-model');
        
        return promise.then((model) => {
            // Check that model was loaded
            expect(model).toBeDefined();
            expect(model.id).toBe('test-model');
            
            // Check that startProcess and endProcess methods were called
            expect(processStartCount).toBe(1);
            expect(processEndCount).toBe(1);
        });
    });

    it('should create data filter', () => {
        // Load metadata and set active entity
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Create filter
                const filter = dataContext.createFilter();
                
                // Check created filter
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
                
                // Load dataset
                return dataContext.fetchDataset();
            })
            .then((data) => {
                // Check result
                expect(data).toBeDefined();
                expect(data.columns.count).toBe(2);
                expect(data.getCachedCount()).toBe(1);
                
                // Check that dataLoader.loadChunk was called
                expect(dataLoader.loadChunk).toHaveBeenCalled();
            });
    });

    it('should get record', () => {
        // Load metadata and set active entity
        return dataContext.loadMetaData()
            .then(() => {
                dataContext.setActiveSource('entity1');
                
                // Get record
                return dataContext.fetchRecord({ id: 1 });
            })
            .then(() => {
                // Check that correct HTTP client method was called
                expect(mockHttpClient.get).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.get).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/fetch');
                expect(lastCall[1].queryParams).toBeDefined();
                expect(lastCall[1].queryParams.id).toBe(1);
                
                // Check that startProcess and endProcess methods were called
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
                
                // Create record
                return dataContext.createRecord(testObj);
            })
            .then(() => {
                // Check that the correct HTTP client method was called
                expect(mockHttpClient.post).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.post).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/create');
                expect(lastCall[1]).toBeDefined();
                expect(lastCall[1].name).toBe('Test Record');
                expect(lastCall[1].value).toBe(123);
                
                // Check that startProcess and endProcess methods were called
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
                
                // Update record
                return dataContext.updateRecord(testObj);
            })
            .then(() => {
                // Check that the correct HTTP client method was called
                expect(mockHttpClient.post).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.post).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/update');
                expect(lastCall[1]).toBeDefined();
                expect(lastCall[1].id).toBe(1);
                expect(lastCall[1].name).toBe('Updated Record');
                
                // Check that startProcess and endProcess methods were called
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
                
                // Remove record
                return dataContext.deleteRecord(testObj);
            })
            .then(() => {
                // Check that the correct HTTP client method was called
                expect(mockHttpClient.post).toHaveBeenCalled();
                
                const lastCall = (mockHttpClient.post).mock.calls.pop();
                expect(lastCall[0]).toContain('/api/test/models/test-model/sources/entity1/delete');
                expect(lastCall[1]).toBeDefined();
                expect(lastCall[1].id).toBe(1);
                
                // Check that startProcess and endProcess methods were called
                expect(processStartCount).toBeGreaterThan(0);
                expect(processEndCount).toBeGreaterThan(0);
            });
    });

    it('should return HttpClient', () => {
        const httpClient = dataContext.getHttpClient();
        expect(httpClient).toBe(mockHttpClient);
    });
});
