import { MetaData, MetaEntity, i18n } from '@easydata/core';
import { DataContext } from '../src/main/data_context';
import { RootDataView } from '../src/views/root_data_view';
import * as utils from '../src/utils/utils';

describe('RootDataView', () => {
    // Моки для DOM и объектов
    let mockSlot: HTMLElement;
    let mockContext: DataContext;
    let mockMetaData: MetaData;
    let mockRootEntity: MetaEntity;
    let view: RootDataView;

    // Тестовые сущности
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
        // Создаем DOM-элемент для слота
        mockSlot = document.createElement('div');
        document.body.appendChild(mockSlot);

        // Мок для корневой сущности
        mockRootEntity = {
            subEntities: mockEntities
        } as unknown as MetaEntity;

        // Мок для метаданных
        mockMetaData = {
            getRootEntity: mock().mockReturnValue(mockRootEntity),
            isEmpty: mock().mockReturnValue(false)
        } as unknown as MetaData;

        // Мок для контекста данных
        mockContext = {
            getMetaData: mock().mockReturnValue(mockMetaData)
        } as unknown as DataContext;

        // Мок для i18n
        jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
            if (key === 'RootViewTitle') return 'Entities';
            if (key === 'EntityMenuDesc') return 'Select an entity from the list below';
            if (key === 'ModelIsEmpty') return 'The model is empty';
            return key;
        });

        // Мок для функции setLocation
        jest.spyOn(utils, 'setLocation').mockImplementation(() => {});
    });

    afterEach(() => {
        // Удаляем добавленные элементы
        if (mockSlot.parentNode) {
            mockSlot.parentNode.removeChild(mockSlot);
        }

        // Сбрасываем моки
        jest.restoreAllMocks();
    });

    it('должен создаваться с правильными настройками по умолчанию', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Проверяем, что контекст и метаданные установлены
        expect((view as any).context).toBe(mockContext);
        expect((view as any).metaData).toBe(mockMetaData);
        
        // Проверяем опции по умолчанию
        const options = (view as any).options;
        expect(options).toBeObject();
        expect(options.usePluralNames).toBe(true);
    });

    it('должен применять пользовательские настройки', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath', {
            usePluralNames: false
        });
        
        // Проверяем пользовательские опции
        const options = (view as any).options;
        expect(options).toBeObject();
        expect(options.usePluralNames).toBe(false);
    });

    it('должен рендерить заголовок', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Проверяем, что заголовок содержит текст
        const header = mockSlot.querySelector('h1');
        expect(header).toBeDefined();
        expect(header.textContent).toBe('Entities');
    });

    it('должен рендерить список сущностей', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Проверяем, что есть описание меню
        const menuDescription = mockSlot.querySelector('.ed-menu-description');
        expect(menuDescription).toBeDefined();
        expect(menuDescription.textContent).toBe('Select an entity from the list below');
        
        // Проверяем, что есть список сущностей
        const entityMenu = mockSlot.querySelector('.ed-entity-menu');
        expect(entityMenu).toBeDefined();
        
        // Проверяем количество элементов в списке
        const entityItems = entityMenu.querySelectorAll('.ed-entity-item');
        expect(entityItems.length).toBe(3);
    });

    it('должен использовать множественные имена сущностей, когда usePluralNames=true', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath', {
            usePluralNames: true
        });
        
        // Проверяем, что используются множественные имена
        const entityItems = mockSlot.querySelectorAll('.ed-entity-item-caption');
        expect(entityItems[0].textContent).toBe('Customers');
        expect(entityItems[1].textContent).toBe('Products');
        expect(entityItems[2].textContent).toBe('Orders');
    });

    it('должен использовать обычные имена сущностей, когда usePluralNames=false', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath', {
            usePluralNames: false
        });
        
        // Проверяем, что используются обычные имена
        const entityItems = mockSlot.querySelectorAll('.ed-entity-item-caption');
        expect(entityItems[0].textContent).toBe('Customer');
        expect(entityItems[1].textContent).toBe('Product');
        expect(entityItems[2].textContent).toBe('Order');
    });

    it('должен отображать описания сущностей', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Проверяем, что описания отображаются
        const descriptionItems = mockSlot.querySelectorAll('.ed-entity-item-descr');
        
        // Должно быть 2 описания (у entity2 нет описания)
        expect(descriptionItems.length).toBe(2);
        expect(descriptionItems[0].textContent).toBe('Customer entity description');
        expect(descriptionItems[1].textContent).toBe('Order entity description');
    });

    it('должен обрабатывать клик по сущности', () => {
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Получаем первый элемент списка
        const firstEntityItem = mockSlot.querySelector('.ed-entity-item');
        
        // Эмулируем клик
        firstEntityItem.click();
        
        // Проверяем, что setLocation был вызван с правильными параметрами
        expect(utils.setLocation).toHaveBeenCalledWith('/basePath/entity1');
    });

    it('должен отображать сообщение, если модель пуста', () => {
        // Меняем мок, чтобы метаданные были пустыми
        (mockMetaData.isEmpty as jest.Mock).mockReturnValue(true);
        (mockRootEntity.subEntities as any) = [];
        
        view = new RootDataView(mockSlot, mockContext, '/basePath');
        
        // Проверяем, что отображается сообщение о пустой модели
        const menuDescription = mockSlot.querySelector('.ed-menu-description');
        expect(menuDescription).toBeDefined();
        expect(menuDescription.textContent).toBe('The model is empty');
        
        // Проверяем, что список сущностей пуст
        const entityItems = mockSlot.querySelectorAll('.ed-entity-item');
        expect(entityItems.length).toBe(0);
    });

    it('должен корректно декодировать ID сущностей при навигации', () => {
        // Создаем сущность с ID, требующим кодирования
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
        
        // Получаем элемент списка
        const entityItem = mockSlot.querySelector('.ed-entity-item');
        
        // Эмулируем клик
        entityItem.click();
        
        // Проверяем, что setLocation был вызван с декодированным ID
        expect(utils.setLocation).toHaveBeenCalledWith('/basePath/entity with space');
    });
});
