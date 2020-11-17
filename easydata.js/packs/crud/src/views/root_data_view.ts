import { MetaData } from '@easydata/core';
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
                    .addClass('ed-entity-menu')
                    .addChild('ul', b => {
                        b.addClass('list-group')
                        entities.forEach(ent => {
                            b.addChild('li', b => {
                                b.addClass('list-group-item')
                                .on('click', () => {
                                    window.location.href = `${this.basePath}/${ent.id}`;
                                })
                                .addHtml(ent.captionPlural || ent.caption);

                                if (ent.description) {
                                    b.addHtml(`<span title="${ent.description}" class="ed-entity-info"></span>`);
                                }
                            });
                        });
                    })
                )
                .addChild('div', b => b
                    .addClass('ed-menu-description')
                    .addText('Click on an entity to view/edit its content')
                )
            );
        }
    }
}