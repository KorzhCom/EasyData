"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@easydata/core");
var ui_1 = require("@easydata/ui");
var core_2 = require("@easyquery/core");
var ui_2 = require("@easyquery/ui");
var EasyDataView = /** @class */ (function () {
    function EasyDataView() {
        var _this = this;
        this.endpoint = '/api/easydata';
        this.dlg = new ui_1.DefaultDialogService();
        this.http = new core_2.HttpClient();
        this.basePath = this.getBasePath();
        this.model = new core_2.DataModel();
        this.resultTable = new core_1.EasyDataTable();
        this.http.get(this.endpoint + "/models/EasyData")
            .then(function (result) {
            if (result.model) {
                _this.model.loadFromData(result.model);
            }
            _this.activeEntity = _this.getActiveEntity();
            _this.renderEntitySelector();
            if (_this.activeEntity) {
                _this.renderGrid();
            }
        });
    }
    EasyDataView.prototype.getActiveEntity = function () {
        var decodedUrl = decodeURIComponent(window.location.href);
        var splitIndex = decodedUrl.lastIndexOf('/');
        var typeName = decodedUrl.substring(splitIndex + 1);
        return typeName && typeName.toLocaleLowerCase() !== 'easydata'
            ? this.model.getRootEntity().subEntities
                .filter(function (e) { return e.id == typeName; })[0]
            : null;
    };
    EasyDataView.prototype.getBasePath = function () {
        var decodedUrl = decodeURIComponent(window.location.href);
        var easyDataIndex = decodedUrl.indexOf('easydata');
        return decodedUrl.substring(0, easyDataIndex + 'easydata'.length);
    };
    EasyDataView.prototype.renderEntitySelector = function () {
        var _this = this;
        var entities = this.model.getRootEntity().subEntities;
        var entityListSlot = document.getElementById('EntityList');
        if (entityListSlot) {
            var ul = document.createElement('ul');
            ul.className = 'list-group';
            entityListSlot.appendChild(ul);
            var _loop_1 = function (entity) {
                var li = document.createElement('li');
                li.className = 'list-group-item';
                if (entity === this_1.activeEntity) {
                    li.classList.add('active');
                }
                li.addEventListener('click', function () {
                    window.location.href = _this.basePath + "/" + entity.id;
                });
                li.innerHTML = entity.caption;
                ul.appendChild(li);
            };
            var this_1 = this;
            for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
                var entity = entities_1[_i];
                _loop_1(entity);
            }
        }
    };
    EasyDataView.prototype.renderGrid = function () {
        var _this = this;
        var url = this.endpoint + "/models/" + this.model.getId() + "/crud/" + this.activeEntity.id;
        this.http.get(url)
            .then(function (result) {
            if (result.resultSet) {
                _this.resultTable.clear();
                var resultSet = result.resultSet;
                for (var _i = 0, _a = resultSet.cols; _i < _a.length; _i++) {
                    var col = _a[_i];
                    _this.resultTable.columns.add(col);
                }
                _this.resultTable.setTotal(resultSet.rows.length);
                for (var _b = 0, _c = resultSet.rows; _b < _c.length; _b++) {
                    var row = _c[_b];
                    _this.resultTable.addRow(row);
                }
            }
            var gridSlot = document.getElementById('Grid');
            _this.grid = new ui_1.EasyGrid({
                slot: gridSlot,
                dataTable: _this.resultTable,
                paging: {
                    enabled: false,
                },
                addColumns: true,
                onAddColumnClick: _this.addClickHandler.bind(_this),
                onGetCellRenderer: _this.manageCellRenderer.bind(_this)
            });
            _this.grid.refresh();
        });
    };
    EasyDataView.prototype.manageCellRenderer = function (column, defaultRenderer) {
        var _this = this;
        if (column.isRowNum) {
            column.width = 100;
            return function (value, column, cell) {
                ui_1.domel('div', cell)
                    .addClass("keg-cell-value")
                    .addChild('a', function (b) { return b
                    .attr('href', 'javascript:void(0)')
                    .text('Edit')
                    .on('click', function (ev) { return _this.editClickHandler(ev, cell); }); })
                    .addChild('span', function (b) { return b.text(' | '); })
                    .addChild('a', function (b) { return b
                    .attr('href', 'javascript:void(0)')
                    .text('Delete')
                    .on('click', function (ev) { return _this.deleteClickHandler(ev, cell); }); });
            };
        }
    };
    EasyDataView.prototype.addClickHandler = function () {
        var _this = this;
        var form = this.generateEditForm({ entity: this.activeEntity, editPK: true });
        this.dlg.open({
            title: "Create " + this.activeEntity.caption,
            body: form,
            onSubmit: function () {
                var obj = {};
                var inputs = Array.from(form.querySelectorAll('input'));
                for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
                    var input = inputs_1[_i];
                    var property = input.name.substring(input.name.lastIndexOf('.') + 1);
                    var value = (input.type == 'date' || input.type == 'time')
                        ? input.valueAsDate
                        : (input.type == 'number')
                            ? input.valueAsNumber
                            : input.type == 'checkbox'
                                ? input.checked
                                : input.value;
                    obj[property] = value;
                }
                var url = _this.endpoint + "/models/" + _this.model.getId() +
                    ("/crud/" + _this.activeEntity.id);
                _this.http.post(url, obj, { dataType: 'json' })
                    .then(function () {
                    window.location.reload();
                })
                    .catch(function (error) {
                    _this.dlg.open({
                        title: 'Ooops, smth went wrong',
                        body: error.message,
                        closable: true,
                        cancelable: false
                    });
                });
            }
        });
    };
    EasyDataView.prototype.editClickHandler = function (ev, cell) {
        var _this = this;
        var rowEl = cell.parentElement;
        var index = Number.parseInt(rowEl.getAttribute('data-row-idx'));
        this.resultTable.getRow(index)
            .then(function (row) {
            if (row) {
                var form_1 = _this.generateEditForm({ entity: _this.activeEntity, values: row });
                _this.dlg.open({
                    title: "Edit " + _this.activeEntity.caption,
                    body: form_1,
                    onSubmit: function () {
                        var keyAttrs = _this.activeEntity.attributes.filter(function (attr) { return attr.isPrimaryKey; });
                        var keys = keyAttrs.map(function (attr) { return row.getValue(attr.id); });
                        var obj = {};
                        var inputs = Array.from(form_1.querySelectorAll('input, select'));
                        for (var _i = 0, inputs_2 = inputs; _i < inputs_2.length; _i++) {
                            var input = inputs_2[_i];
                            var property = input.name.substring(input.name.lastIndexOf('.') + 1);
                            var value = (input.type == 'date' || input.type == 'time')
                                ? input.valueAsDate
                                : (input.type == 'number')
                                    ? input.valueAsNumber
                                    : input.type == 'checkbox'
                                        ? input.checked
                                        : input.value;
                            obj[property] = value;
                        }
                        var url = "/api/easydata/models/" + _this.model.getId() +
                            ("/crud/" + _this.activeEntity.id + "/" + keys.join(':'));
                        _this.http.put(url, obj, { dataType: 'json' })
                            .then(function () {
                            window.location.reload();
                        })
                            .catch(function (error) {
                            _this.dlg.open({
                                title: 'Ooops, smth went wrong',
                                body: error.message,
                                closable: true,
                                cancelable: false
                            });
                        });
                    }
                });
            }
        });
    };
    EasyDataView.prototype.deleteClickHandler = function (ev, cell) {
        var _this = this;
        var rowEl = cell.parentElement;
        var index = Number.parseInt(rowEl.getAttribute('data-row-idx'));
        this.resultTable.getRow(index)
            .then(function (row) {
            if (row) {
                var keyAttrs = _this.activeEntity.attributes.filter(function (attr) { return attr.isPrimaryKey; });
                var keys_1 = keyAttrs.map(function (attr) { return row.getValue(attr.id); });
                var entityId = keyAttrs.map(function (attr, index) { return attr.id + ":" + keys_1[index]; }).join(';');
                _this.dlg.openConfirm("Delete " + _this.activeEntity.caption, "Are you shure about removing this entity: [" + entityId + "]?")
                    .then(function (result) {
                    if (result) {
                        var url = _this.endpoint + "/models/" + _this.model.getId() +
                            ("/crud/" + _this.activeEntity.id + "/" + keys_1.join(':')); //pass entityId in future
                        _this.http.delete(url).then(function () {
                            window.location.reload();
                        })
                            .catch(function (error) {
                            _this.dlg.open({
                                title: 'Ooops, smth went wrong',
                                body: error.message,
                                closable: true,
                                cancelable: false
                            });
                        });
                    }
                });
            }
        });
    };
    EasyDataView.prototype.generateEditForm = function (params) {
        var isIE = ui_1.browserUtils.IsIE();
        var fb;
        var form = ui_1.domel('div')
            .addClass('kfrm-form')
            .addChild('div', function (b) {
            b.addClass("" + (isIE
                ? 'kfrm-fields-ie col-ie-1-4 label-align-right'
                : 'kfrm-fields col-a-1 label-align-right'));
            fb = b;
        })
            .toDOM();
        if (ui_1.browserUtils.IsIE()) {
            fb = ui_1.domel('div', fb.toDOM())
                .addClass('kfrm-field-ie');
        }
        var getInputType = function (dataType) {
            if (dataType == core_1.DataType.Bool) {
                return 'checkbox';
            }
            if (core_1.utils.isNumericType(dataType)) {
                return 'number';
            }
            if (dataType == core_1.DataType.Date
                || dataType == core_1.DataType.DateTime) {
                return 'date';
            }
            if (dataType == core_1.DataType.Time) {
                return 'time';
            }
            return 'text';
        };
        var getEditor = function (attr) {
            return attr.defaultEditor || new core_2.ValueEditor();
        };
        var addFormField = function (parent, attr) {
            var value = params.values
                ? params.values.getValue(attr.id)
                : undefined;
            var editor = getEditor(attr);
            if (editor.tag == core_2.EditorTag.Unknown) {
                if ([core_1.DataType.Date, core_1.DataType.DateTime, core_1.DataType.Time].indexOf(attr.dataType) >= 0) {
                    editor.tag = core_2.EditorTag.DateTime;
                }
                else {
                    editor.tag = core_2.EditorTag.Edit;
                }
            }
            ui_1.domel(parent)
                .addChild('label', function (b) { return b
                .attr('for', attr.id)
                .addText(attr.caption + ": "); });
            switch (editor.tag) {
                case core_2.EditorTag.DateTime:
                    ui_1.domel(parent)
                        .addChild('input', function (b) {
                        b.name(attr.id);
                        b.type(getInputType(attr.dataType));
                        b.value(value);
                        b.on('focus', function (ev) {
                            var inputEl = ev.target;
                            var oldValue = inputEl.valueAsDate;
                            var pickerOptions = {
                                showCalendar: attr.dataType !== core_1.DataType.Time,
                                showTimePicker: attr.dataType !== core_1.DataType.Date,
                                onApply: function (dateTime) {
                                    inputEl.valueAsDate = dateTime;
                                },
                                onCancel: function () {
                                    inputEl.valueAsDate = oldValue;
                                },
                                onDateTimeChanged: function (dateTime) {
                                    inputEl.valueAsDate = dateTime;
                                }
                            };
                            var dtp = new ui_2.DefaultDateTimePicker(pickerOptions);
                            dtp.setDateTime(oldValue);
                            dtp.show(inputEl);
                        });
                    });
                    break;
                case core_2.EditorTag.List:
                    ui_1.domel(parent)
                        .addChild('select', function (b) {
                        b
                            .attr('name', attr.id);
                        if (editor.values) {
                            for (var i = 0; i < editor.values.length; i++) {
                                b.addOption({
                                    value: value.id,
                                    title: value.text,
                                    selected: i === 0
                                });
                            }
                        }
                    });
                case core_2.EditorTag.Edit:
                default:
                    ui_1.domel(parent)
                        .addChild('input', function (b) {
                        b
                            .name(attr.id)
                            .type(getInputType(attr.dataType));
                        if (value) {
                            if (attr.dataType == core_1.DataType.Bool)
                                b.attr('checked', '');
                            else
                                b.value(value);
                        }
                    });
                    break;
            }
        };
        for (var _i = 0, _a = params.entity.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            if (attr.isPrimaryKey && !params.editPK)
                continue;
            addFormField(fb.toDOM(), attr);
        }
        return form;
    };
    return EasyDataView;
}());
window.addEventListener('load', function () {
    window['easydata'] = new EasyDataView();
});
