import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { EasyDataViewDispatcher } from '@easydata/crud';

@Component({
  selector: 'app-easydata',
  template: '<div id="EasyDataContainer"></div>'
})
export class EasyDataComponent implements AfterViewInit, OnDestroy {

  private viewDispatcher: EasyDataViewDispatcher;

  constructor() {

  }

  ngAfterViewInit() {
    this.viewDispatcher = new EasyDataViewDispatcher();
    this.viewDispatcher.run();
  }

  ngOnDestroy() {
    this.viewDispatcher.detach();
  }
}
