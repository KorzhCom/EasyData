//types
export * from './types/data_type'
export * from './types/entity_attr_kind'
export * from './types/editor_tag'

//http
export * from './http/http_method'
export * from './http/http_request'
export * from './http/http_client'

//meta data dto
export * from './meta/dto/meta_data_dto'
export * from './meta/dto/meta_entity_dto'
export * from './meta/dto/value_editor_dto'

//meta data
export * from './meta/meta_data'
export * from './meta/meta_entity'
export * from './meta/value_editor'

//data
export * from './data/data_context'
export * from './data/data_column'
export * from './data/data_row'
export * from './data/easy_data_table'
export * from './data/data_loader'
export * from './data/easy_data_server_loader'
export * from './data/data_filter'
export * from './data/text_data_filter'
export * from './data/aggr_structures'
export * from './data/aggr_settings'

//event
export * from './event/event_emitter'

//i18n
export * from './i18n/i18n'

//utils
export * from './utils/easy_guid'
export * from './utils/string_utils'
export * from './utils/utils'
export * from './utils/liquid'

import './i18n/load_default_locale_settings'

if (typeof Object.values !== 'function') {
    Object.values = function (obj) {
        return Object.keys(obj).map(key => obj[key]);
    }
}

if (typeof Math.trunc !== 'function') {
    Math.trunc = function(x) {
        if (isNaN(x)) {
          return NaN;
        }
        if (x > 0) {
          return Math.floor(x);
        }
        return Math.ceil(x);
    };
}