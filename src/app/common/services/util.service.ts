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

}
