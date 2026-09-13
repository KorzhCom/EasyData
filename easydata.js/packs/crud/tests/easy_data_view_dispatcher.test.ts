import { expect } from "@olton/latte"

import { MetaData } from '@easydata/core';
import { DataContext } from '../src/main/data_context';
import { EasyDataViewDispatcher } from '../src/views/easy_data_view_dispatcher';
import { restoreAllMocks, spyOn, stubSetLocation } from './helpers/mocks';
import { thrownMessage } from './helpers/errors';

describe('EasyDataViewDispatcher', () => {
    // Original URL for restoration after tests
    const originalUrl = window.location.href;

    // The test DOM doesn't allow replacing window.location, so change the path in place
    const setPath = (path: string) => window.history.replaceState(null, '', path);

    // Mock elements for DOM
    let mockContainer: HTMLElement;
    let mockParent: HTMLElement;
    
    beforeEach(() => {
        // Create mocks for DOM elements
        mockContainer = document.createElement('div');
        mockContainer.id = 'testContainer';
        
        mockParent = document.createElement('div');
        mockParent.appendChild(mockContainer);
        document.body.appendChild(mockParent);
        
        // Mock for window.location
        setPath('/app/easydata/entity1');

        // Mocks for addEventListener and removeEventListener
        spyOn(window, 'addEventListener').mockImplementation(() => {});
        spyOn(window, 'removeEventListener').mockImplementation(() => {});
        
        // Mock for loadMetaData
        spyOn(DataContext.prototype, 'loadMetaData').mockImplementation(() => {
            return Promise.resolve(new MetaData());
        });

        // Mock for setActiveSource
        spyOn(DataContext.prototype, 'setActiveSource').mockImplementation(() => {});

        // Mocks for the active entity and its data, used by the EntityDataView the dispatcher creates
        spyOn(DataContext.prototype, 'getActiveEntity').mockReturnValue({
            id: 'entity1',
            caption: 'Entity 1',
            captionPlural: 'Entities 1',
            attributes: [],
            isEditable: false
        });
        spyOn(DataContext.prototype, 'fetchDataset').mockImplementation(() => new Promise(() => {}));

        // Mock for setLocation
        stubSetLocation();
    });

    afterEach(() => {
        // Restore original location
        setPath(originalUrl);
        
        // Remove added elements
        if (mockParent.parentNode) {
            mockParent.parentNode.removeChild(mockParent);
        }
        
        // Reset all mocks
        restoreAllMocks();
        
        // Remove global EDView variable
        delete window['EDView'];
    });

    it('should be created with default settings', () => {
        // The default container
        mockContainer.id = 'EasyDataContainer';

        const dispatcher = new EasyDataViewDispatcher();
        
        expect(dispatcher).toBeDefined();
        
        // Check private properties through any
        const options = (dispatcher as any).options;
        expect(options).toBeDefined();
        expect(options.container).toBe('#EasyDataContainer');
        expect(options.basePath).toBe('easydata');
    });

    it('should be created with custom settings', () => {
        mockContainer.id = 'customContainer';

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

    it('should correctly handle rootEntity configuration', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer',
            rootEntity: 'entity1'
        });
        
        const options = (dispatcher as any).options;
        expect(options).toBeDefined();
        expect(options.rootEntity).toBe('entity1');
        expect(options.showBackToEntities).toBe(false);
        
        // basePath should be set to "/"
        expect((dispatcher as any).basePath).toBe('/');
    });

    it('should correctly normalize base path', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer',
            basePath: 'easydata'
        });
        
        // Using private method directly through any
        expect((dispatcher as any).normalizeBasePath('easydata')).toBe('/app/easydata');
        expect((dispatcher as any).normalizeBasePath('/easydata/')).toBe('/app/easydata');
        expect((dispatcher as any).normalizeBasePath('nonexistent')).toBe('/');
    });

    it('should correctly trim slashes in path', () => {
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

    it('should correctly set container by ID', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        expect((dispatcher as any).container).toBe(mockContainer);
    });

    it('should correctly set container by class', () => {
        // Add class to container
        mockContainer.className = 'test-class';
        
        const dispatcher = new EasyDataViewDispatcher({
            container: '.test-class'
        });
        
        expect((dispatcher as any).container).toBe(mockContainer);
    });

    it('should correctly set container as HTML element', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: mockContainer
        });
        
        expect((dispatcher as any).container).toBe(mockContainer);
    });

    it('should throw error with incorrect container', () => {
        expect(thrownMessage(() => {
            new EasyDataViewDispatcher({
                container: '#nonexistentContainer'
            });
        })).toMatch(/Unrecognized `container` parameter/);
        
        expect(thrownMessage(() => {
            new EasyDataViewDispatcher({
                container: null
            });
        })).toBe('Container is undefined');
    });

    it('should correctly determine active source ID', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer',
            basePath: 'easydata'
        });
        
        expect((dispatcher as any).getActiveSourceId()).toBe('entity1');
        
        // Change path to root
        setPath('/app/easydata');
        
        expect((dispatcher as any).getActiveSourceId()).toBeNull();
    });

    it('should correctly determine active source ID with rootEntity', () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer',
            rootEntity: 'rootEntity'
        });
        
        expect((dispatcher as any).getActiveSourceId()).toBe('rootEntity');
    });

    it('should start and load metadata', async () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });

        const setActiveViewSpy = spyOn(dispatcher as any, 'setActiveView');

        await dispatcher.run();

        expect(DataContext.prototype.loadMetaData).toHaveBeenCalled();
        expect(setActiveViewSpy).toHaveBeenCalled();
    });

    it('should set active Entity view', async () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        await dispatcher.run();
        
        // Since path includes entity ID, EntityDataView should be created
        expect(DataContext.prototype.setActiveSource).toHaveBeenCalledWith(['entity1']);
        expect(window['EDView']).toBeDefined();
    });

    it('should set active Root view', async () => {
        // Change path to root
        setPath('/app/easydata');
        
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        await dispatcher.run();
        
        // Since path does not include entity ID, RootDataView should be created
        expect(DataContext.prototype.setActiveSource).not.toHaveBeenCalled();
        expect(window['EDView']).toBeDefined();
    });

    it('should connect event listeners on startup', async () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        await dispatcher.run();
        
        // Check that event listeners were added
        const onSetLocation = (dispatcher as any).onSetLocation;
        expect(window.addEventListener).toHaveBeenCalledWith(['ed_set_location', onSetLocation]);
        expect(window.addEventListener).toHaveBeenCalledWith(['popstate', onSetLocation]);
    });

    it('should remove event listeners on detach', async () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        await dispatcher.run();
        
        dispatcher.detach();
        
        // Check that event listeners were removed
        const onSetLocation = (dispatcher as any).onSetLocation;
        expect(window.removeEventListener).toHaveBeenCalledWith(['ed_set_location', onSetLocation]);
        expect(window.removeEventListener).toHaveBeenCalledWith(['popstate', onSetLocation]);
    });

    it('should clear container and data on view change', async () => {
        const dispatcher = new EasyDataViewDispatcher({
            container: '#testContainer'
        });
        
        // Add content to container
        mockContainer.innerHTML = '<div>Test content</div>';
        
        // Mock for data table clear method
        const clearMock = mock();
        (dispatcher as any).context.getData = mock(() => ({
            clear: clearMock
        }));
        
        // Call setActiveView method directly
        (dispatcher as any).setActiveView();
        
        // Check that the old content is gone (the new view renders into the container)
        expect(mockContainer.innerHTML).not.toContain('Test content');
        
        // Check that data was cleared
        expect(clearMock).toHaveBeenCalled();
    });
});
