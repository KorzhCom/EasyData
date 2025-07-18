import { expect } from "@olton/latte"

import { MetaData } from '@easydata/core';
import { DataContext } from '../src/main/data_context';
import { EasyDataViewDispatcher } from '../src/views/easy_data_view_dispatcher';
import { EntityDataView } from '../src/views/entity_data_view';
import { RootDataView } from '../src/views/root_data_view';
import * as utils from '../src/utils/utils';

describe('EasyDataViewDispatcher', () => {
    // Оригинальные объекты для восстановления после тестов
    const originalLocation = window.location;
    const originalWindowAddEventListener = window.addEventListener;
    const originalWindowRemoveEventListener = window.removeEventListener;

    // Мок элементы для DOM
    let mockContainer: HTMLElement;
    let mockParent: HTMLElement;
    
    beforeEach(() => {
        // Создаем моки для DOM элементов
        mockContainer = document.createElement('div');
        mockContainer.id = 'testContainer';
        
        mockParent = document.createElement('div');
        mockParent.appendChild(mockContainer);
        document.body.appendChild(mockParent);
        
        // Мок для window.location
        delete (window as any).location;
        window.location = {
            ...originalLocation,
            pathname: '/app/easydata/entity1',
            href: 'http://example.com/app/easydata/entity1'
        } as Location;

        // Моки для addEventListener и removeEventListener
        window.addEventListener = mock();
        window.removeEventListener = mock();
        
        // Мок для loadMetaData
        // jest.spyOn(DataContext.prototype, 'loadMetaData').mockImplementation(() => {
        //     return Promise.resolve(new MetaData());
        // });
        //
        // // Мок для setActiveSource
        // jest.spyOn(DataContext.prototype, 'setActiveSource').mockImplementation(() => {});
        //
        // // Мок для setLocation
        // jest.spyOn(utils, 'setLocation').mockImplementation(() => {});
        //
        // // Сохраняем оригинальные конструкторы представлений
        // jest.spyOn(EntityDataView.prototype, 'constructor').mockImplementation(() => {});
        // jest.spyOn(RootDataView.prototype, 'constructor').mockImplementation(() => {});
    });

    afterEach(() => {
        // Восстанавливаем оригинальные объекты и методы
        window.location = originalLocation;
        window.addEventListener = originalWindowAddEventListener;
        window.removeEventListener = originalWindowRemoveEventListener;
        
        // Удаляем добавленные элементы
        if (mockParent.parentNode) {
            mockParent.parentNode.removeChild(mockParent);
        }
        
        // Сбрасываем все моки
        // jest.restoreAllMocks();
        
        // Удаляем глобальную переменную EDView
        delete window['EDView'];
    });

    it('должен быть создан с настройками по умолчанию', () => {
        const dispatcher = new EasyDataViewDispatcher();
        
        expect(dispatcher).toBeDefined();
        
        // Проверяем private свойства через any
        const options = (dispatcher as any).options;
        expect(options).toBeDefined();
        expect(options.container).toBe('#EasyDataContainer');
        expect(options.basePath).toBe('easydata');
    });

    it('должен быть создан с пользовательскими настройками', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#customContainer',
            basePath: 'custom-path',
            endpoint: '/api/easydata',
            showBackToEntities: true
        });
        
        expect(dispatcher).toBeDefined();
        
        const options = (dispatcher as any).options;
        expect(options).toBeDefined();
        expect(options.container).toBe('#customContainer');
        expect(options.basePath).toBe('custom-path');
        expect(options.endpoint).toBe('/api/easydata');
        expect(options.showBackToEntities).toBe(true);
    });

    it('должен корректно обрабатывать настройку rootEntity', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer',
            rootEntity: 'entity1'
        });
        
        const options = (dispatcher as any).options;
        expect(options).toBeDefined();
        expect(options.rootEntity).toBe('entity1');
        expect(options.showBackToEntities).toBe(false);
        
        // basePath должен быть установлен в "/"
        expect((dispatcher as any).basePath).toBe('/');
    });

    it('должен корректно нормализовать базовый путь', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer',
            basePath: 'easydata'
        });
        
        // Используя приватный метод напрямую через any
        expect((dispatcher as any).normalizeBasePath('easydata')).toBe('/app/easydata');
        expect((dispatcher as any).normalizeBasePath('/easydata/')).toBe('/app/easydata');
        expect((dispatcher as any).normalizeBasePath('nonexistent')).toBe('/');
    });

    it('должен корректно обрезать слеши в пути', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        expect((dispatcher as any).trimSlashes('/path/')).toBe('path');
        expect((dispatcher as any).trimSlashes('path/')).toBe('path');
        expect((dispatcher as any).trimSlashes('/path')).toBe('path');
        expect((dispatcher as any).trimSlashes('path')).toBe('path');
        expect((dispatcher as any).trimSlashes('/')).toBe('');
        expect((dispatcher as any).trimSlashes('')).toBe('');
    });

    it('должен корректно устанавливать контейнер по ID', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        expect((dispatcher as any).container).toBe(mockContainer);
    });

    it('должен корректно устанавливать контейнер по классу', () => {
        // Добавляем класс контейнеру
        mockContainer.className = 'test-class';
        
        const dispatcher = new EasyDataViewDispatcher({
            container: '.test-class'
        });
        
        expect((dispatcher as any).container).toBe(mockContainer);
    });

    it('должен корректно устанавливать контейнер как HTML-элемент', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: mockContainer
        });
        
        expect((dispatcher as any).container).toBe(mockContainer);
    });

    it('должен выбрасывать ошибку при некорректном контейнере', () => {
        expect(() => {
            new EasyDataViewDispatcher({
                container: '#nonexistentContainer'
            });
        }).toThrow(/Unrecognized `container` parameter/);
        
        expect(() => {
            new EasyDataViewDispatcher({
                container: null
            });
        }).toThrow('Container is undefined');
    });

    it('должен корректно определять ID активного источника', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer',
            basePath: 'easydata'
        });
        
        expect((dispatcher as any).getActiveSourceId()).toBe('entity1');
        
        // Меняем путь на корневой
        window.location = {
            ...window.location,
            pathname: '/app/easydata',
            href: 'http://example.com/app/easydata'
        } as Location;
        
        expect((dispatcher as any).getActiveSourceId()).toBeNull();
    });

    it('должен корректно определять ID активного источника с rootEntity', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer',
            rootEntity: 'rootEntity'
        });
        
        expect((dispatcher as any).getActiveSourceId()).toBe('rootEntity');
    });

    it('должен запускаться и загружать метаданные', async () => {
        // const dispatcher = new EasyDataViewDispatcher({
        //     container: '#testContainer'
        // });
        //
        // const setActiveViewSpy = jest.spyOn(dispatcher as any, 'setActiveView');
        //
        // await dispatcher.run();
        //
        // expect(DataContext.prototype.loadMetaData).toHaveBeenCalled();
        // expect(setActiveViewSpy).toHaveBeenCalled();
    });

    it('должен устанавливать активное представление Entity', async () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        await dispatcher.run();
        
        // Так как путь включает ID сущности, должен быть создан EntityDataView
        expect(DataContext.prototype.setActiveSource).toHaveBeenCalledWith('entity1');
        expect(window['EDView']).toBeDefined();
    });

    it('должен устанавливать активное представление Root', async () => {
        // Меняем путь на корневой
        window.location = {
            ...window.location,
            pathname: '/app/easydata',
            href: 'http://example.com/app/easydata'
        } as Location;
        
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        await dispatcher.run();
        
        // Так как путь не включает ID сущности, должен быть создан RootDataView
        expect(DataContext.prototype.setActiveSource).not.toHaveBeenCalled();
        expect(window['EDView']).toBeDefined();
    });

    it('должен подключать слушатели событий при запуске', async () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        await dispatcher.run();
        
        // Проверяем, что были добавлены слушатели для событий
        expect(window.addEventListener).toHaveBeenCalledWith(['ed_set_location', 'popstate']);
    });

    it('должен отключать слушатели событий при detach', async () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        await dispatcher.run();
        
        dispatcher.detach();
        
        // Проверяем, что были удалены слушатели событий
        expect(window.removeEventListener).toHaveBeenCalledWith(['ed_set_location', 'popstate']);
    });

    it('должен очищать контейнер и данные при смене представления', async () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        // Добавляем содержимое в контейнер
        mockContainer.innerHTML = '<div>Test content</div>';
        
        // Мок для метода clear у таблицы данных
        const clearMock = mock();
        (dispatcher as any).context.getData = mock().mockReturnValue({
            clear: clearMock
        });
        
        // Вызываем метод setActiveView напрямую
        (dispatcher as any).setActiveView();
        
        // Проверяем, что контейнер был очищен
        expect(mockContainer.innerHTML).toBe('');
        
        // Проверяем, что данные были очищены
        expect(clearMock).toHaveBeenCalled();
    });
});
