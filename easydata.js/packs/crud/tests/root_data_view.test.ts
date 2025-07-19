import { MetaData, MetaEntity, i18n } from '@easydata/core';
import { DataContext } from '../src/main/data_context';
import { RootDataView } from '../src/views/root_data_view';
import * as utils from '../src/utils/utils';

describe('RootDataView', () => {
    // Mocks for DOM and objects
    let mockSlot: HTMLElement;
    let mockContext: DataContext;
    let mockMetaData: MetaData;
    let mockRootEntity: MetaEntity;
    let view: RootDataView;

    // Test entities
    const mockEntities = [
        {
            id: 'entity1',
            name: 'Entity1',
            caption: 'Customer',
            captionPlural: 'Customers',
            description: 'Customer entity description'
        },
        {
            id: 'entity2',
            name: 'Entity2',
            caption: 'Product',
            captionPlural: 'Products',
            description: null
        },
        {
            id: 'entity3',
            name: 'Entity3',
            caption: 'Order',
            captionPlural: 'Orders',
            description: 'Order entity description'
        }
    ];

    beforeEach(() => {
        // Create DOM element for slot
        mockSlot = document.createElement('div');
        document.body.appendChild(mockSlot);

        // Mock for root entity
        mockRootEntity = {
            subEntities: mockEntities
        } as unknown as MetaEntity;

        // Mock for metadata
        mockMetaData = {
            getRootEntity: mock().mockReturnValue(mockRootEntity),
            isEmpty: mock().mockReturnValue(false)
        } as unknown as MetaData;

        // Mock for data context
        mockContext = {
            getMetaData: mock().mockReturnValue(mockMetaData)
        } as unknown as DataContext;

        // Mock for i18n
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'RootViewTitle') return 'Entities';
            if (key === 'EntityMenuDesc') return 'Select an entity from the list below';
            if (key === 'ModelIsEmpty') return 'The model is empty';
            return key;
        });

        // Mock for setLocation function
        jest.spyOn(utils, 'setLocation').mockImplementation(() => {});
    });

    afterEach(() => {
        // Remove added elements
        if (mockSlot.parentNode) {
            mockSlot.parentNode.removeChild(mockSlot);
        }

        // Reset mocks
        jest.restoreAllMocks();
    });

    it('should be created with correct default settings', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Check that context and metadata are set
        expect((view as any).context).toBe(mockContext);
        expect((view as any).metaData).toBe(mockMetaData);
        
        // Check default options
        const options = (view as any).options;
        expect(options).toBeObject();
        expect(options.usePluralNames).toBe(true);
    });

    it('should apply custom settings', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath', {
            usePluralNames: false
        });
        
        // Check custom options
        const options = (view as any).options;
        expect(options).toBeObject();
        expect(options.usePluralNames).toBe(false);
    });

    it('should render title', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Check that title contains text
        const header = mockSlot.querySelector('h1');
        expect(header).toBeDefined();
        expect(header.textContent).toBe('Entities');
    });

    it('should render entity list', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Check that menu description exists
        const menuDescription = mockSlot.querySelector('.ed-menu-description');
        expect(menuDescription).toBeDefined();
        expect(menuDescription.textContent).toBe('Select an entity from the list below');
        
        // Check that entity list exists
        const entityMenu = mockSlot.querySelector('.ed-entity-menu');
        expect(entityMenu).toBeDefined();
        
        // Check number of elements in list
        const entityItems = entityMenu.querySelectorAll('.ed-entity-item');
        expect(entityItems.length).toBe(3);
    });

    it('should use plural entity names when usePluralNames=true', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath', {
            usePluralNames: true
        });
        
        // Check that plural names are used
        const entityItems = mockSlot.querySelectorAll('.ed-entity-item-caption');
        expect(entityItems[0].textContent).toBe('Customers');
        expect(entityItems[1].textContent).toBe('Products');
        expect(entityItems[2].textContent).toBe('Orders');
    });

    it('should use regular entity names when usePluralNames=false', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath', {
            usePluralNames: false
        });
        
        // Check that regular names are used
        const entityItems = mockSlot.querySelectorAll('.ed-entity-item-caption');
        expect(entityItems[0].textContent).toBe('Customer');
        expect(entityItems[1].textContent).toBe('Product');
        expect(entityItems[2].textContent).toBe('Order');
    });

    it('should display entity descriptions', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Check that descriptions are displayed
        const descriptionItems = mockSlot.querySelectorAll('.ed-entity-item-descr');
        
        // Should be 2 descriptions (entity2 has no description)
        expect(descriptionItems.length).toBe(2);
        expect(descriptionItems[0].textContent).toBe('Customer entity description');
        expect(descriptionItems[1].textContent).toBe('Order entity description');
    });

    it('should handle entity click', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Get first list element
        const firstEntityItem = mockSlot.querySelector('.ed-entity-item');
        
        // Emulate click
        firstEntityItem.click();
        
        // Check that setLocation was called with correct parameters
        expect(utils.setLocation).toHaveBeenCalledWith('/basePath/entity1');
    });

    it('should display message if model is empty', () => {
        // Change mock so metadata is empty
        (mockMetaData.isEmpty as jest.Mock).mockReturnValue(true);
        (mockRootEntity.subEntities as any) = [];
        
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Check that empty model message is displayed
        const menuDescription = mockSlot.querySelector('.ed-menu-description');
        expect(menuDescription).toBeDefined();
        expect(menuDescription.textContent).toBe('The model is empty');
        
        // Check that entity list is empty
        const entityItems = mockSlot.querySelectorAll('.ed-entity-item');
        expect(entityItems.length).toBe(0);
    });

    it('should correctly decode entity IDs during navigation', () => {
        // Create entity с ID, требующим кодирования
        const encodedEntity = {
            id: 'entity%20with%20space',
            name: 'EncodedEntity',
            caption: 'Encoded Entity',
            captionPlural: 'Encoded Entities',
            description: null
        };
        
        // Добавляем эту сущность в список
        (mockRootEntity.subEntities as any) = [encodedEntity];
        
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Get элемент списка
        const entityItem = mockSlot.querySelector('.ed-entity-item');
        
        // Emulate клик
        entityItem.click();
        
        // Check, что setLocation был вызван с декодированным ID
        expect(utils.setLocation).toHaveBeenCalledWith('/basePath/entity with space');
    });
});
