import { i18n, utils, MetaData } from '@easydata/core';
import { domel } from '@easydata/ui';
import { setLocation } from '../utils/utils';
import { DataContext } from '../main/data_context';

export interface RootDataViewOptions {
    usePluralNames?: boolean;
}

export class RootDataView {
    private metaData: MetaData;
    private options: RootDataViewOptions = {
        usePluralNames: true
    }

    constructor (
        private slot: HTMLElement, 
        private context: DataContext, 
        private basePath: string,
        options?: RootDataViewOptions) 
    {
        this.metaData = this.context.getMetaData();
        this.slot.innerHTML += `<h1>${i18n.getText('RootViewTitle')}</h1>`;
        utils.assign(this.options, options);

        this.renderEntitySelector();
    }

    private renderEntitySelector() {
        const entities = this.metaData.getRootEntity().subEntities;
        if (this.slot) {
            domel(this.slot)
            .addChild('div', b => b
                .addClass('ed-root')
                .addChild('div', b => b
                    .addClass('ed-menu-description')
                    .addText(i18n.getText(!this.metaData.isEmpty() ? 'EntityMenuDesc' : 'ModelIsEmpty'))
                )
                .addChild('ul', b => {
                    b.addClass('ed-entity-menu');
                    entities.forEach(ent => {
                        const entCaption = this.options.usePluralNames && ent.captionPlural 
                                            ? ent.captionPlural 
                                            : ent.caption;

                        b.addChild('li', b => {
                            b.addClass('ed-entity-item')
                            .on('click', () => {
                                setLocation(`${this.basePath}/${decodeURIComponent(ent.id)}`);
                            })
                            .addChild('div', b => {
                                b.addClass('ed-entity-item-caption')
                                .addText(entCaption);
                            });

                            if (ent.description) {
                                b.addChild('div', b => {
                                    b.addClass('ed-entity-item-descr')
                                    .addText(`${ent.description}`);
                                });
                            }
                        });
                    });
                })
            );
        }
    }
}