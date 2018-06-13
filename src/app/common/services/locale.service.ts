import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LocaleService {

  currentLocale = 'en';
  get locale() {
    return this.currentLocale;
  }

  constructor(private translateService: TranslateService) {
    this.currentLocale = navigator.language.substr(0, 2);
  }
}
