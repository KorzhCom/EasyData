import { expect } from "@olton/latte"

import { 
    DataColumnList, DataRow, DataType, EasyDataTable, 
    MetaData, MetaEntity, MetaEntityAttr, i18n 
} from '@easydata/core';

import { 
    DefaultDialogService, DialogService, 
    EasyGrid, GridCellRenderer, GridColumn 
} from '@easydata/ui';

import { DataContext } from '../src/main/data_context';
import { EntityDataView } from '../src/views/entity_data_view';
import { TextFilterWidget } from '../src/widgets/text_filter_widget';
import * as utils from '../src/utils/utils';

describe('EntityDataView', () => {
    // Моки для DOM и объектов
    let mockSlot: HTMLElement;
    let mockContext: DataContext;
    let mockDialogService: DialogService;
    let mockGrid: EasyGrid;
    let mockEntity: MetaEntity;
    let mockMetaData: MetaData;
    let mockDataTable: EasyDataTable;
    let mockFilterWidget: TextFilterWidget;
    let view: EntityDataView;

    // Вспомогательная функция для создания мока атрибута
    function createMockAttr(id: string, options: any = {}): MetaEntityAttr {
        return {
            id,
            caption: options.caption || id,
            dataType: options.dataType || DataType.String,
            isPrimaryKey: options.isPrimaryKey || false,
            showOnView: options.showOnView !== undefined ? options.showOnView : true
        } as MetaEntityAttr;
    }

    beforeEach(() => {
        // Мок для HTMLElement
        mockSlot = document.createElement('div');
        document.body.appendChild(mockSlot);

        // Мок для атрибутов сущности
        const mockAttrs = [
            createMockAttr('Entity.id', { caption: 'ID', dataType: DataType.Int32, isPrimaryKey: true }),
            createMockAttr('Entity.name', { caption: 'Name', dataType: DataType.String }),
            createMockAttr('Entity.description', { caption: 'Description', dataType: DataType.String }),
            createMockAttr('Entity.active', { caption: 'Active', dataType: DataType.Bool })
        ];

        // Мок для сущности
        mockEntity = {
            id: 'Entity',
            name: 'Entity',
            caption: 'Entity',
            captionPlural: 'Entities',
            attributes: mockAttrs,
            isEditable: true,
            getPrimaryAttrs: mock().mockReturnValue([mockAttrs[0]])
        } as unknown as MetaEntity;

        // Мок для метаданных
        mockMetaData = {
            getAttributeById: (id: string) => mockAttrs.find(attr => attr.id === id) || null
        } as unknown as MetaData;

        // Мок для колонок данных
        const mockColumns = new DataColumnList();
        mockColumns.add({ id: 'Entity.id', label: 'ID', type: DataType.Int32 });
        mockColumns.add({ id: 'Entity.name', label: 'Name', type: DataType.String });
        mockColumns.add({ id: 'Entity.description', label: 'Description', type: DataType.String });
        mockColumns.add({ id: 'Entity.active', label: 'Active', type: DataType.Bool });

        // Мок для таблицы данных
        mockDataTable = {
            columns: mockColumns,
            getRow: mock().mockImplementation((rowIndex: number) => {
                if (rowIndex === 0) {
                    return Promise.resolve({
                        getValue: (id: string) => {
                            if (id === 'Entity.id') return 1;
                            if (id === 'Entity.name') return 'Test Name';
                            if (id === 'Entity.description') return 'Test Description';
                            if (id === 'Entity.active') return true;
                            return null;
                        }
                    } as DataRow);
                }
                return Promise.resolve(null);
            }),
            getCachedRows: mock().mockReturnValue([])
        } as unknown as EasyDataTable;

        // Мок для контекста данных
        mockContext = {
            getMetaData: mock().mockReturnValue(mockMetaData),
            getActiveEntity: mock().mockReturnValue(mockEntity),
            fetchDataset: mock().mockResolvedValue(mockDataTable),
            createFilter: mock(),
            createRecord: mock().mockResolvedValue({}),
            updateRecord: mock().mockResolvedValue({}),
            deleteRecord: mock().mockResolvedValue({})
        } as unknown as DataContext;

        // Мок для диалогового сервиса
        mockDialogService = {
            open: mock().mockReturnValue({
                submit: mock()
            }),
            openConfirm: mock().mockResolvedValue(true)
        } as unknown as DialogService;
        // jest.spyOn(DefaultDialogService.prototype, 'constructor').mockImplementation(() => {});
        // jest.spyOn(DefaultDialogService.prototype, 'open').mockImplementation(
        //     (options) => mockDialogService.open(options)
        // );
        // jest.spyOn(DefaultDialogService.prototype, 'openConfirm').mockImplementation(
        //     (title, message) => mockDialogService.openConfirm(title, message)
        // );

        // Мок для EasyGrid
        mockGrid = {
            refresh: mock(),
            getData: mock().mockReturnValue(mockDataTable)
        } as unknown as EasyGrid;
        // jest.spyOn(EasyGrid.prototype, 'constructor').mockImplementation(() => {});
        Object.defineProperty(EasyGrid, 'prototype', {
            value: mockGrid,
            writable: true
        });

        // Мок для TextFilterWidget
        mockFilterWidget = {
            applyFilter: mock().mockReturnValue(true)
        } as unknown as TextFilterWidget;
        // jest.spyOn(TextFilterWidget.prototype, 'constructor').mockImplementation(() => {});
        // jest.spyOn(TextFilterWidget.prototype, 'applyFilter').mockImplementation(
        //     (refresh) => mockFilterWidget.applyFilter(refresh)
        // );

        // Мок для i18n
        // jest.spyOn(i18n, 'getText').mockImplementation((key: string) => {
        //     if (key === 'BackToEntities') return 'Back to Entities';
        //     if (key === 'AddRecordBtnTitle') return 'Add Record';
        //     if (key === 'EditBtn') return 'Edit';
        //     if (key === 'DeleteBtn') return 'Delete';
        //     if (key === 'AddDlgCaption') return 'Add {entity}';
        //     if (key === 'EditDlgCaption') return 'Edit {entity}';
        //     if (key === 'DeleteDlgCaption') return 'Delete {entity}';
        //     if (key === 'DeleteDlgMessage') return 'Delete record with ID: {recordId}';
        //     return key;
        // });
        //
        // // Мок для utils.setLocation
        // jest.spyOn(utils, 'setLocation').mockImplementation(() => {});
    });

    afterEach(() => {
        // Удаляем добавленные элементы
        if (mockSlot.parentNode) {
            mockSlot.parentNode.removeChild(mockSlot);
        }

        // Сбрасываем моки
        // jest.restoreAllMocks();
    });

    it('должен создаваться с правильными настройками по умолчанию', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Проверяем, что контекст установлен
        expect((view as any).context).toBe(mockContext);
        
        // Проверяем, что базовый путь установлен
        expect((view as any).basePath).toBe('/basePath');
        
        // Проверяем опции по умолчанию
        const options = (view as any).options;
        expect(options).toBeDefined();
        expect(options.showFilterBox).toBe(true);
        expect(options.showBackToEntities).toBe(true);
    });

    it('должен рендерить заголовок и кнопку возврата', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Проверяем, что заголовок содержит название сущности
        expect(mockSlot.innerHTML).toContain('<h1>Entities</h1>');
        
        // Проверяем наличие кнопки возврата
        const backLink = mockSlot.querySelector('a');
        expect(backLink).toBeDefined();
        expect(backLink.textContent).toBe('← Back to Entities');
        
        // Проверяем, что обработчик клика установлен
        const clickEvent = new MouseEvent('click');
        const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');
        backLink.dispatchEvent(clickEvent);
        
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(utils.setLocation).toHaveBeenCalledWith('/basePath');
    });

    it('не должен рендерить кнопку возврата если showBackToEntities=false', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', { showBackToEntities: false });
        
        // Проверяем отсутствие кнопки возврата
        const backLink = mockSlot.querySelector('a');
        expect(backLink).toBeNull();
    });

    it('должен вызывать fetchDataset и создавать грид', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Проверяем, что fetchDataset был вызван
        expect(mockContext.fetchDataset).toHaveBeenCalled();
    });

    it('должен создавать фильтр если showFilterBox=true', () => {
        // Подменяем setTimeout, чтобы дождаться асинхронных операций
        jest.useFakeTimers();
        
        view = new EntityDataView(mockSlot, mockContext, '/basePath', { showFilterBox: true });
        
        jest.runAllTimers();
        
        // Проверяем создание фильтра
        expect(mockContext.createFilter).toHaveBeenCalled();
    });

    it('не должен создавать фильтр если showFilterBox=false', () => {
        jest.useFakeTimers();
        
        view = new EntityDataView(mockSlot, mockContext, '/basePath', { showFilterBox: false });
        
        jest.runAllTimers();
        
        // Проверяем что фильтр не создается
        expect(mockContext.createFilter).not.toHaveBeenCalled();
    });

    it('должен правильно обрабатывать клик по кнопке добавления', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Напрямую вызываем обработчик клика кнопки добавления
        (view as any).addClickHandler();
        
        // Проверяем вызов диалога
        expect(mockDialogService.open).toHaveBeenCalled();
        const openArgs = (mockDialogService.open as jest.Mock).mock.calls[0][0];
        expect(openArgs).toBeObject();
        expect(openArgs.title).toBe('Add Entity');
    });

    it('должен правильно обрабатывать клик по кнопке редактирования', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Напрямую вызываем обработчик клика кнопки редактирования
        (view as any).editClickHandler(new MouseEvent('click'), 0);
        
        // Проверяем вызов getRow
        expect(mockDataTable.getRow).toHaveBeenCalledWith(0);
        
        // Проверяем что диалог редактирования открывается
        return mockDataTable.getRow(0).then(() => {
            expect(mockDialogService.open).toHaveBeenCalled();
            const openArgs = (mockDialogService.open as jest.Mock).mock.calls[0][0];
            expect(openArgs).toBeObject();
            expect(openArgs.title).toBe('Edit Entity');
        });
    });

    it('должен правильно обрабатывать клик по кнопке удаления', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Напрямую вызываем обработчик клика кнопки удаления
        (view as any).deleteClickHandler(new MouseEvent('click'), 0);
        
        // Проверяем вызов getRow
        expect(mockDataTable.getRow).toHaveBeenCalledWith(0);
        
        // Проверяем открытие диалога подтверждения
        return mockDataTable.getRow(0).then(() => {
            expect(mockDialogService.openConfirm).toHaveBeenCalled();
            
            // Проверяем вызов deleteRecord после подтверждения
            return mockDialogService.openConfirm("", "").then(() => {
                expect(mockContext.deleteRecord).toHaveBeenCalledWith({ id: 1 });
            });
        });
    });

    it('должен обновлять данные после операций CRUD', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Подменяем filterWidget
        (view as any).filterWidget = mockFilterWidget;
        
        // Напрямую вызываем refreshData
        return (view as any).refreshData().then(() => {
            // Проверяем вызов fetchDataset
            expect(mockContext.fetchDataset).toHaveBeenCalled();
            
            // Проверяем применение фильтра
            expect(mockFilterWidget.applyFilter).toHaveBeenCalledWith(false);
        });
    });

    it('должен обновлять грид, если фильтр не применен', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Подменяем filterWidget с флагом что фильтр не был применен
        (view as any).filterWidget = {
            applyFilter: mock().mockReturnValue(false)
        };
        
        // Напрямую вызываем refreshData
        return (view as any).refreshData().then(() => {
            // Проверяем вызов refresh у грида
            expect(mockGrid.refresh).toHaveBeenCalled();
        });
    });

    it('должен корректно обрабатывать ошибки', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Создаем ошибку
        const error = new Error('Test error');
        
        // Напрямую вызываем обработчик ошибок
        (view as any).processError(error);
        
        // Проверяем открытие диалога с ошибкой
        expect(mockDialogService.open).toHaveBeenCalled();
        const openArgs = (mockDialogService.open as jest.Mock).mock.calls[0][0];
        expect(openArgs).toBeObject();
        expect(openArgs.title).toBe('Ooops, something went wrong');
        expect(openArgs.body).toBe('Test error');
    });

    it('должен корректно управлять рендерером ячеек', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Создаем колонку с номером строки
        const column: GridColumn = {
            isRowNum: true
        } as GridColumn;
        
        // Создаем мок для defaultRenderer
        const defaultRenderer = mock() as GridCellRenderer;
        
        // Вызываем метод manageCellRenderer
        const renderer = (view as any).manageCellRenderer(column, defaultRenderer);
        
        // Проверяем, что возвращается функция рендерера
        expect(typeof renderer).toBe('function');
        
        // Проверяем, что ширина колонки установлена
        expect(column.width).toBe(110);
        
        // Подготавливаем элементы для проверки рендерера
        const cell = document.createElement('div');
        const rowEl = document.createElement('tr');
        rowEl.setAttribute('data-row-idx', '0');
        
        // Вызываем рендерер
        renderer('value', column, cell, rowEl);
        
        // Проверяем, что в ячейке появились кнопки Edit и Delete
        expect(cell.innerHTML).toContain('Edit');
        expect(cell.innerHTML).toContain('Delete');
    });

    it('должен синхронизировать видимость колонок грида с метаданными', () => {
        view = new EntityDataView(mockSlot, mockContext, '/basePath', {});
        
        // Создаем колонку с dataColumn
        const column: GridColumn = {
            dataColumn: {
                id: 'Entity.name'
            }
        } as GridColumn;
        
        // Устанавливаем showOnView в false для атрибута
        const attr = mockMetaData.getAttributeById('Entity.name');
        attr.showOnView = false;
        
        // Вызываем метод syncGridColumnHandler
        (view as any).syncGridColumnHandler(column);
        
        // Проверяем, что видимость колонки установлена в соответствии с showOnView атрибута
        expect(column.isVisible).toBe(false);
    });

    it('должен выбрасывать ошибку если активная сущность не найдена', () => {
        // Подменяем getActiveEntity, чтобы вернуть null
        (mockContext.getActiveEntity as jest.Mock).mockReturnValue(null);
        
        // Проверяем, что конструктор выбрасывает ошибку
        expect(() => {
            new EntityDataView(mockSlot, mockContext, '/basePath', {});
        }).toThrow("Can't find active entity for " + window.location.pathname);
    });
});
