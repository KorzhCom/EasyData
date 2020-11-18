import { i18n, MetaData } from '@easydata/core';
import { domel } from '@easydata/ui';

export class RootDataView {

    constructor (
        private slot: HTMLElement, 
        private metaData: MetaData, 
        private basePath: string) {

        this.slot.innerHTML = `<h1>${metaData.getId()}</h1>`;
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
                    .addText(i18n.getText('EntityMenuDesc'))
                )
                .addChild('ul', b => {
                    b.addClass('ed-entity-menu');
                    entities.forEach(ent => {
                        b.addChild('li', b => {
                            b.addClass('ed-entity-item')
                            .on('click', () => {
                                window.location.href = `${this.basePath}/${ent.id}`;
                            })
                            .addChild('div', b => {
                                b.addClass('ed-entity-item-caption')
                                .addText(ent.captionPlural || ent.caption);
                            });

                            if (ent.description) {
                                b.addChild('div', b => {
                                    b.addClass('ed-entity-item-descr')
                                    .addText(`*&nbsp;${ent.description}`);
                                });
                            }
                        });
                    });
                })
            );
        }
    }
}