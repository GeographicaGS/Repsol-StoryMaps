import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class StoryMapService {

  private currentData = new Subject<any>();
  currentData$ = this.currentData.asObservable();

  constructor() { }

  setCurrentData(data) {
    this.currentData.next(data);
  }

}
