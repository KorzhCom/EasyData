import { AfterViewInit, Component, OnDestroy, Inject } from '@angular/core';
import { EasyDataViewDispatcher } from '@easydata/crud';

@Component({
  selector: 'app-easydata',
  template: '<div id="EasyDataContainer"></div>'
})
export class EasyDataComponent implements AfterViewInit, OnDestroy {

  private viewDispatcher: EasyDataViewDispatcher | undefined;

  constructor(@Inject('BASE_URL') private baseUrl: string) {}

  ngAfterViewInit() {
    this.viewDispatcher = new EasyDataViewDispatcher({
      endpoint: `${this.baseUrl}api/easydata`
    });
    this.viewDispatcher.run();
  }

  ngOnDestroy() {
    this.viewDispatcher?.detach();
  }
}
