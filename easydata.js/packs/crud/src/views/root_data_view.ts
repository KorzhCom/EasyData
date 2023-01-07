import { i18n, MetaData, DataContext } from '@easydata/core';
import { domel } from '@easydata/ui';
import { setLocation } from '../utils/utils';

export class RootDataView {
    private metaData: MetaData;

    constructor (
        private slot: HTMLElement, 
        private context: DataContext, 
        private basePath: string) {

        this.metaData = this.context.getMetaData();
        this.slot.innerHTML += `<h1>${i18n.getText('RootViewTitle')}</h1>`;

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
                        b.addChild('li', b => {
                            b.addClass('ed-entity-item')
                            .on('click', () => {
                                setLocation(`${this.basePath}/${decodeURIComponent(ent.id)}`);
                            })
                            .addChild('div', b => {
                                b.addClass('ed-entity-item-caption')
                                .addText(ent.captionPlural || ent.caption);
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