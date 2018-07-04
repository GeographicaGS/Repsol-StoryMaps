import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UtilService {

  constructor(
    private translateService: TranslateService
  ) { }

  getLocale() {
    if (this.translateService.getDefaultLang() !== 'es') {
      return 'en';
    }
    return 'es';
  }

  getBeginningOfDay(date) {
    const result = new Date(date.getTime());
    result.setUTCHours(0);
    result.setUTCMinutes(0);
    result.setUTCSeconds(0);
    result.setUTCMilliseconds(0);
    return result;
  }

}
